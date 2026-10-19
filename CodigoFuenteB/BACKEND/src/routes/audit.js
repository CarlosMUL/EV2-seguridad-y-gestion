const express = require("express");
const { pool } = require("../db");
const jwt = require("jsonwebtoken");

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

router.post("/", async (req, res) => {
  const { accion, detalles } = req.body;
  try {
    const authUser = getUserFromAuthHeader(req);
    if (!authUser) {
      return res.status(401).json({
        error: "No autorizado",
        glosa: "Token inválido",
      });
    }
    const actionText = detalles ? `${accion}: ${detalles}` : accion;
    const result = await pool.query(
      "INSERT INTO auditoria (usuario_id, accion) VALUES ($1, $2) RETURNING *",
      [authUser?.usuarioId || null, actionText]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Error al registrar log",
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

    let result;

    // Si tiene empresaId, usar lógica de empresas
    if (authUser.empresaId) {
      result = await pool.query(
        `SELECT a.*, u.nombre_usuario 
         FROM auditoria a
         INNER JOIN usuarios u ON u.id = a.usuario_id
         INNER JOIN empresa_usuarios eu ON eu.usuario_id = u.id
         WHERE eu.empresa_id = $1
         ORDER BY a.id DESC`,
        [authUser.empresaId]
      );
    } else {
      // Si no tiene empresaId, usar lógica del sistema médico
      // Obtener roles del usuario
      const userRolesResult = await pool.query(
        `SELECT r.nombre 
         FROM usuario_roles ur
         JOIN roles r ON r.id = ur.rol_id
         WHERE ur.usuario_id = $1`,
        [authUser.usuarioId]
      );
      const userRoles = userRolesResult.rows.map((r) => r.nombre);
      const isAdmin = userRoles.includes("admin");

      // Solo admin puede ver todos los registros de auditoría
      if (!isAdmin) {
        return res.status(403).json({
          error: "No autorizado",
          glosa:
            "Solo los administradores pueden ver los registros de auditoría",
        });
      }

      // Retornar todos los registros de auditoría con nombre de usuario
      result = await pool.query(
        `SELECT a.*, u.nombre_usuario 
         FROM auditoria a
         LEFT JOIN usuarios u ON u.id = a.usuario_id
         ORDER BY a.id DESC`
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Error al listar logs",
        glosa: err.message || err.toString(),
      });
  }
});

module.exports = router;
