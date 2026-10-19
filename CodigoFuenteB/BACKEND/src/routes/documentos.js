const express = require("express");
const multer = require("multer");
const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const delayMiddleware = require("../middleware/delay");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "inseguro";

// Configurar multer para almacenar en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png"
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF, JPG o PNG"), false);
    }
  },
});

function getUserFromAuthHeader(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const token = auth.substring(7);
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireRole(req, allowedRoles) {
  const authUser = getUserFromAuthHeader(req);
  if (!authUser) {
    return Promise.resolve({ error: "No autorizado", status: 401 });
  }
  
  return pool.query(
    `SELECT r.nombre 
     FROM usuario_roles ur
     JOIN roles r ON r.id = ur.rol_id
     WHERE ur.usuario_id = $1`,
    [authUser.usuarioId]
  ).then(result => {
    const userRoles = result.rows.map(r => r.nombre);
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return { error: "No autorizado", status: 403 };
    }
    return { authUser, userRoles };
  }).catch(err => {
    return { error: "Error al verificar roles", status: 500 };
  });
}

// Subir documento de examen (médico y admin)
router.post("/", delayMiddleware(5000), upload.single("documento"), async (req, res) => {
  try {
    const authCheck = await requireRole(req, ["medico", "admin"]);
    if (authCheck.error) {
      return res.status(authCheck.status).json({
        error: authCheck.error,
        glosa: "No tiene permisos para realizar esta acción",
      });
    }
    const { authUser } = authCheck;

    const { examen_medico_id, paciente_id } = req.body;

    if (!examen_medico_id || !paciente_id) {
      return res.status(400).json({
        error: "Error de validación",
        glosa: "examen_medico_id y paciente_id son requeridos",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Error de validación",
        glosa: "Debe subir un documento",
      });
    }

    const result = await pool.query(
      `INSERT INTO documentos_examen (
        examen_medico_id, paciente_id, documento, nombre_archivo
      ) VALUES ($1, $2, $3, $4) RETURNING id, nombre_archivo, created_at`,
      [examen_medico_id, paciente_id, req.file.buffer, req.file.originalname]
    );

    const documento = result.rows[0];

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `DOCUMENTOS_CREAR: subió documento "${documento.nombre_archivo}" para examen ID ${examen_medico_id}`,
      ]
    );

    res.status(201).json({ documento });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al subir documentos",
      glosa: err.message || err.toString(),
    });
  }
});

// Obtener documentos de un examen (médico, admin y paciente)
router.get("/examen/:examen_id", async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Verificar roles
    const userRolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuario_roles ur
       JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = $1`,
      [authUser.usuarioId]
    );
    const userRoles = userRolesResult.rows.map(r => r.nombre);

    // Si es paciente, verificar que el examen sea suyo
    if (userRoles.includes("paciente")) {
      const examenResult = await pool.query(
        `SELECT em.paciente_id, p.usuario_id 
         FROM examen_medico em
         JOIN pacientes p ON p.id = em.paciente_id
         WHERE em.id = $1`,
        [req.params.examen_id]
      );
      if (examenResult.rows.length === 0 || 
          examenResult.rows[0].usuario_id !== authUser.usuarioId) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "Solo puede ver sus propios documentos",
        });
      }
    } else if (!userRoles.includes("medico") && !userRoles.includes("admin")) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    const result = await pool.query(
      `SELECT id, nombre_archivo, created_at
       FROM documentos_examen
       WHERE examen_medico_id = $1
       ORDER BY created_at DESC`,
      [req.params.examen_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al obtener documentos",
      glosa: err.message || err.toString(),
    });
  }
});

// Descargar documento (médico, admin y paciente)
router.get("/:id", async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Verificar roles
    const userRolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuario_roles ur
       JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = $1`,
      [authUser.usuarioId]
    );
    const userRoles = userRolesResult.rows.map(r => r.nombre);

    // Obtener documento
    const docResult = await pool.query(
      `SELECT de.*, em.paciente_id, p.usuario_id
       FROM documentos_examen de
       JOIN examen_medico em ON em.id = de.examen_medico_id
       JOIN pacientes p ON p.id = em.paciente_id
       WHERE de.id = $1`,
      [req.params.id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: "No encontrado" });
    }

    const documento = docResult.rows[0];

    // Si es paciente, verificar que el documento sea suyo
    if (userRoles.includes("paciente")) {
      if (documento.usuario_id !== authUser.usuarioId) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "Solo puede ver sus propios documentos",
        });
      }
    } else if (!userRoles.includes("medico") && !userRoles.includes("admin")) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    // Detectar el tipo MIME basado en la extensión del archivo
    const extension = documento.nombre_archivo.split('.').pop().toLowerCase();
    let contentType = "application/pdf";
    if (['jpg', 'jpeg'].includes(extension)) {
      contentType = "image/jpeg";
    } else if (extension === 'png') {
      contentType = "image/png";
    } else if (extension === 'pdf') {
      contentType = "application/pdf";
    }
    
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${documento.nombre_archivo}"`
    );
    res.send(documento.documento);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al descargar documento",
      glosa: err.message || err.toString(),
    });
  }
});

// Eliminar documento (solo admin)
router.delete("/:id", async (req, res) => {
  try {
    const authCheck = await requireRole(req, ["admin"]);
    if (authCheck.error) {
      return res.status(authCheck.status).json({
        error: authCheck.error,
        glosa: "No tiene permisos para realizar esta acción",
      });
    }
    const { authUser } = authCheck;

    const result = await pool.query(
      "DELETE FROM documentos_examen WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `DOCUMENTOS_ELIMINAR: eliminó documento ID ${req.params.id}`,
      ]
    );

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al eliminar documento",
      glosa: err.message || err.toString(),
    });
  }
});

module.exports = router;

