const yup = require("yup");

const pacienteSchema = yup.object().shape({
  // Información personal
  rut: yup
    .string()
    .required("El RUT es requerido")
    .matches(/^([0-9]{1,2}(\.[0-9]{3})*-[0-9kK]|[0-9]+-[0-9kK])$/, "El RUT debe tener formato válido (ej: 12.345.678-9 o 12345678-9)"),
  primer_nombre: yup
    .string()
    .required("El primer nombre es requerido")
    .min(2, "El primer nombre debe tener al menos 2 caracteres")
    .max(50, "El primer nombre no puede exceder 50 caracteres"),
  apellido_paterno: yup
    .string()
    .required("El apellido paterno es requerido")
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(50, "El apellido paterno no puede exceder 50 caracteres"),
  apellido_materno: yup
    .string()
    .max(50, "El apellido materno no puede exceder 50 caracteres")
    .optional(),
  fecha_nacimiento: yup
    .date()
    .required("La fecha de nacimiento es requerida")
    .max(new Date(), "La fecha de nacimiento no puede ser futura"),
  sexo: yup
    .string()
    .required("El sexo es requerido")
    .oneOf(["M", "F", "O"], "El sexo debe ser M, F u O"),
  nacionalidad: yup
    .string()
    .max(50, "La nacionalidad no puede exceder 50 caracteres")
    .optional(),
  estado_civil: yup
    .string()
    .oneOf(["soltero", "casado", "divorciado", "viudo", "union_libre"], "Estado civil inválido")
    .optional(),
  // Información de contacto
  email: yup
    .string()
    .required("El email es requerido")
    .email("El email debe tener un formato válido")
    .max(255, "El email no puede exceder 255 caracteres"),
  telefono: yup
    .string()
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .optional(),
  direccion: yup
    .string()
    .max(255, "La dirección no puede exceder 255 caracteres")
    .optional(),
  contacto_emergencia_nombre: yup
    .string()
    .max(100, "El nombre del contacto de emergencia no puede exceder 100 caracteres")
    .optional(),
  contacto_emergencia_telefono: yup
    .string()
    .max(20, "El teléfono del contacto de emergencia no puede exceder 20 caracteres")
    .optional(),
  contacto_emergencia_relacion: yup
    .string()
    .max(50, "La relación del contacto de emergencia no puede exceder 50 caracteres")
    .optional(),
  // Información de previsión social
  tipo_prevision: yup
    .string()
    .max(50, "El tipo de previsión no puede exceder 50 caracteres")
    .optional(),
  tiene_convenio: yup
    .boolean()
    .optional(),
  // Información médica
  grupo_sanguineo: yup
    .string()
    .oneOf(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "Grupo sanguíneo inválido")
    .optional(),
  alergias: yup
    .string()
    .max(500, "Las alergias no pueden exceder 500 caracteres")
    .optional(),
  enfermedades_cronicas: yup
    .string()
    .max(500, "Las enfermedades crónicas no pueden exceder 500 caracteres")
    .optional(),
  discapacidades: yup
    .string()
    .max(500, "Las discapacidades no pueden exceder 500 caracteres")
    .optional(),
  observaciones_medicas_generales: yup
    .string()
    .max(1000, "Las observaciones médicas no pueden exceder 1000 caracteres")
    .optional(),
});

const updatePacienteSchema = pacienteSchema.shape({
  rut: yup
    .string()
    .matches(/^([0-9]{1,2}(\.[0-9]{3})*-[0-9kK]|[0-9]+-[0-9kK])$/, "El RUT debe tener formato válido (ej: 12.345.678-9 o 12345678-9)")
    .optional(),
  primer_nombre: yup
    .string()
    .min(2, "El primer nombre debe tener al menos 2 caracteres")
    .max(50, "El primer nombre no puede exceder 50 caracteres")
    .optional(),
  apellido_paterno: yup
    .string()
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(50, "El apellido paterno no puede exceder 50 caracteres")
    .optional(),
  fecha_nacimiento: yup
    .date()
    .max(new Date(), "La fecha de nacimiento no puede ser futura")
    .optional(),
  sexo: yup
    .string()
    .oneOf(["M", "F", "O"], "El sexo debe ser M, F u O")
    .optional(),
  email: yup
    .string()
    .email("El email debe tener un formato válido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional(),
}).test(
  "at-least-one-field",
  "Debe proporcionar al menos un campo para actualizar",
  function (value) {
    return Object.keys(value).length > 0;
  }
);

module.exports = {
  pacienteSchema,
  updatePacienteSchema,
};

