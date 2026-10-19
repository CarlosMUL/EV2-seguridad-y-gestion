const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const { pool } = require("./db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const pacientesRoutes = require("./routes/pacientes");
const examenesRoutes = require("./routes/examenes");
const documentosRoutes = require("./routes/documentos");
const tipoExamenRoutes = require("./routes/tipo-examen");
const auditRoutes = require("./routes/audit");
const rolesRoutes = require("./routes/roles");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const uploadsDir = path.join(__dirname, "..", "uploads", "documentos");
fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/autenticacion", authRoutes);
app.use("/usuarios", userRoutes);
app.use("/pacientes", pacientesRoutes);
app.use("/examenes", examenesRoutes);
app.use("/documentos", documentosRoutes);
app.use("/tipo-examen", tipoExamenRoutes);
app.use("/auditoria", auditRoutes);
app.use("/roles", rolesRoutes);

const openapi = require("./openapi.json");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.get("/openapi.json", (req, res) => {
  res.json(openapi);
});

app.use("/files/documentos", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.json({ name: "cuidarteplus", status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`cuidarteplus API escuchando en puerto ${PORT}`);
});
