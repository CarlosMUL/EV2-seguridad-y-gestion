const express = require("express");
const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const validate = require("../middleware/validate");
const { createUserSchema, updateUserSchema } = require("../validations/users");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "inseguro";

function getUserFromAuthHeader(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const token = auth.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
}

router.post("/", validate(createUserSchema), async (req, res) => {
  const { nombre_usuario, contrasena_hash, correo, rol_id } = req.body;
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Crear usuario
    const result = await pool.query(
      "INSERT INTO usuarios (nombre_usuario, contrasena, correo) VALUES ($1, $2, $3) RETURNING id, nombre_usuario, correo, created_at",
      [nombre_usuario, contrasena_hash, correo]
    );
    const newUser = result.rows[0];

    // Si el usuario autenticado tiene empresaId y se proporciona rol_id, crear relación empresa-usuario
    if (authUser.empresaId && rol_id) {
      await pool.query(
        "INSERT INTO empresa_usuarios (empresa_id, usuario_id, rol_id) VALUES ($1, $2, $3)",
        [authUser.empresaId, newUser.id, rol_id]
      );
    } else if (rol_id) {
      // Si no tiene empresaId (sistema médico) y se proporciona rol_id, crear relación usuario_roles
      await pool.query(
        "INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)",
        [newUser.id, rol_id]
      );
    }

    // Registrar en auditoría
    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `USUARIOS_CREAR: creó usuario ${nombre_usuario}${rol_id ? ` con rol ${rol_id}` : ""}`,
      ]
    );

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al crear usuario",
      glosa: err.message || err.toString(),
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Verificar que el usuario tenga rol admin
    let isAdmin = false;

    // Si tiene empresaId, verificar rol desde empresa_usuarios
    if (authUser.empresaId) {
      const empresaUsuarioResult = await pool.query(
        `SELECT eu.rol_id, r.nombre AS rol_nombre
         FROM empresa_usuarios eu
         LEFT JOIN roles r ON r.id = eu.rol_id
         WHERE eu.usuario_id = $1 AND eu.empresa_id = $2`,
        [authUser.usuarioId, authUser.empresaId]
      );
      
      if (empresaUsuarioResult.rows.length > 0) {
        const rolNombre = empresaUsuarioResult.rows[0].rol_nombre;
        const rolId = empresaUsuarioResult.rows[0].rol_id;
        // Verificar si es admin (rol_id = 1 o nombre = "admin" o "administrador")
        isAdmin = rolId === 1 || rolNombre === "admin" || rolNombre === "administrador";
      }
    } else {
      // Si no tiene empresaId, verificar rol desde usuario_roles (sistema médico)
      const userRolesResult = await pool.query(
        `SELECT r.nombre 
         FROM usuario_roles ur
         JOIN roles r ON r.id = ur.rol_id
         WHERE ur.usuario_id = $1`,
        [authUser.usuarioId]
      );
      const userRoles = userRolesResult.rows.map((r) => r.nombre);
      isAdmin = userRoles.includes("admin") || userRoles.includes("administrador");
    }

    if (!isAdmin) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "Solo los administradores pueden listar todos los usuarios",
      });
    }

    // Listar todos los usuarios del sistema
    const result = await pool.query(
      `SELECT u.id, u.nombre_usuario, u.correo, u.created_at 
       FROM usuarios u
       ORDER BY u.id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al listar usuarios",
      glosa: err.message || err.toString(),
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Si tiene empresaId, usar lógica de empresas
    if (authUser.empresaId) {
      // Obtener información del usuario y su rol desde empresa_usuarios
      const result = await pool.query(
        `SELECT 
          u.id, 
          u.nombre_usuario, 
          u.correo, 
          u.created_at,
          eu.rol_id,
          r.nombre AS rol_nombre
        FROM usuarios u
        INNER JOIN empresa_usuarios eu ON eu.usuario_id = u.id AND eu.empresa_id = $2
        LEFT JOIN roles r ON r.id = eu.rol_id
        WHERE u.id = $1 AND eu.empresa_id = $2`,
        [req.params.id, authUser.empresaId]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ error: "No encontrado" });

      const usuario = result.rows[0];

      // Verificar si es el único administrador de la empresa
      if (usuario.rol_id === 1) {
        // 1 = administrador
        const adminCount = await pool.query(
          `SELECT COUNT(*) as count 
           FROM empresa_usuarios 
           WHERE empresa_id = $1 AND rol_id = 1`,
          [authUser.empresaId]
        );
        usuario.es_unico_administrador =
          parseInt(adminCount.rows[0].count) === 1;
      } else {
        usuario.es_unico_administrador = false;
      }

      return res.json(usuario);
    }

    // Si no tiene empresaId, usar lógica de usuario_roles (sistema médico)
    // Verificar que el usuario solo pueda ver sus propios datos o sea admin/medico
    const userRolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuario_roles ur
       JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = $1`,
      [authUser.usuarioId]
    );
    const userRoles = userRolesResult.rows.map((r) => r.nombre);
    const isAdminOrMedico =
      userRoles.includes("admin") || userRoles.includes("medico");
    const isPaciente = userRoles.includes("paciente") && !isAdminOrMedico;

    // Si es paciente, solo puede ver sus propios datos
    if (isPaciente && Number(authUser.usuarioId) !== Number(req.params.id)) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "Solo puede ver sus propios datos",
      });
    }

    // Obtener información del usuario y su rol desde usuario_roles
    const result = await pool.query(
      `SELECT 
        u.id, 
        u.nombre_usuario, 
        u.correo, 
        u.created_at,
        ur.rol_id,
        r.nombre AS rol_nombre
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
      LEFT JOIN roles r ON r.id = ur.rol_id
      WHERE u.id = $1
      LIMIT 1`,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    const usuario = result.rows[0];
    usuario.es_unico_administrador = false; // No aplica para sistema médico

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al obtener usuario",
      glosa: err.message || err.toString(),
    });
  }
});

router.put("/:id", validate(updateUserSchema), async (req, res) => {
  const { nombre_usuario, contrasena_hash, correo, rol_id } = req.body;
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }

    // Si tiene empresaId, usar lógica de empresas
    if (authUser.empresaId) {
      return await updateUsuarioEmpresa(req, res, authUser, {
        nombre_usuario,
        contrasena_hash,
        correo,
        rol_id,
      });
    }

    // Si no tiene empresaId, usar lógica de usuario_roles (sistema médico)
    return await updateUsuarioSistemaMedico(req, res, authUser, {
      nombre_usuario,
      contrasena_hash,
      correo,
      rol_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al actualizar usuario",
      glosa: err.message || err.toString(),
    });
  }
});

async function updateUsuarioEmpresa(
  req,
  res,
  authUser,
  { nombre_usuario, contrasena_hash, correo, rol_id }
) {
  try {
    // Verificar que el usuario autenticado sea administrador
    const authUserRoleResult = await pool.query(
      `SELECT eu.rol_id, r.nombre AS rol_nombre
       FROM empresa_usuarios eu
       LEFT JOIN roles r ON r.id = eu.rol_id
       WHERE eu.usuario_id = $1 AND eu.empresa_id = $2`,
      [authUser.usuarioId, authUser.empresaId]
    );
    
    if (authUserRoleResult.rows.length === 0) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para editar usuarios",
      });
    }
    
    const authRolId = authUserRoleResult.rows[0].rol_id;
    const authRolNombre = authUserRoleResult.rows[0].rol_nombre;
    const isAdmin = authRolId === 1 || authRolNombre === "admin" || authRolNombre === "administrador";
    
    if (!isAdmin) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "Solo los administradores pueden editar usuarios",
      });
    }

    // Verificar si se está intentando cambiar el rol
    if (rol_id !== undefined) {
      // Verificar si el usuario está intentando cambiar su propio rol
      if (
        authUser.usuarioId &&
        Number(authUser.usuarioId) === Number(req.params.id)
      ) {
        return res.status(400).json({
          error: "No se puede cambiar el rol",
          glosa: "No puedes cambiar tu propio rol",
        });
      }

      const usuarioActual = await pool.query(
        `SELECT eu.rol_id 
         FROM empresa_usuarios eu
         WHERE eu.usuario_id = $1 AND eu.empresa_id = $2`,
        [req.params.id, authUser.empresaId]
      );

      if (usuarioActual.rows.length > 0 && usuarioActual.rows[0].rol_id === 1) {
        // Es administrador, verificar si es el único
        const adminCount = await pool.query(
          `SELECT COUNT(*) as count 
           FROM empresa_usuarios 
           WHERE empresa_id = $1 AND rol_id = 1`,
          [authUser.empresaId]
        );

        if (parseInt(adminCount.rows[0].count) === 1 && rol_id !== 1) {
          return res.status(400).json({
            error: "No se puede cambiar el rol",
            glosa:
              "No se puede cambiar el rol del único administrador de la empresa",
          });
        }
      }
    }

    // Actualizar información del usuario
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (nombre_usuario !== undefined) {
      updateFields.push(`nombre_usuario=$${paramIndex++}`);
      updateValues.push(nombre_usuario);
    }
    if (contrasena_hash !== undefined) {
      updateFields.push(`contrasena=$${paramIndex++}`);
      updateValues.push(contrasena_hash);
    }
    if (correo !== undefined) {
      updateFields.push(`correo=$${paramIndex++}`);
      updateValues.push(correo);
    }

    if (updateFields.length > 0) {
      updateValues.push(req.params.id);
      const result = await pool.query(
        `UPDATE usuarios SET ${updateFields.join(
          ", "
        )} WHERE id=$${paramIndex} RETURNING id, nombre_usuario, correo, created_at`,
        updateValues
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "No encontrado" });
    }

    // Actualizar rol si se proporciona
    if (rol_id !== undefined) {
      const empresaUsuarioResult = await pool.query(
        `SELECT id FROM empresa_usuarios WHERE usuario_id = $1 AND empresa_id = $2`,
        [req.params.id, authUser.empresaId]
      );

      if (empresaUsuarioResult.rows.length > 0) {
        await pool.query(
          `UPDATE empresa_usuarios SET rol_id = $1 WHERE usuario_id = $2 AND empresa_id = $3`,
          [rol_id, req.params.id, authUser.empresaId]
        );
      }
    }

    // Obtener datos actualizados del usuario
    const usuarioResult = await pool.query(
      `SELECT 
        u.id, 
        u.nombre_usuario, 
        u.correo, 
        u.created_at,
        eu.rol_id,
        r.nombre AS rol_nombre
      FROM usuarios u
      LEFT JOIN empresa_usuarios eu ON eu.usuario_id = u.id AND eu.empresa_id = $2
      LEFT JOIN roles r ON r.id = eu.rol_id
      WHERE u.id = $1`,
      [req.params.id, authUser.empresaId]
    );

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `USUARIOS_ACTUALIZAR: actualizó usuario ID ${req.params.id}${
          rol_id !== undefined ? ` y rol a ${rol_id}` : ""
        }`,
      ]
    );

    res.json(usuarioResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al actualizar usuario",
      glosa: err.message || err.toString(),
    });
  }
}

async function updateUsuarioSistemaMedico(
  req,
  res,
  authUser,
  { nombre_usuario, contrasena_hash, correo, rol_id }
) {
  try {
    // Obtener roles del usuario autenticado
    const userRolesResult = await pool.query(
      `SELECT r.nombre 
       FROM usuario_roles ur
       JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = $1`,
      [authUser.usuarioId]
    );
    const userRoles = userRolesResult.rows.map((r) => r.nombre);
    const isAdmin = userRoles.includes("admin") || userRoles.includes("administrador");
    const isAdminOrMedico =
      userRoles.includes("admin") || userRoles.includes("administrador") || userRoles.includes("medico");
    const isPaciente = userRoles.includes("paciente") && !isAdminOrMedico;

    // Si es paciente, solo puede actualizar sus propios datos y no puede cambiar el rol
    if (isPaciente) {
      if (Number(authUser.usuarioId) !== Number(req.params.id)) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "Solo puede actualizar sus propios datos",
        });
      }
      if (rol_id !== undefined) {
        return res.status(403).json({
          error: "No autorizado",
          glosa: "No puede cambiar su rol",
        });
      }
    }

    // Si es admin, puede editar cualquier usuario
    // Si no es admin, solo puede editar sus propios datos (ya verificado arriba para pacientes)
    if (!isAdmin && Number(authUser.usuarioId) !== Number(req.params.id)) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "Solo los administradores pueden editar otros usuarios",
      });
    }

    // Si no es admin o médico, no puede cambiar roles de otros usuarios
    if (rol_id !== undefined && !isAdminOrMedico) {
      return res.status(403).json({
        error: "No autorizado",
        glosa: "No tiene permisos para cambiar roles",
      });
    }

    // Actualizar información del usuario
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (nombre_usuario !== undefined) {
      updateFields.push(`nombre_usuario=$${paramIndex++}`);
      updateValues.push(nombre_usuario);
    }
    if (contrasena_hash !== undefined) {
      updateFields.push(`contrasena=$${paramIndex++}`);
      updateValues.push(contrasena_hash);
    }
    if (correo !== undefined) {
      updateFields.push(`correo=$${paramIndex++}`);
      updateValues.push(correo);
    }

    if (updateFields.length > 0) {
      updateValues.push(req.params.id);
      const result = await pool.query(
        `UPDATE usuarios SET ${updateFields.join(
          ", "
        )} WHERE id=$${paramIndex} RETURNING id, nombre_usuario, correo, created_at`,
        updateValues
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "No encontrado" });
    }

    // Actualizar rol si se proporciona y tiene permisos
    if (rol_id !== undefined && isAdminOrMedico) {
      // Eliminar roles existentes
      await pool.query(`DELETE FROM usuario_roles WHERE usuario_id = $1`, [
        req.params.id,
      ]);
      // Agregar nuevo rol
      await pool.query(
        `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
        [req.params.id, rol_id]
      );
    }

    // Obtener datos actualizados del usuario
    const usuarioResult = await pool.query(
      `SELECT 
        u.id, 
        u.nombre_usuario, 
        u.correo, 
        u.created_at,
        ur.rol_id,
        r.nombre AS rol_nombre
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
      LEFT JOIN roles r ON r.id = ur.rol_id
      WHERE u.id = $1
      LIMIT 1`,
      [req.params.id]
    );

    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.usuarioId || null,
        `USUARIOS_ACTUALIZAR: actualizó usuario ID ${req.params.id}${
          rol_id !== undefined ? ` y rol a ${rol_id}` : ""
        }`,
      ]
    );

    res.json(usuarioResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al actualizar usuario",
      glosa: err.message || err.toString(),
    });
  }
}

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    const authUser = getUserFromAuthHeader(req);
    await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2)",
      [
        authUser?.nombreUsuario || null,
        `USUARIOS_ELIMINAR: eliminó usuario ID ${req.params.id}`,
      ]
    );

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al eliminar usuario",
      glosa: err.message || err.toString(),
    });
  }
});

module.exports = router;
