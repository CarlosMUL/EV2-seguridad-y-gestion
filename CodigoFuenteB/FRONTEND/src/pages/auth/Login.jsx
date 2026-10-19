import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import bgRegistro from "../../assets/bg-registro.jpg";
import { toast } from "sonner";
import Logo from "../../assets/logo.svg";
import LogoDuoc from "../../assets/logo-duoc.svg";
import HelpIcon from "@mui/icons-material/Help";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { loginSchema } from "../../validations/auth";
import { useState } from "react";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Sesión iniciada");
      navigate("/home", { replace: true });
    } catch {
      toast.error("Credenciales inválidas");
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-row items-center justify-cente relative overflow-hidden p-0">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgRegistro})` }}
      ></div>

      <div className="w-6/12 min-h-screen relative z-10 bg-white flex items-center justify-center shadow-lg">
        <div className="p-8 w-full max-w-md">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 8,
            }}
          >
            <img src={Logo} alt="Logo" width={200} />
          </Box>
          <h2 className="font-bold text-4xl text-center mb-6 text-primary">
            Iniciar Sesión
          </h2>
          <Formik
            initialValues={{ nombre_usuario: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre_usuario"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre de usuario
                  </label>
                  <Field
                    id="nombre_usuario"
                    name="nombre_usuario"
                    type="text"
                    data-testid="input-nombre-usuario"
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
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contraseña
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    data-testid="input-password"
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
                  disabled={loading || isSubmitting}
                  data-testid="button-login"
                  className="w-full text-white mt-4 py-3 text-lg font-semibold bg-secondary rounded-lg hover:bg-primary hover:shadow-lg hover:-translate-y-0.5 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? "Ingresando..." : "Entrar"}
                </button>
                <p className="text-center mt-4 text-gray-600 text-sm">
                  ¿No tienes cuenta?{" "}
                  <Link
                    to="/registro"
                    data-testid="link-registro"
                    className="text-primary font-semibold no-underline hover:text-secondary hover:underline"
                  >
                    Regístrate
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Botón fijo en la parte inferior izquierda */}
      <button
        onClick={handleOpenDialog}
        className="fixed bottom-6 left-6 z-20 px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-secondary hover:shadow-xl transition-all duration-300 font-medium"
      >
        <HelpIcon className="mr-2 text-white" /> Guía inicial
      </button>

      {/* Dialog con la información */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography
            className="text-primary"
            variant="h5"
            component="div"
            fontWeight="bold"
          >
            Guía Inicial
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              fontWeight="bold"
            >
              Usuarios predeterminados
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2, mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Contraseña
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>admin</TableCell>
                    <TableCell>admin</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>medico</TableCell>
                    <TableCell>medico</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>paciente</TableCell>
                    <TableCell>paciente</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <div className="flex flex-row gap-4">
            <div className="w-1/6 items-center justify-center text-end">
              <img src={LogoDuoc} alt="Logo" width={200} className="mx-auto" />
            </div>
            <div className="w-5/6 pl-10">
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  fontWeight="bold"
                >
                  Acerca de este proyecto
                </Typography>
                <p className="text-sm mb-4 text-justify ">
                  Esta aplicación fue desarrollada para DUOC UC en el año 2025,
                  en el marco de la asignatura{" "}
                  <strong className="text-primary">
                    ISY1102 – Calidad y Seguridad en el Desarrollo de Software
                  </strong>
                  . Su objetivo es presentar a los estudiantes un caso realista
                  de desarrollo de software, que incorpore las características
                  propias de un sistema en producción y permita evaluar el
                  cumplimiento de estándares de calidad y seguridad.
                </p>
                <p className="text-sm">
                  El software contiene errores introducidos de manera
                  intencional con fines académicos, por lo que{" "}
                  <strong className="text-primary">
                    no debe ser utilizado en entornos de producción
                  </strong>
                  .
                </p>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  fontWeight="bold"
                >
                  Docentes:
                </Typography>
                <ul className="text-sm m-0 pl-5 list-disc">
                  <li>Codiseñador Claudio Gonzalez Pauzoca</li>
                  <li>Codiseñador Luis Ponce Sánchez</li>
                </ul>
              </Box>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
