const express = require("express");
const { pool } = require("../db");
const router = express.Router();

// Listar tipos de examen (público para autenticados)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tipo_examen_medico ORDER BY nombre ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al listar tipos de examen",
      glosa: err.message || err.toString(),
    });
  }
});

// Obtener tipo de examen por ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tipo_examen_medico WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error al obtener tipo de examen",
      glosa: err.message || err.toString(),
    });
  }
});

module.exports = router;

