const express = require("express");
const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const validate = require("../middleware/validate");
const delayMiddleware = require("../middleware/delay");
const { examenMedicoSchema, updateExamenMedicoSchema } = require("../validations/examenes");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "inseguro";

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

// Crear examen médico (solo médico y admin)
router.post("/", delayMiddleware(5000), validate(examenMedicoSchema), async (req, res) => {
  try {
    const authCheck = await requireRole(req, ["medico", "admin"]);
    if (authCheck.error) {
      return res.status(authCheck.status).json({
        error: authCheck.error,
        glosa: "No tiene permisos para realizar esta acción",
      });
    }
    const { authUser } = authCheck;

    const {
      tipo_examen_medico_id,
      paciente_id,
      diagnosis,
      tratamiento,
      observaciones,
      notas,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO examen_medico (
        tipo_examen_medico_id, paciente_id, diagnosis, tratamiento, observaciones, notas
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        tipo_examen_medico_id,
        paciente_id,
        diagnosis || null,
        tratamiento || null,
        observaciones || null,
        notas || null,
      ]
    );

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `EXAMENES_CREAR: creó examen médico ID ${result.rows[0].id} para paciente ID ${paciente_id}`,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al crear examen médico",
      glosa: err.message || err.toString(),
    });
  }
});

// Listar exámenes médicos (médico, admin y paciente)
router.get("/", delayMiddleware(5000), async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Obtener roles del usuario
    const userRolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuario_roles ur
       JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = $1`,
      [authUser.usuarioId]
    );
    const userRoles = userRolesResult.rows.map(r => r.nombre);

    // Verificar que tenga un rol válido
    const validRoles = ["medico", "admin", "paciente"];
    if (!userRoles.some(role => validRoles.includes(role))) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    let query = `
      SELECT 
        em.*,
        tem.nombre AS tipo_examen_nombre,
        p.rut AS paciente_rut,
        p.primer_nombre AS paciente_primer_nombre,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.apellido_materno AS paciente_apellido_materno
       FROM examen_medico em
       JOIN tipo_examen_medico tem ON tem.id = em.tipo_examen_medico_id
       JOIN pacientes p ON p.id = em.paciente_id
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Si es paciente, filtrar solo sus exámenes
    if (userRoles.includes("paciente") && !userRoles.includes("medico") && !userRoles.includes("admin")) {
      // Obtener el paciente_id del usuario
      const pacienteResult = await pool.query(
        "SELECT id FROM pacientes WHERE usuario_id = $1",
        [authUser.usuarioId]
      );

      if (pacienteResult.rows.length === 0) {
        return res.status(404).json({
          error: "Paciente no encontrado",
          glosa: "No se encontró información de paciente asociada a su cuenta",
        });
      }

      const pacienteId = pacienteResult.rows[0].id;
      query += ` WHERE em.paciente_id = $${paramIndex}`;
      queryParams.push(pacienteId);
      paramIndex++;
    }

    query += ` ORDER BY em.created_at DESC`;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al listar exámenes médicos",
      glosa: err.message || err.toString(),
    });
  }
});

// Obtener examen médico por ID (médico, admin y paciente)
router.get("/:id", async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Obtener roles del usuario
    const userRolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuario_roles ur
       JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = $1`,
      [authUser.usuarioId]
    );
    const userRoles = userRolesResult.rows.map(r => r.nombre);

    // Verificar que tenga un rol válido
    const validRoles = ["medico", "admin", "paciente"];
    if (!userRoles.some(role => validRoles.includes(role))) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    let query = `
      SELECT 
        em.*,
        tem.nombre AS tipo_examen_nombre,
        p.rut AS paciente_rut,
        p.primer_nombre AS paciente_primer_nombre,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.apellido_materno AS paciente_apellido_materno
       FROM examen_medico em
       JOIN tipo_examen_medico tem ON tem.id = em.tipo_examen_medico_id
       JOIN pacientes p ON p.id = em.paciente_id
       WHERE em.id = $1
    `;
    const queryParams = [req.params.id];

    // Si es paciente, verificar que el examen pertenezca a su paciente_id
    if (userRoles.includes("paciente") && !userRoles.includes("medico") && !userRoles.includes("admin")) {
      // Obtener el paciente_id del usuario
      const pacienteResult = await pool.query(
        "SELECT id FROM pacientes WHERE usuario_id = $1",
        [authUser.usuarioId]
      );

      if (pacienteResult.rows.length === 0) {
        return res.status(404).json({
          error: "Paciente no encontrado",
          glosa: "No se encontró información de paciente asociada a su cuenta",
        });
      }

      const pacienteId = pacienteResult.rows[0].id;
      query += ` AND em.paciente_id = $2`;
      queryParams.push(pacienteId);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0)
      return res.status(404).json({ 
        error: "No encontrado",
        glosa: "El examen no existe o no tiene permisos para verlo"
      });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al obtener examen médico",
      glosa: err.message || err.toString(),
    });
  }
});

// Obtener exámenes médicos por paciente (médico, admin y paciente)
router.get("/paciente/:paciente_id", async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    
    // Si es paciente, verificar que el paciente_id coincida con su usuario
    if (authUser) {
      const userRolesResult = await pool.query(
        `SELECT r.nombre 
         FROM usuario_roles ur
         JOIN roles r ON r.id = ur.rol_id
         WHERE ur.usuario_id = $1`,
        [authUser.usuarioId]
      );
      const userRoles = userRolesResult.rows.map(r => r.nombre);
      
      if (userRoles.includes("paciente")) {
        // Verificar que el paciente_id corresponda al usuario
        const pacienteResult = await pool.query(
          "SELECT id FROM pacientes WHERE usuario_id = $1",
          [authUser.usuarioId]
        );
        if (pacienteResult.rows.length === 0 || 
            pacienteResult.rows[0].id.toString() !== req.params.paciente_id) {
          return res.status(403).json({
            error: "No autorizado",
            glosa: "Solo puede ver sus propios exámenes",
          });
        }
      } else if (!userRoles.includes("medico") && !userRoles.includes("admin")) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "No tiene permisos para realizar esta acción",
        });
      }
    } else {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    const result = await pool.query(
      `SELECT 
        em.*,
        tem.nombre AS tipo_examen_nombre,
        p.rut AS paciente_rut,
        p.primer_nombre AS paciente_primer_nombre,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.apellido_materno AS paciente_apellido_materno
       FROM examen_medico em
       JOIN tipo_examen_medico tem ON tem.id = em.tipo_examen_medico_id
       JOIN pacientes p ON p.id = em.paciente_id
       WHERE em.paciente_id = $1
       ORDER BY em.created_at DESC`,
      [req.params.paciente_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al obtener exámenes médicos",
      glosa: err.message || err.toString(),
    });
  }
});

// Actualizar examen médico (médico y admin)
router.put("/:id", delayMiddleware(5000), validate(updateExamenMedicoSchema), async (req, res) => {
  try {
    const authCheck = await requireRole(req, ["medico", "admin"]);
    if (authCheck.error) {
      return res.status(authCheck.status).json({
        error: authCheck.error,
        glosa: "No tiene permisos para realizar esta acción",
      });
    }
    const { authUser } = authCheck;

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const allowedFields = [
      "tipo_examen_medico_id",
      "paciente_id",
      "diagnosis",
      "tratamiento",
      "observaciones",
      "notas",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field}=$${paramIndex++}`);
        updateValues.push(req.body[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "Error de validación",
        glosa: "Debe proporcionar al menos un campo para actualizar",
      });
    }

    updateValues.push(req.params.id);
    const result = await pool.query(
      `UPDATE examen_medico SET ${updateFields.join(", ")} WHERE id=$${paramIndex} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `EXAMENES_ACTUALIZAR: actualizó examen médico ID ${req.params.id}`,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al actualizar examen médico",
      glosa: err.message || err.toString(),
    });
  }
});

// Eliminar examen médico (solo admin)
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
      "DELETE FROM examen_medico WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `EXAMENES_ELIMINAR: eliminó examen médico ID ${req.params.id}`,
      ]
    );

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al eliminar examen médico",
      glosa: err.message || err.toString(),
    });
  }
});

module.exports = router;

