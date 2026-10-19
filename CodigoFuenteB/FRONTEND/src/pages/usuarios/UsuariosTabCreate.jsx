import { useState, useEffect } from "react";
import {
  Button,
  CardContent,
  Stack,
  TextField,
  Typography,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as yup from "yup";

const createUserSchema = yup.object().shape({
  nombre_usuario: yup
    .string()
    .required("El nombre de usuario es requerido")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),
  correo: yup
    .string()
    .required("El correo es requerido")
    .email("El correo debe tener un formato válido")
    .max(255, "El correo no puede exceder 255 caracteres"),
  contrasena_hash: yup
    .string()
    .required("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol_id: yup
    .number()
    .required("El rol es requerido")
    .integer("El rol debe ser un número entero")
    .positive("El rol debe ser válido"),
});

export default function UsuariosTabCreate({ onSuccess, onLoad }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      nombre_usuario: "",
      correo: "",
      contrasena_hash: "",
      rol_id: "",
    },
    validationSchema: createUserSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await api.post("/usuarios", {
          nombre_usuario: values.nombre_usuario,
          correo: values.correo,
          contrasena_hash: values.contrasena_hash,
          rol_id: Number(values.rol_id),
        });
        toast.success("Usuario creado exitosamente");
        formik.resetForm();
        onLoad();
        onSuccess();
      } catch (error) {
        // El error ya se maneja en el interceptor
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const { data } = await api.get("/roles");
        // Filtrar solo los roles: admin, medico, paciente
        const rolesFiltrados = (data || []).filter(
          (rol) =>
            rol.nombre === "admin" ||
            rol.nombre === "medico" ||
            rol.nombre === "paciente" ||
            rol.nombre === "administrador"
        );
        setRoles(rolesFiltrados);
        
        // Si hay roles disponibles y no hay rol seleccionado, establecer el primero como predeterminado
        if (rolesFiltrados.length > 0 && !formik.values.rol_id) {
          formik.setFieldValue("rol_id", rolesFiltrados[0].id);
        }
      } catch (error) {
        console.error("Error al cargar roles:", error);
      }
    };
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <CardContent className="!p-6">
      <div className="py-2">
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Crear nuevo usuario
        </Typography>
        <Typography variant="body" color="text.secondary">
          Ingresa los datos del nuevo usuario para crearlo en el sistema.
        </Typography>
      </div>
      <Divider sx={{ mb: 3, mt: 2 }} />
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Nombre de usuario"
              name="nombre_usuario"
              value={formik.values.nombre_usuario}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.nombre_usuario &&
                Boolean(formik.errors.nombre_usuario)
              }
              helperText={
                formik.touched.nombre_usuario && formik.errors.nombre_usuario
              }
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              fullWidth
              required
            />
            <TextField
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formik.values.correo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.correo && Boolean(formik.errors.correo)}
              helperText={formik.touched.correo && formik.errors.correo}
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              fullWidth
              required
            />
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Contraseña"
              name="contrasena_hash"
              type="password"
              value={formik.values.contrasena_hash}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.contrasena_hash &&
                Boolean(formik.errors.contrasena_hash)
              }
              helperText={
                formik.touched.contrasena_hash && formik.errors.contrasena_hash
              }
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              fullWidth
              required
            />
            <FormControl
              sx={{ flex: 1, minWidth: 200 }}
              fullWidth
              error={formik.touched.rol_id && Boolean(formik.errors.rol_id)}
            >
              <InputLabel>Rol</InputLabel>
              <Select
                name="rol_id"
                value={formik.values.rol_id || ""}
                label="Rol"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              >
                {roles.map((rol) => (
                  <MenuItem key={rol.id} value={rol.id}>
                    {rol.nombre === "admin" || rol.nombre === "administrador"
                      ? "Administrador"
                      : rol.nombre === "medico"
                      ? "Médico"
                      : rol.nombre === "paciente"
                      ? "Paciente"
                      : rol.nombre}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.rol_id && formik.errors.rol_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {formik.errors.rol_id}
                </Typography>
              )}
            </FormControl>
          </Stack>
          {roles.length === 0 && (
            <Alert severity="warning">
              No se pudieron cargar los roles disponibles. Por favor, recarga la página.
            </Alert>
          )}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="button"
              variant="outlined"
              onClick={() => formik.resetForm()}
              sx={{
                minWidth: 120,
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || formik.isSubmitting || roles.length === 0}
              startIcon={<PersonAddIcon />}
              sx={{
                minWidth: 150,
                backgroundColor: "#3293BA",
                "&:hover": {
                  backgroundColor: "#155a5b",
                },
              }}
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </CardContent>
  );
}
