const yup = require("yup");

const examenMedicoSchema = yup.object().shape({
  tipo_examen_medico_id: yup
    .number()
    .integer("El tipo de examen médico debe ser un número entero")
    .required("El tipo de examen médico es requerido")
    .positive("El tipo de examen médico debe ser un ID válido"),
  paciente_id: yup
    .number()
    .integer("El paciente debe ser un número entero")
    .required("El paciente es requerido")
    .positive("El paciente debe ser un ID válido"),
  diagnosis: yup
    .string()
    .max(2000, "El diagnóstico no puede exceder 2000 caracteres")
    .optional(),
  tratamiento: yup
    .string()
    .max(2000, "El tratamiento no puede exceder 2000 caracteres")
    .optional(),
  observaciones: yup
    .string()
    .max(2000, "Las observaciones no pueden exceder 2000 caracteres")
    .optional(),
  notas: yup
    .string()
    .max(2000, "Las notas no pueden exceder 2000 caracteres")
    .optional(),
});

const updateExamenMedicoSchema = examenMedicoSchema.shape({
  tipo_examen_medico_id: yup
    .number()
    .integer("El tipo de examen médico debe ser un número entero")
    .positive("El tipo de examen médico debe ser un ID válido")
    .optional(),
  paciente_id: yup
    .number()
    .integer("El paciente debe ser un número entero")
    .positive("El paciente debe ser un ID válido")
    .optional(),
}).test(
  "at-least-one-field",
  "Debe proporcionar al menos un campo para actualizar",
  function (value) {
    return Object.keys(value).length > 0;
  }
);

module.exports = {
  examenMedicoSchema,
  updateExamenMedicoSchema,
};

