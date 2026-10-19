const express = require("express");
const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const validate = require("../middleware/validate");
const delayMiddleware = require("../middleware/delay");
const { pacienteSchema, updatePacienteSchema } = require("../validations/pacientes");
const { normalizeRut } = require("../utils/rut");
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
    return { error: "No autorizado", status: 401 };
  }
  
  // Obtener roles del usuario
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

// Crear paciente (solo médico y admin)
router.post("/", validate(pacienteSchema), async (req, res) => {
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
      rut,
      primer_nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      sexo,
      nacionalidad,
      estado_civil,
      email,
      telefono,
      direccion,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono,
      contacto_emergencia_relacion,
      tipo_prevision,
      tiene_convenio,
      grupo_sanguineo,
      alergias,
      enfermedades_cronicas,
      discapacidades,
      observaciones_medicas_generales,
      usuario_id,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pacientes (
        rut, primer_nombre, apellido_paterno, apellido_materno,
        fecha_nacimiento, sexo, nacionalidad, estado_civil,
        email, telefono, direccion,
        contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion,
        tipo_prevision, tiene_convenio,
        grupo_sanguineo, alergias, enfermedades_cronicas, discapacidades, observaciones_medicas_generales,
        usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
      [
        normalizeRut(rut),
        primer_nombre,
        apellido_paterno,
        apellido_materno || null,
        fecha_nacimiento,
        sexo,
        nacionalidad || null,
        estado_civil || null,
        email,
        telefono || null,
        direccion || null,
        contacto_emergencia_nombre || null,
        contacto_emergencia_telefono || null,
        contacto_emergencia_relacion || null,
        tipo_prevision || null,
        tiene_convenio || false,
        grupo_sanguineo || null,
        alergias || null,
        enfermedades_cronicas || null,
        discapacidades || null,
        observaciones_medicas_generales || null,
        usuario_id || null,
      ]
    );

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `PACIENTES_CREAR: creó paciente ${primer_nombre} ${apellido_paterno} (RUT: ${rut})`,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({
        error: "Error al crear paciente",
        glosa: "El RUT o email ya existe",
      });
    }
    res.status(500).json({
      error: "Error al crear paciente",
      glosa: err.message || err.toString(),
    });
  }
});

// Listar pacientes (médico y admin)
router.get("/", delayMiddleware(5000), async (req, res) => {
  try {
    const authCheck = await requireRole(req, ["medico", "admin"]);
    if (authCheck.error) {
      return res.status(authCheck.status).json({
        error: authCheck.error,
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    const result = await pool.query(
      `SELECT p.*, u.nombre_usuario 
       FROM pacientes p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al listar pacientes",
      glosa: err.message || err.toString(),
    });
  }
});

// Obtener paciente por ID (médico, admin y paciente - solo sus propios datos)
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

    // Verificar permisos
    const isMedicoOrAdmin = userRoles.includes("medico") || userRoles.includes("admin");
    const isPaciente = userRoles.includes("paciente") && !isMedicoOrAdmin;

    if (!isMedicoOrAdmin && !isPaciente) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    // Si es paciente, verificar que solo pueda ver sus propios datos
    if (isPaciente) {
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
      if (pacienteId.toString() !== req.params.id) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "Solo puede ver sus propios datos",
        });
      }
    }

    const result = await pool.query(
      `SELECT p.*, u.nombre_usuario 
       FROM pacientes p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al obtener paciente",
      glosa: err.message || err.toString(),
    });
  }
});

// Buscar paciente por RUT (público para pacientes)
router.get("/buscar/rut/:rut", async (req, res) => {
  try {
    const { rut } = req.params;
    const normalizedRut = normalizeRut(rut);
    
    const result = await pool.query(
      `SELECT p.*, u.nombre_usuario 
       FROM pacientes p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.rut = $1`,
      [normalizedRut]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al buscar paciente",
      glosa: err.message || err.toString(),
    });
  }
});

// Actualizar paciente (médico, admin y paciente - solo sus propios datos)
router.put("/:id", validate(updatePacienteSchema), async (req, res) => {
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

    // Verificar permisos
    const isMedicoOrAdmin = userRoles.includes("medico") || userRoles.includes("admin");
    const isPaciente = userRoles.includes("paciente") && !isMedicoOrAdmin;

    if (!isMedicoOrAdmin && !isPaciente) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para realizar esta acción",
      });
    }

    // Si es paciente, verificar que solo pueda actualizar sus propios datos
    if (isPaciente) {
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
      if (pacienteId.toString() !== req.params.id) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "Solo puede actualizar sus propios datos",
        });
      }
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const allowedFields = [
      "rut", "primer_nombre", "apellido_paterno", "apellido_materno",
      "fecha_nacimiento", "sexo", "nacionalidad", "estado_civil",
      "email", "telefono", "direccion",
      "contacto_emergencia_nombre", "contacto_emergencia_telefono", "contacto_emergencia_relacion",
      "tipo_prevision", "tiene_convenio",
      "grupo_sanguineo", "alergias", "enfermedades_cronicas", "discapacidades", "observaciones_medicas_generales",
      "usuario_id"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field}=$${paramIndex++}`);
        // Normalizar RUT si es el campo rut
        updateValues.push(field === "rut" ? normalizeRut(req.body[field]) : req.body[field]);
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
      `UPDATE pacientes SET ${updateFields.join(", ")} WHERE id=$${paramIndex} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `PACIENTES_ACTUALIZAR: actualizó paciente ID ${req.params.id}`,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al actualizar paciente",
      glosa: err.message || err.toString(),
    });
  }
});

// Eliminar paciente (solo admin)
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
      "DELETE FROM pacientes WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `PACIENTES_ELIMINAR: eliminó paciente ID ${req.params.id}`,
      ]
    );

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al eliminar paciente",
      glosa: err.message || err.toString(),
    });
  }
});

module.exports = router;

