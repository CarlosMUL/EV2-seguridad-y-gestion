// Convierte los logs de ejecucion (evidencia/casos/*.txt) en imagenes PNG legibles
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "evidencia", "casos");
const OUT = path.join(__dirname, "evidencia", "img");
fs.mkdirSync(OUT, { recursive: true });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function line2html(line) {
  const l = esc(line.length > 240 ? line.slice(0, 237) + "..." : line);
  let cls = "";
  if (line.startsWith("> ")) cls = "req";
  else if (/^< HTTP 2\d\d/.test(line)) cls = "ok";
  else if (/^< HTTP/.test(line)) cls = "er";
  else if (line.startsWith("#")) cls = "nt";
  else if (line.startsWith("RESULTADO: FALLIDO")) cls = "fail";
  else if (line.startsWith("RESULTADO: APROBADO")) cls = "pass";
  else if (/^(CP-|Requerimiento|Ambiente|Fecha)/.test(line)) cls = "hd";
  return cls ? `<span class="${cls}">${l}</span>` : l;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 400 }, deviceScaleFactor: 2 });
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".txt")).sort();
  const css = "body{margin:0;background:#fff;font-family:monospace}" +
    ".win{margin:8px;border-radius:8px;overflow:hidden;border:1px solid #2b2f36;width:1050px}" +
    ".bar{background:#2b2f36;color:#fff;font:13px Arial;padding:7px 12px}" +
    "pre{margin:0;background:#1e2127;color:#d7dae0;padding:12px 14px;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-word}" +
    ".req{color:#7fb5ff}.ok{color:#5fd38d}.er{color:#ff7b72}.nt{color:#c9a26b}.hd{color:#9ea7b3}" +
    ".pass{color:#5fd38d;font-weight:bold}.fail{color:#ff7b72;font-weight:bold}";
  for (const f of files) {
    if (f.startsWith("_")) continue;
    const id = f.replace(".txt", "");
    const body = fs.readFileSync(`${DIR}/${f}`, "utf8").split("\n").map(line2html).join("\n");
    const html = `<html><head><meta charset="utf-8"><style>${css}</style></head><body>` +
      `<div class="win"><div class="bar">QA Cuidarte+ — evidencia de ejecucion ${id}</div>` +
      `<pre>${body}</pre></div></body></html>`;
    await p.setContent(html);
    const el = await p.$(".win");
    await el.screenshot({ path: `${OUT}/${id}.png` });
  }
  await b.close();
  console.log("Capturas generadas:", files.length);
})();
