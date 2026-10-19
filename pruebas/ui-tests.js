// Pruebas de interfaz del informe EP2: CP-35 (accesibilidad WCAG 2.1 AA), CP-37 (responsivo móvil/tablet) y CP-21 (XSS en la UI).
// Requiere el frontend corriendo (http://localhost:3333) y el backend (http://localhost:4444).
// Para CP-21, correr antes run-tests.js (ahí se crea el paciente con el payload XSS).
const { chromium, devices } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "evidencia", "ui");
fs.mkdirSync(OUT, { recursive: true });
const WEB = process.env.WEB_URL || "http://localhost:3333";
const res = {};

async function loginUI(page, u, p) {
  await page.goto(WEB + "/login");
  await page.fill('input[name="nombre_usuario"]', u);
  await page.fill('input[name="password"]', p);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/home", { timeout: 20000 });
}

(async () => {
  const browser = await chromium.launch(); // usa el Chromium instalado por Playwright
  let ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  let page = await ctx.newPage();

  // ================= CP-35 — Accesibilidad (NFR-USAB-1) =================
  // Login: captura + axe-core + navegacion por teclado
  await page.goto(WEB + "/login");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: OUT + "/login.png" });
  const axeLogin = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const focos = [];
  for (let i = 0; i < 4; i++) { await page.keyboard.press("Tab"); focos.push(await page.evaluate(() => document.activeElement.name || document.activeElement.innerText.slice(0, 20))); }

  // Dashboard del medico: captura + axe-core
  await loginUI(page, "medico", "medico");
  await page.waitForLoadState("networkidle", { timeout: 60000 });
  await page.screenshot({ path: OUT + "/home-medico.png" });
  const axeHome = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

  // ================= CP-21 — XSS en la interfaz (NFR-SEG-5) =================
  let dialog = null;
  page.on("dialog", async (d) => { dialog = d.message(); await d.dismiss(); });
  await page.goto(WEB + "/pacientes");
  await page.waitForLoadState("networkidle", { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT + "/pacientes-xss.png" });
  res["CP-21"] = {
    xssSeEjecuto: dialog !== null, // false = el script no se ejecuto (correcto)
    resultado: dialog === null ? "Aprobado con observación (el payload se muestra como texto)" : "Fallido (se ejecutó el script)",
  };
  await ctx.close();

  // CP-35 (cont.) — tamaño de controles tactiles en movil
  ctx = await browser.newContext({ ...devices["iPhone 12"] });
  page = await ctx.newPage();
  await page.goto(WEB + "/login");
  await page.waitForLoadState("networkidle");
  const pequenos = await page.evaluate(() => [...document.querySelectorAll("button,input,a")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).length);
  await page.screenshot({ path: OUT + "/login-movil.png" });
  await ctx.close();

  // ================= CP-37 — Responsivo en móvil y tablet (NFR-COMPAT-2) =================
  // Se revisa /login y /home (sesión de médico) emulando iPhone 12 (390x844) e iPad (810x1080)
  const dispositivos = { "iPhone 12": devices["iPhone 12"], iPad: devices["iPad (gen 7)"] };
  const responsivo = [];
  for (const [nombre, dev] of Object.entries(dispositivos)) {
    ctx = await browser.newContext({ ...dev });
    page = await ctx.newPage();
    const slug = nombre.toLowerCase().replace(/\s+/g, "");
    for (const vista of ["login", "home"]) {
      if (vista === "login") { await page.goto(WEB + "/login"); await page.waitForLoadState("networkidle"); }
      else { await loginUI(page, "medico", "medico"); await page.waitForLoadState("networkidle", { timeout: 60000 }); }
      const m = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        // Se ignora el menú lateral oculto (off-canvas, queda a la izquierda fuera de pantalla hasta abrir ☰)
        // y los elementos dentro de contenedores con desplazamiento propio (barra de pestañas)
        const conScrollPropio = (e) => { for (let a = e.parentElement; a; a = a.parentElement) if (/auto|scroll/.test(getComputedStyle(a).overflowX)) return true; return false; };
        const fuera = [...document.querySelectorAll("button,input,a,h1,h2,h3,table")].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.right > 0 && r.right > vw + 1 && !conScrollPropio(e);
        }).length;
        return { anchoViewport: vw, anchoContenido: document.documentElement.scrollWidth, elementosFueraDePantalla: fuera };
      });
      m.scrollHorizontal = m.anchoContenido > m.anchoViewport;
      await page.screenshot({ path: `${OUT}/${vista}-${slug}.png`, fullPage: true });
      responsivo.push({ dispositivo: nombre, viewport: `${dev.viewport.width}x${dev.viewport.height}`, vista, ...m });
    }
    await ctx.close();
  }
  res["CP-37"] = {
    vistas: responsivo,
    resultado: responsivo.every((v) => !v.scrollHorizontal && v.elementosFueraDePantalla === 0) ? "Aprobado" : "Fallido",
  };

  const resumenAxe = (a) => a.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  const serios = [...axeLogin.violations, ...axeHome.violations].filter((v) => ["serious", "critical"].includes(v.impact)).length;
  res["CP-35"] = {
    axeLogin: resumenAxe(axeLogin),
    axeHome: resumenAxe(axeHome),
    ordenTeclado: focos,
    controlesMenores44pxEnMovil: pequenos,
    resultado: serios === 0 && pequenos === 0 ? "Aprobado" : "Fallido (INC-18)",
  };

  await browser.close();
  fs.writeFileSync(path.join(__dirname, "evidencia", "resultados-ui.json"), JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res, null, 2));
})();
