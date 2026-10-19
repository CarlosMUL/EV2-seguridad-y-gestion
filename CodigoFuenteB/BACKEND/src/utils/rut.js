/**
 * Normaliza un RUT removiendo los puntos, dejando solo números, guión y dígito verificador
 * Ejemplo: "12.345.678-9" -> "12345678-9"
 */
function normalizeRut(rut) {
  if (!rut) return rut;
  return rut.replace(/\./g, "");
}

module.exports = {
  normalizeRut,
};

