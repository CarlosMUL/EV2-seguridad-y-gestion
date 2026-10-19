import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { api } from "../../lib/api.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import bgRegistro from "../../assets/bg-registro.jpg";
import * as yup from "yup";
import { formatRut, RutFormat } from "@fdograph/rut-utilities";
import { normalizeRut } from "../../lib/utils";

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

export default function Register() {
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      await api.post("/autenticacion/registro", {
        nombre_usuario: values.nombre_usuario,
        password: values.password,
        correo: values.correo,
        rut: values.rut ? normalizeRut(values.rut) : undefined,
      });
      toast.success("Cuenta creada exitosamente, ahora inicia sesión");
      navigate("/login");
    } catch {
      // El interceptor de api ya maneja los toasts de error
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden p-0">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgRegistro})` }}
      ></div>

      <div className="w-full md:w-6/12 min-h-screen relative z-10 bg-white flex items-center justify-center shadow-lg overflow-y-auto">
        <div className="px-8 py-8 md:py-4 w-full max-w-2xl my-auto">
          <h2 className="font-bold text-4xl text-center mb-2 text-primary">
            Registro de Paciente
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Crea tu cuenta para acceder a tus resultados médicos
          </p>

          <Formik
            initialValues={{
              nombre_usuario: "",
              correo: "",
              password: "",
              rut: "",
            }}
            validationSchema={registerSchema}
            onSubmit={onSubmit}
          >
            {({ setFieldValue }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre_usuario"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre de usuario *
                  </label>
                  <Field
                    id="nombre_usuario"
                    name="nombre_usuario"
                    type="text"
                    data-testid="input-registro-nombre-usuario"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-secondary transition-colors"
                  />
                  <ErrorMessage
                    name="nombre_usuario"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="correo"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Correo electrónico *
                  </label>
                  <Field
                    id="correo"
                    name="correo"
                    type="email"
                    data-testid="input-registro-correo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-secondary transition-colors"
                  />
                  <ErrorMessage
                    name="correo"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rut"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    RUT (opcional)
                  </label>
                  <Field
                    id="rut"
                    name="rut"
                    type="text"
                    data-testid="input-registro-rut"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-secondary transition-colors"
                    onBlur={(e) => {
                      const formatted = formatRut(e.target.value, RutFormat.DOTS_DASH);
                      setFieldValue("rut", formatted);
                    }}
                  />
                  <ErrorMessage
                    name="rut"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contraseña *
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    data-testid="input-registro-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-secondary transition-colors"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="button-registro-crear-cuenta"
                  className="w-full mt-4 py-3 text-lg font-semibold bg-secondary text-primary rounded-lg hover:bg-[#e6a600] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Crear cuenta
                </button>

                <p className="text-center mt-4 text-gray-600 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    data-testid="link-login"
                    className="text-primary font-semibold no-underline hover:text-secondary hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
