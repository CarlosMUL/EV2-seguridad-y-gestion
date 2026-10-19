# Cuidarte+ — Pruebas de seguridad y calidad (ISY1102 EP2)

Kit de pruebas, evidencia y código fuente del caso Cuidarte+ (software **intencionalmente vulnerable**,
solo para uso académico en ambiente local con datos ficticios).

- `CodigoFuenteB/` — software del caso entregado por el docente (React + Express + PostgreSQL, Docker).
- `pruebas/` — scripts de los 28 casos de prueba (API, UI, renderizado de evidencia) y reglas Semgrep.
- `evidencia/` — resultados y capturas que respaldan el informe.
- `GUIA_PRUEBAS.md` — guía completa paso a paso.

## Inicio rápido (PowerShell, requiere Docker Desktop y Node.js 18+)

```powershell
cd CodigoFuenteB
docker compose up -d --build          # frontend :3333, API :4444, PostgreSQL :15442

cd ..\pruebas
npm install
npx playwright install chromium
npm run test:api                      # 26 casos de API
npm run test:ui                       # CP-21, CP-35 y CP-37
npm run evidencias                    # genera las imágenes en pruebas/evidencia/img
```

Antes de repetir las pruebas, reiniciar la base: `docker compose down -v` y `docker compose up -d`
(dentro de `CodigoFuenteB`).
