const yup = require("yup");

const loginSchema = yup.object().shape({
  nombre_usuario: yup
    .string()
    .required("El nombre de usuario es requerido")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),
  password: yup
    .string()
    .required("La contraseña es requerida")
    .min(1, "La contraseña es requerida"),
});

const registerSchema = yup.object().shape({
  nombre_usuario: yup
    .string()
    .required("El nombre de usuario es requerido")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),
  password: yup
    .string()
    .required("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  correo: yup
    .string()
    .required("El correo es requerido")
    .email("El correo debe tener un formato válido")
    .max(255, "El correo no puede exceder 255 caracteres"),
  rut: yup
    .string()
    .matches(/^([0-9]{1,2}(\.[0-9]{3})*-[0-9kK]|[0-9]+-[0-9kK])$/, "El RUT debe tener formato válido (ej: 12.345.678-9 o 12345678-9)")
    .optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
};
