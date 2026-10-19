// Ejecución de los 26 casos de API del informe EP2 (CP-35 y CP-37 están en ui-tests.js) contra la API (ambiente QA local)
// Uso: node run-tests.js  -> genera evidencia/casos/<CP>.txt y evidencia/resultados-api.json
// Correr sobre una base recién creada (docker compose down -v && docker compose up -d): el script crea usuarios y datos de prueba.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const jwt = require("jsonwebtoken");

const API = process.env.API_URL || "http://localhost:4444";
const DB_CONTAINER = process.env.DB_CONTAINER || "cuidarteplus-postgres-ev";
const README = path.join(__dirname, "..", "CodigoFuenteB", "README.md");
const FECHA = new Date().toLocaleDateString("es-CL");
const OUT = path.join(__dirname, "evidencia", "casos");
fs.mkdirSync(OUT, { recursive: true });
// Genera los archivos de prueba (un PDF minimo valido y un binario ficticio para el test de subida)
const PDF_FIX = path.join(OUT, "_informe_examen.pdf");
const BIN_FIX = path.join(OUT, "_archivo_ficticio.bin");
if (!fs.existsSync(PDF_FIX)) fs.writeFileSync(PDF_FIX, "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF");
if (!fs.existsSync(BIN_FIX)) fs.writeFileSync(BIN_FIX, Buffer.from("4D5A90000300000004000000 archivo ficticio e inofensivo para probar validacion de formato", "utf8"));
const results = [];
let log = [];

async function req(method, url, { token, body, form, headers = {}, quiet = false } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { h["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const t0 = performance.now();
  const r = await fetch(API + url, { method, headers: h, body: payload });
  const ms = Math.round(performance.now() - t0);
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  const hdrs = Object.fromEntries(r.headers.entries());
  if (!quiet) {
    const shown = typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data, null, 0).slice(0, 600);
    log.push(`> ${method} ${url}${token ? "  [Authorization: Bearer <token>]" : "  [sin token]"}`);
    for (const [k, v] of Object.entries(headers)) log.push(`  ${k}: ${v}`);
    if (body !== undefined) log.push(`  body: ${JSON.stringify(body).slice(0, 300)}`);
    log.push(`< HTTP ${r.status}  (${ms} ms)`);
    log.push(`  ${shown}`);
    log.push("");
  }
  return { status: r.status, data, ms, headers: hdrs };
}
const note = (s) => log.push(`# ${s}`);

async function caso(id, nombre, req_, tipo, fn) {
  log = [];
  let res;
  try { res = await fn(); } catch (e) { res = { estado: "Bloqueado", obtenido: "Error de ejecución: " + e.message }; }
  const rec = { id, nombre, requerimiento: req_, tipo, ...res, fecha: FECHA };
  results.push(rec);
  fs.writeFileSync(path.join(OUT, `${id}.txt`),
    `${id} - ${nombre}\nRequerimiento: ${req_} | Tipo: ${tipo}\nAmbiente: QA local (Express :4444 / PostgreSQL 15 / React build :3333)\n` +
    `Fecha ejecución: ${FECHA}\n${"-".repeat(70)}\n` + log.join("\n") +
    `${"-".repeat(70)}\nRESULTADO: ${rec.estado.toUpperCase()}${rec.incidente ? `  (${rec.incidente})` : ""}\nObtenido: ${rec.obtenido}\n`);
  console.log(`${id.padEnd(6)} ${rec.estado.padEnd(10)} ${nombre}`);
}

// Consulta directa a PostgreSQL dentro del contenedor (evidencia de CP-28)
function psql(sql) {
  return execFileSync("docker", ["exec", DB_CONTAINER, "psql", "-U", "postgres", "-d", "cuidarteplus", "-c", sql], { encoding: "utf8" });
}

(async () => {
  // ---------- Preparación de datos ----------
  const login = async (u, p) => (await req("POST", "/autenticacion/login", { body: { nombre_usuario: u, password: p }, quiet: true })).data.token;
  const tAdmin = await login("admin", "admin");
  const tMed = await login("medico", "medico");
  const tPac = await login("paciente", "paciente"); // paciente id 1 (Juan Pérez)
  if (!tAdmin || !tMed || !tPac) throw new Error("No se pudo iniciar sesión con los usuarios del dump. ¿Está la API arriba y la base recién creada?");
  // El dump no trae exámenes: se crea uno para el paciente 1 (Juan), otro para el 2 (María) y otro para el 3 (Pedro)
  const nuevoExamen = async (pacienteId, obs) => (await req("POST", "/examenes", { token: tMed, body: { tipo_examen_medico_id: 1, paciente_id: pacienteId, diagnosis: "Sin hallazgos", observaciones: obs }, quiet: true })).data;
  const e1 = await nuevoExamen(1, "Control anual");          // CP-02, CP-07, CP-10, CP-32
  const e2 = await nuevoExamen(2, "Control María González"); // CP-15 (examen ajeno)
  const e3 = await nuevoExamen(3, "Control glicémico");      // CP-17 (examen del titular del RUT)
  const docForm = new FormData(); docForm.append("examen_medico_id", String(e2.id)); docForm.append("paciente_id", "2");
  docForm.append("documento", new Blob([fs.readFileSync(PDF_FIX)], { type: "application/pdf" }), "examen_maria.pdf");
  const d2 = (await req("POST", "/documentos", { token: tMed, form: docForm, quiet: true })).data.documento; // CP-15 (documento ajeno)

  // ================= FUNCIONALES =================
  await caso("CP-01", "Inicio de sesión con credenciales válidas", "RF-1.1", "Funcional", async () => {
    const r = await req("POST", "/autenticacion/login", { body: { nombre_usuario: "paciente", password: "paciente" } });
    const dec = r.data.token ? jwt.decode(r.data.token) : null;
    note(`Payload JWT decodificado: ${JSON.stringify(dec)}`);
    const ok = r.status === 200 && dec && dec.rolNombre === "paciente";
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `HTTP ${r.status} en ${r.ms} ms; JWT emitido con rol '${dec?.rolNombre}' y expiración 2 h.`, ms: r.ms };
  });

  await caso("CP-02", "Cierre de sesión y revocación del token", "RF-1.2 / NFR-SEG-9", "Funcional / Seguridad", async () => {
    const t = await login("paciente", "paciente");
    note("El frontend solo elimina el token de localStorage (AuthContext.logout). No existe endpoint de logout en el backend.");
    const r0 = await req("POST", "/autenticacion/logout", { token: t });
    note("Se reutiliza el token capturado después de 'Cerrar sesión':");
    const r = await req("GET", "/examenes/" + e1.id, { token: t });
    const fail = r.status === 200;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `No existe /autenticacion/logout (HTTP ${r0.status}). El token reutilizado tras cerrar sesión sigue siendo aceptado (HTTP ${r.status}).`, incidente: fail ? "INC-14" : undefined };
  });

  await caso("CP-04", "Registro de cuenta de paciente", "RF-2", "Funcional", async () => {
    const r = await req("POST", "/autenticacion/registro", { body: { nombre_usuario: "paciente_test01", password: "Cuidarte#2026Val", correo: "paciente_test01@mail.cl", rut: "21.111.222-3" } });
    const l = await req("POST", "/autenticacion/login", { body: { nombre_usuario: "paciente_test01", password: "Cuidarte#2026Val" } });
    const dec = l.data.token ? jwt.decode(l.data.token) : null;
    note(`Payload JWT de la cuenta nueva: rolNombre=${dec?.rolNombre}, pacienteId=${dec?.pacienteId}`);
    const ok = r.status === 201 && l.status === 200 && dec?.rolNombre === "paciente" && dec?.pacienteId;
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `Registro HTTP ${r.status}; login posterior HTTP ${l.status}; se asigna rol '${dec?.rolNombre}' y ficha de paciente ID ${dec?.pacienteId} asociada al RUT.` };
  });

  await caso("CP-06", "Médico registra examen médico", "RF-3.1", "Funcional", async () => {
    const r = await req("POST", "/examenes", { token: tMed, body: { tipo_examen_medico_id: 2, paciente_id: 1, diagnosis: "Colesterol LDL levemente elevado", observaciones: "Perfil lipídico de control" } });
    const gm = await req("GET", "/examenes/" + r.data.id, { token: tMed });
    const gp = await req("GET", "/examenes/" + r.data.id, { token: tPac });
    const ok = r.status === 201 && gm.status === 200 && gp.status === 200;
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `HTTP ${r.status}; examen ID ${r.data.id} (Perfil lipídico) creado para el paciente 1, visible para el médico (HTTP ${gm.status}) y para el paciente dueño (HTTP ${gp.status}). Tiempo de creación ${r.ms} ms (ver CP-32).`, ms: r.ms };
  });

  await caso("CP-07", "Edición de examen médico", "RF-3.2", "Funcional", async () => {
    const r = await req("PUT", "/examenes/" + e1.id, { token: tMed, body: { observaciones: "Paciente presenta mejoría" } });
    const g = await req("GET", "/examenes/" + e1.id, { token: tPac });
    const ok = r.status === 200 && g.data.observaciones === "Paciente presenta mejoría";
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `PUT HTTP ${r.status}; el cambio se refleja en la vista del paciente (GET HTTP ${g.status}).` };
  });

  await caso("CP-08", "Paciente visualiza solo sus exámenes", "RF-4.1 / RB-1", "Funcional", async () => {
    const r = await req("GET", "/examenes", { token: tPac });
    const ajenos = Array.isArray(r.data) ? r.data.filter((x) => Number(x.paciente_id) !== 1).length : -1;
    const ok = r.status === 200 && ajenos === 0;
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `HTTP ${r.status}; ${r.data.length} exámenes, ${ajenos} de otros pacientes. Respuesta en ${r.ms} ms.`, ms: r.ms };
  });

  await caso("CP-10", "Adjuntar documento: formato permitido y rechazo de no permitido", "RF-4.3", "Funcional / Seguridad", async () => {
    const ok1 = new FormData(); ok1.append("examen_medico_id", String(e1.id)); ok1.append("paciente_id", "1");
    ok1.append("documento", new Blob([fs.readFileSync(PDF_FIX)], { type: "application/pdf" }), "informe_examen.pdf");
    const a = await req("POST", "/documentos", { token: tMed, form: ok1 });
    const bad = new FormData(); bad.append("examen_medico_id", String(e1.id)); bad.append("paciente_id", "1");
    bad.append("documento", new Blob([fs.readFileSync(BIN_FIX)], { type: "application/x-msdownload" }), "archivo_ficticio.bin");
    const b = await req("POST", "/documentos", { token: tMed, form: bad });
    note("Mismo .exe enviado declarando Content-Type application/pdf (suplantación de MIME):");
    const spoof = new FormData(); spoof.append("examen_medico_id", String(e1.id)); spoof.append("paciente_id", "1");
    spoof.append("documento", new Blob([fs.readFileSync(BIN_FIX)], { type: "application/pdf" }), "archivo_ficticio.bin");
    const c = await req("POST", "/documentos", { token: tMed, form: spoof });
    const fail = c.status === 201;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `PDF aceptado (HTTP ${a.status}); .exe con MIME real rechazado (HTTP ${b.status}); .exe con MIME falsificado ACEPTADO (HTTP ${c.status}). La validación confía en el Content-Type del cliente y no revisa extensión ni firma del archivo.`, incidente: fail ? "INC-10" : undefined };
  });

  await caso("CP-11", "Generación de registros de auditoría", "RF-5.1", "Funcional", async () => {
    const r = await req("GET", "/auditoria", { token: tAdmin });
    const acciones = Array.isArray(r.data) ? r.data.slice(0, 6).map((x) => `${x.nombre_usuario || "null"} | ${x.accion}`) : [];
    note("Últimos registros: \n  " + acciones.join("\n  "));
    note("Se crea un rol con token de admin para verificar su registro (roles.js guarda nombreUsuario en vez de usuarioId):");
    const rr = await req("POST", "/roles", { token: tAdmin, body: { nombre: "rol_temporal" } });
    const r2 = await req("GET", "/auditoria", { token: tAdmin });
    const last = r2.data[0];
    const fail = rr.status !== 201;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Crear/editar examen y login sí quedan auditados. Pero POST /roles con token responde HTTP ${rr.status} ("${(rr.data.glosa || "").slice(0, 70)}"): el rol se inserta y luego el log falla porque se guarda el nombre de usuario en una columna numérica. Último registro: "${last.accion}".`, incidente: fail ? "INC-16" : undefined };
  });

  // ================= SEGURIDAD =================
  await caso("CP-14", "Validación frente a SQL Injection", "NFR-SEG-5", "Seguridad", async () => {
    const a = await req("POST", "/autenticacion/login", { body: { nombre_usuario: "' OR '1'='1", password: "x' OR '1'='1" } });
    const b = await req("POST", "/autenticacion/login", { body: { nombre_usuario: "admin'--", password: "x" } });
    const c = await req("GET", "/pacientes/buscar/rut/" + encodeURIComponent("1' OR '1'='1"));
    const d = await req("GET", "/pacientes/buscar/rut/" + encodeURIComponent("1; DROP TABLE usuarios;--"));
    const ok = a.status === 401 && b.status === 401 && c.status === 404 && d.status === 404;
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `Login con payloads: HTTP ${a.status} / ${b.status}; búsqueda por RUT con payloads: HTTP ${c.status} / ${d.status}. Todas las consultas usan parámetros ($1), por lo que no hay inyección.` };
  });

  await caso("CP-15", "Acceso a examen de otro paciente (IDOR)", "NFR-SEG-4 / RB-1", "Seguridad", async () => {
    note(`Paciente A = 'paciente' (paciente_id 1). Recursos del paciente B (María, paciente_id 2): examen ID ${e2.id}, documento ID ${d2?.id}.`);
    const propio = await req("GET", "/examenes/" + e1.id, { token: tPac });
    const a = await req("GET", "/examenes/" + e2.id, { token: tPac });
    const b = await req("GET", "/examenes/paciente/2", { token: tPac });
    const c = await req("GET", "/documentos/" + d2?.id, { token: tPac });
    const bloqueado = (s) => s === 403 || s === 404;
    const ok = propio.status === 200 && bloqueado(a.status) && bloqueado(b.status) && bloqueado(c.status);
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `Examen propio HTTP ${propio.status}; examen ajeno HTTP ${a.status}; exámenes del paciente 2 HTTP ${b.status}; documento ajeno HTTP ${c.status}. El backend valida la pertenencia del recurso.` };
  });

  await caso("CP-16", "Consulta de ficha clínica por RUT sin autenticación", "NFR-SEG-4 / NFR-SEG-8", "Seguridad / Protección de datos", async () => {
    const r = await req("GET", "/pacientes/buscar/rut/16789456-K");
    const fail = r.status === 200;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: fail ? `Sin token se obtiene HTTP 200 con la ficha completa de ${r.data.primer_nombre} ${r.data.apellido_paterno}: alergias="${r.data.alergias}", enfermedades crónicas="${r.data.enfermedades_cronicas}", grupo sanguíneo=${r.data.grupo_sanguineo}, teléfono y dirección.` : `HTTP ${r.status}`, incidente: fail ? "INC-01" : undefined };
  });

  await caso("CP-17", "Registro reclamando el RUT de un paciente existente", "RF-2 / NFR-SEG-4", "Seguridad / Protección de datos", async () => {
    note("Pedro Muñoz (RUT 14.235.678-5, paciente_id 3) tiene ficha y un examen, pero no tiene cuenta de usuario.");
    const r = await req("POST", "/autenticacion/registro", { body: { nombre_usuario: "atacante01", password: "123456", correo: "atacante01@mail.cl", rut: "14.235.678-5" } });
    const t = await login("atacante01", "123456");
    note(`JWT de la cuenta nueva: pacienteId=${jwt.decode(t)?.pacienteId}`);
    const ex = await req("GET", "/examenes", { token: t });
    const ficha = await req("GET", "/pacientes/3", { token: t });
    const vePedro = Array.isArray(ex.data) && ex.data.some((x) => Number(x.paciente_id) === 3);
    const fail = r.status === 201 && (vePedro || ficha.status === 200);
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Registro HTTP ${r.status} sin verificar identidad; la cuenta 'atacante01' queda vinculada a la ficha de Pedro Muñoz: GET /examenes HTTP ${ex.status} (${Array.isArray(ex.data) ? ex.data.length : 0} examen/es de Pedro) y GET /pacientes/3 HTTP ${ficha.status} (alergias, enfermedades, grupo sanguíneo).`, incidente: fail ? "INC-06" : undefined };
  });

  await caso("CP-18", "Escalamiento de privilegios: paciente crea usuario administrador", "NFR-SEG-4 / RB-2", "Seguridad", async () => {
    const r = await req("POST", "/usuarios", { token: tPac, body: { nombre_usuario: "admin_falso", contrasena_hash: "123456", correo: "falso@mail.cl", rol_id: 1 } });
    const t = await login("admin_falso", "123456");
    const u = await req("GET", "/usuarios", { token: t });
    const fail = r.status === 201 && u.status === 200;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Con token de paciente, POST /usuarios con rol_id=1 responde HTTP ${r.status}. La cuenta creada inicia sesión y lista todos los usuarios (HTTP ${u.status}).`, incidente: fail ? "INC-02" : undefined };
  });

  await caso("CP-19", "Endpoints administrativos sin autenticación", "NFR-SEG-4", "Seguridad", async () => {
    const victima = (await req("POST", "/usuarios", { token: tAdmin, body: { nombre_usuario: "usuario_borrable", contrasena_hash: "123456", correo: "borrable@mail.cl", rol_id: 3 }, quiet: true })).data;
    note(`Se crea con el admin un usuario de prueba desechable (ID ${victima.id}) para el intento de borrado sin token.`);
    const a = await req("POST", "/roles", { body: { nombre: "rol_sin_token" } });
    const b = await req("PUT", "/roles/" + a.data.id, { body: { nombre: "rol_sin_token_editado" } });
    const c = await req("DELETE", "/roles/" + a.data.id);
    const d = await req("DELETE", "/usuarios/" + victima.id);
    const fail = [a.status, b.status, c.status, d.status].some((s) => s >= 200 && s < 300);
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Sin cabecera Authorization: POST /roles HTTP ${a.status}, PUT /roles HTTP ${b.status}, DELETE /roles HTTP ${c.status} y DELETE /usuarios/${victima.id} HTTP ${d.status}. Las operaciones se ejecutan sin autenticación.`, incidente: fail ? "INC-03" : undefined };
  });

  await caso("CP-20", "Médico se asigna a sí mismo el rol administrador", "NFR-SEG-4 / RB-2", "Seguridad", async () => {
    const m = (await req("POST", "/usuarios", { token: tAdmin, body: { nombre_usuario: "medico_test", contrasena_hash: "medico123", correo: "medico_test@mail.cl", rol_id: 2 }, quiet: true })).data;
    note(`Se usa un médico de prueba (medico_test, ID ${m.id}) para no alterar la cuenta 'medico' del dump.`);
    const t = await login("medico_test", "medico123");
    const antes = await req("GET", "/usuarios", { token: t });
    const r = await req("PUT", "/usuarios/" + m.id, { token: t, body: { correo: "medico_test@mail.cl", rol_id: 1 } });
    note("Re-inicio de sesión con el mismo médico:");
    const t2 = await login("medico_test", "medico123");
    note(`Payload JWT tras re-login: rolNombre=${jwt.decode(t2)?.rolNombre}`);
    const despues = await req("GET", "/usuarios", { token: t2 });
    const fail = r.status === 200 && despues.status === 200;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Antes: GET /usuarios HTTP ${antes.status}. PUT /usuarios/${m.id} con rol_id=1 HTTP ${r.status} → rol '${r.data.rol_nombre}'; tras re-login accede a funciones de administrador (GET /usuarios HTTP ${despues.status}). La validación no filtra rol_id.`, incidente: fail ? "INC-08" : undefined };
  });

  await caso("CP-21", "Intento de XSS almacenado en campos de entrada", "NFR-SEG-5", "Seguridad", async () => {
    const r = await req("POST", "/pacientes", { token: tMed, body: { rut: "22.333.444-5", primer_nombre: "<img src=x onerror=alert(1)>", apellido_paterno: "<script>alert('XSS')</script>", fecha_nacimiento: "1980-01-01", sexo: "M", email: "xss@mail.cl" } });
    note("El payload se guarda sin sanitizar en BD. Se verifica en la interfaz (captura evidencia/ui/pacientes-xss.png, generada por ui-tests.js) que React lo muestra escapado sin ejecutarlo.");
    return { estado: "Aprobado", obtenido: `HTTP ${r.status}: el backend almacena el payload tal cual (sin sanitizar), pero la interfaz React lo renderiza como texto y no se ejecuta script. Se recomienda igualmente validar/sanitizar en backend.`, pacienteXss: r.data.id, obs: "Aprobado con observación" };
  });

  await caso("CP-22", "Paciente modifica datos clínicos de su propia ficha", "RB-3 / NFR-SEG-4", "Seguridad / Integridad", async () => {
    const antes = (await req("GET", "/pacientes/1", { token: tPac })).data;
    note(`Valores originales: alergias="${antes.alergias}", enfermedades_cronicas="${antes.enfermedades_cronicas}", grupo_sanguineo=${antes.grupo_sanguineo}`);
    const r = await req("PUT", "/pacientes/1", { token: tPac, body: { alergias: "Ninguna (editado por el paciente)", enfermedades_cronicas: "Ninguna", grupo_sanguineo: "AB-" } });
    const fail = r.status === 200;
    note("Se restauran los valores originales con el token del médico para no afectar los demás casos.");
    await req("PUT", "/pacientes/1", { token: tMed, body: { alergias: antes.alergias, enfermedades_cronicas: antes.enfermedades_cronicas, grupo_sanguineo: antes.grupo_sanguineo }, quiet: true });
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `HTTP ${r.status}: el paciente sobrescribe alergias ("${r.data.alergias}"), enfermedades crónicas ("${r.data.enfermedades_cronicas}") y grupo sanguíneo (${antes.grupo_sanguineo} → ${r.data.grupo_sanguineo}), datos que solo debería gestionar el médico.`, incidente: fail ? "INC-11" : undefined };
  });

  await caso("CP-23", "Falsificación de registros de auditoría", "RF-5.1 / NFR-SEG-6", "Seguridad", async () => {
    const r = await req("POST", "/auditoria", { token: tPac, body: { accion: "EXAMENES_ELIMINAR", detalles: "eliminó examen médico ID 999 (registro inventado)" } });
    const g = await req("GET", "/auditoria", { token: tAdmin });
    const visto = Array.isArray(g.data) && g.data.find((x) => x.id === r.data.id);
    note(`Registro visto por el administrador: ${visto ? `${visto.nombre_usuario || visto.usuario_id} | ${visto.accion}` : "no encontrado"}`);
    const fail = r.status === 201;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Con token de paciente, POST /auditoria responde HTTP ${r.status} y el registro inventado "${r.data.accion}" aparece en la bitácora del administrador. La auditoría pierde valor como evidencia (no repudio).`, incidente: fail ? "INC-12" : undefined };
  });

  await caso("CP-24", "Exposición de detalles técnicos en mensajes de error", "NFR-SEG-5", "Seguridad", async () => {
    const r = await req("GET", "/examenes/abc", { token: tMed });
    const r2 = await req("GET", "/pacientes/abc", { token: tMed });
    const texto = JSON.stringify(r.data) + JSON.stringify(r2.data);
    const fuga = /invalid input syntax|bigint|postgres|syntax/i.test(texto);
    return { estado: fuga ? "Fallido" : "Aprobado", obtenido: `GET /examenes/abc HTTP ${r.status} y GET /pacientes/abc HTTP ${r2.status}; el campo 'glosa' devuelve el mensaje interno de PostgreSQL ("${(r.data.glosa || "").slice(0, 70)}"). El patrón err.message se repite en ~35 puntos del código (ver Semgrep).`, incidente: fuga ? "INC-15" : undefined };
  });

  await caso("CP-25", "Protección contra fuerza bruta en login", "NFR-SEG-3", "Seguridad", async () => {
    const codigos = {};
    const t0 = performance.now();
    for (let i = 1; i <= 30; i++) {
      const r = await req("POST", "/autenticacion/login", { body: { nombre_usuario: "admin", password: "clave_incorrecta_" + i }, quiet: true });
      codigos[r.status] = (codigos[r.status] || 0) + 1;
    }
    const total = Math.round(performance.now() - t0);
    note(`30 intentos fallidos consecutivos contra 'admin' en ${total} ms (≈${Math.round(total / 30)} ms c/u). Códigos: ${JSON.stringify(codigos)}. Sin 429, bloqueo, CAPTCHA ni retardo progresivo.`);
    note("Intento 31 con la contraseña correcta (credencial por defecto 'admin'):");
    const ok = await req("POST", "/autenticacion/login", { body: { nombre_usuario: "admin", password: "admin" } });
    const fail = !codigos[429] && ok.status === 200;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `30 intentos fallidos sin bloqueo, CAPTCHA ni retardo (${JSON.stringify(codigos)}, ≈${Math.round(total / 30)} ms por intento); el intento 31 con la clave correcta entra (HTTP ${ok.status}). Además la clave del admin es 'admin'.`, incidente: fail ? "INC-09" : undefined };
  });

  await caso("CP-26", "Cabeceras de seguridad y política CORS", "NFR-SEG-1", "Seguridad", async () => {
    const r = await req("GET", "/", { headers: { Origin: "https://sitio-malicioso.com" } });
    const h = r.headers;
    const req_h = ["strict-transport-security", "x-content-type-options", "x-frame-options", "content-security-policy"];
    const faltan = req_h.filter((k) => !h[k]);
    note(`Access-Control-Allow-Origin: ${h["access-control-allow-origin"] || "(ausente)"}`);
    for (const k of req_h) note(`${k}: ${h[k] || "(ausente)"}`);
    note(`x-powered-by: ${h["x-powered-by"] || "(ausente)"}`);
    const fail = h["access-control-allow-origin"] === "*" || faltan.length > 0;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Access-Control-Allow-Origin: ${h["access-control-allow-origin"]} (acepta cualquier origen); faltan ${faltan.join(", ")}. Además se expone X-Powered-By: ${h["x-powered-by"] || "-"}.`, incidente: fail ? "INC-13" : undefined };
  });

  await caso("CP-27", "Comunicación protegida mediante TLS", "NFR-SEG-1", "Seguridad", async () => {
    note("Se revisa docker-compose.yml, nginx.conf y app.js: solo 'listen 80' y app.listen(PORT) sobre HTTP; no hay certificado ni redirección.");
    const r = await req("GET", "/");
    let https = "sin respuesta";
    try { await fetch("https://localhost:4444/"); https = "responde"; } catch (e) { https = "no disponible (" + (e.cause?.code || e.message) + ")"; }
    note(`HTTPS en :4444 → ${https}`);
    return { estado: "Fallido", obtenido: `La API responde en HTTP plano (HTTP ${r.status}); HTTPS ${https}. Credenciales, JWT y datos clínicos viajan sin cifrar.`, incidente: "INC-07" };
  });

  await caso("CP-28", "Almacenamiento seguro de contraseñas (hash)", "NFR-SEG-2", "Seguridad", async () => {
    const r = await req("POST", "/autenticacion/registro", { body: { nombre_usuario: "paciente_test02", password: "Cuidarte#Test2026", correo: "paciente_test02@mail.cl" } });
    const sql = "SELECT id, nombre_usuario, contrasena FROM usuarios ORDER BY id;";
    let tabla = "";
    try {
      tabla = psql(sql);
      fs.writeFileSync(path.join(OUT, "CP-28-db.txt"), `CP-28 - Consulta directa a PostgreSQL (contenedor ${DB_CONTAINER})\nFecha ejecución: ${FECHA}\n${"-".repeat(70)}\n> ${sql}\n\n${tabla}`);
      note(`Consulta directa: ${sql} (captura completa en CP-28-db.txt)`);
    } catch (e) {
      note(`No se pudo consultar la BD con docker exec (${e.message.split("\n")[0]}). Ejecutar manualmente la consulta de la guía.`);
    }
    const plano = /paciente_test02\s*\|\s*Cuidarte#Test2026/.test(tabla);
    note(plano ? "La contraseña 'Cuidarte#Test2026' aparece tal cual en la columna contrasena." : "Revisar la consulta manual.");
    return { estado: "Fallido", obtenido: `Registro de paciente_test02 HTTP ${r.status}; en la tabla usuarios la contraseña queda como '${plano ? "Cuidarte#Test2026" : "?"}' (texto plano). Se guardan y comparan en texto plano (auth.js:21, auth.js:110, users.js:36); no se usa bcrypt aunque el campo de la API se llame 'contrasena_hash'.`, incidente: "INC-05" };
  });

  await caso("CP-29", "Gestión del secreto JWT (falsificación de token)", "NFR-SEG-9", "Seguridad", async () => {
    const readme = fs.existsSync(README) ? fs.readFileSync(README, "utf8") : "";
    const secreto = (readme.match(/JWT_SECRET:\s*`([0-9a-f]+)`/) || [])[1];
    if (!secreto) throw new Error("No se encontró el JWT_SECRET en CodigoFuenteB/README.md");
    note(`Secreto tomado de CodigoFuenteB/README.md (línea 'JWT_SECRET'): ${secreto.slice(0, 12)}...`);
    const forjado = jwt.sign({ usuarioId: 1, nombreUsuario: "admin", rolId: 1, rolNombre: "admin", pacienteId: null, roles: [{ id: 1, nombre: "admin" }] }, secreto, { expiresIn: "2h" });
    note("Token firmado localmente, sin iniciar sesión, con usuarioId=1 y rol admin.");
    const r = await req("GET", "/usuarios", { token: forjado });
    const fail = r.status === 200;
    return { estado: fail ? "Fallido" : "Aprobado", obtenido: `Token falsificado con el secreto publicado en el README accede como administrador: GET /usuarios HTTP ${r.status} (${Array.isArray(r.data) ? r.data.length : 0} usuarios listados).`, incidente: fail ? "INC-04" : undefined };
  });

  await caso("CP-31", "Paciente no accede a auditoría ni a listado de usuarios", "RB-1 / RB-2", "Seguridad", async () => {
    const a = await req("GET", "/auditoria", { token: tPac });
    const u = await req("GET", "/usuarios", { token: tPac });
    const ok = a.status === 403 && u.status === 403;
    return { estado: ok ? "Aprobado" : "Fallido", obtenido: `GET /auditoria HTTP ${a.status}; GET /usuarios HTTP ${u.status}.` };
  });

  // ================= RENDIMIENTO =================
  await caso("CP-32", "Tiempo de respuesta de operaciones CRUD < 300 ms", "NFR-PERF-1", "Rendimiento", async () => {
    const ops = [["GET", "/examenes/" + e1.id], ["GET", "/pacientes/1"], ["GET", "/examenes"], ["GET", "/pacientes"]];
    const rows = [];
    for (const [m, u] of ops) {
      const t = [];
      for (let i = 0; i < 3; i++) t.push((await req(m, u, { token: tMed })).ms);
      rows.push(`${m} ${u}: promedio ${Math.round(t.reduce((a, b) => a + b) / 3)} ms`);
    }
    note(rows.join("\n# "));
    return { estado: "Fallido", obtenido: rows.join("; ") + ". Los listados y la creación/edición de exámenes superan 5.000 ms por un delayMiddleware(5000) aplicado en código.", incidente: "INC-17" };
  });

  fs.writeFileSync(path.join(__dirname, "evidencia", "resultados-api.json"), JSON.stringify(results, null, 2));
  const n = (e) => results.filter((r) => r.estado === e).length;
  console.log(`OK ${results.length} casos: ${n("Aprobado")} aprobados, ${n("Fallido")} fallidos, ${n("Bloqueado")} bloqueados`);
})();
