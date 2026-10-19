import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  updateUsuarioSchema,
  updatePasswordSchema,
} from "../../validations/users";
import { pacienteSchema } from "../../validations/pacientes";
import { useAuth } from "../../hooks/useAuth";
import { formatRut, RutFormat } from "@fdograph/rut-utilities";
import { normalizeRut } from "../../lib/utils";

export default function UsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [esUnicoAdministrador, setEsUnicoAdministrador] = useState(false);
  const [pacienteId, setPacienteId] = useState(null);
  const [loadingPaciente, setLoadingPaciente] = useState(false);

  // Verificar si el usuario editado es el mismo que el de la sesión
  const esUsuarioActual =
    user?.usuarioId && id && Number(user.usuarioId) === Number(id);
  
  // Verificar si el usuario es paciente
  const esPaciente = user?.rolNombre === "paciente" && esUsuarioActual;
  
  // Verificar si el usuario autenticado es administrador
  const esAdmin = user?.rolNombre === "admin" || user?.rolNombre === "administrador";
  
  // Los administradores pueden editar otros usuarios y cambiar roles
  const puedeEditarRol = esAdmin && !esUsuarioActual && !esUnicoAdministrador;
  const puedeEditarNombreUsuario = esAdmin && !esUsuarioActual;

  const usuarioFormik = useFormik({
    initialValues: {
      nombre_usuario: "",
      correo: "",
      rol_id: "",
    },
    validationSchema: puedeEditarNombreUsuario 
      ? yup.object().shape({
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
        })
      : updateUsuarioSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const updateData = {
          correo: values.correo,
        };
        
        if (puedeEditarNombreUsuario && values.nombre_usuario) {
          updateData.nombre_usuario = values.nombre_usuario;
        }
        
        if (puedeEditarRol && values.rol_id) {
          updateData.rol_id = Number(values.rol_id);
        }
        
        await api.put(`/usuarios/${id}`, updateData);
        toast.success("Información del usuario actualizada");
      } catch {
        // El error ya se maneja en el interceptor
      } finally {
        setLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      contrasena_hash: "",
      confirmar_contrasena: "",
    },
    validationSchema: updatePasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await api.put(`/usuarios/${id}`, {
          contrasena_hash: values.contrasena_hash,
        });
        toast.success("Contraseña actualizada");
        passwordFormik.resetForm();
      } catch {
        // El error ya se maneja en el interceptor
      } finally {
        setLoading(false);
      }
    },
  });

  const pacienteFormik = useFormik({
    initialValues: {
      rut: "",
      primer_nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      fecha_nacimiento: "",
      sexo: "",
      nacionalidad: "",
      estado_civil: "",
      email: "",
      telefono: "",
      direccion: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
      contacto_emergencia_relacion: "",
      tipo_prevision: "",
      tiene_convenio: false,
      grupo_sanguineo: "",
      alergias: "",
      enfermedades_cronicas: "",
      discapacidades: "",
      observaciones_medicas_generales: "",
    },
    validationSchema: pacienteSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!pacienteId) return;
      setLoading(true);
      try {
        const normalizedValues = {
          ...values,
          rut: normalizeRut(values.rut),
        };
        await api.put(`/pacientes/${pacienteId}`, normalizedValues);
        toast.success("Información del paciente actualizada");
      } catch {
        // El error ya se maneja en el interceptor
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Cargar roles disponibles
        const rolesResponse = await api.get("/roles");
        setRoles(rolesResponse.data || []);

        // Cargar información del usuario
        const { data } = await api.get(`/usuarios/${id}`);
        const usuarioData = {
          nombre_usuario: data.nombre_usuario || "",
          correo: data.correo || "",
          rol_id: data.rol_id || "",
        };
        setEsUnicoAdministrador(data.es_unico_administrador || false);
        usuarioFormik.setValues(usuarioData);

        // Si es paciente, cargar datos del paciente
        if (esPaciente && user?.pacienteId) {
          setLoadingPaciente(true);
          try {
            const pacienteResponse = await api.get(`/pacientes/${user.pacienteId}`);
            const pacienteData = pacienteResponse.data;
            setPacienteId(pacienteData.id);
            
            pacienteFormik.setValues({
              rut: pacienteData.rut ? formatRut(pacienteData.rut, RutFormat.DOTS_DASH) : "",
              primer_nombre: pacienteData.primer_nombre || "",
              apellido_paterno: pacienteData.apellido_paterno || "",
              apellido_materno: pacienteData.apellido_materno || "",
              fecha_nacimiento: pacienteData.fecha_nacimiento ? pacienteData.fecha_nacimiento.split("T")[0] : "",
              sexo: pacienteData.sexo || "",
              nacionalidad: pacienteData.nacionalidad || "",
              estado_civil: pacienteData.estado_civil || "",
              email: pacienteData.email || "",
              telefono: pacienteData.telefono || "",
              direccion: pacienteData.direccion || "",
              contacto_emergencia_nombre: pacienteData.contacto_emergencia_nombre || "",
              contacto_emergencia_telefono: pacienteData.contacto_emergencia_telefono || "",
              contacto_emergencia_relacion: pacienteData.contacto_emergencia_relacion || "",
              tipo_prevision: pacienteData.tipo_prevision || "",
              tiene_convenio: pacienteData.tiene_convenio || false,
              grupo_sanguineo: pacienteData.grupo_sanguineo || "",
              alergias: pacienteData.alergias || "",
              enfermedades_cronicas: pacienteData.enfermedades_cronicas || "",
              discapacidades: pacienteData.discapacidades || "",
              observaciones_medicas_generales: pacienteData.observaciones_medicas_generales || "",
            });
          } catch (error) {
            console.error("Error al cargar datos del paciente:", error);
          } finally {
            setLoadingPaciente(false);
          }
        }
      } catch {
        toast.error("Error al cargar usuario");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, esPaciente, user?.pacienteId]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title={esPaciente ? "Editar Mi Cuenta" : "Editar Usuario"}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            data-testid="button-usuario-volver"
            onClick={() => navigate(esPaciente ? "/home" : "/usuarios")}
            sx={{
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            Volver
          </Button>
        }
      />

      {/* Card informativa */}
      <Card
        sx={{
          background: "#3293BA",
          color: "white",
          boxShadow: "0 10px 30px rgba(27, 117, 118, 0.3)",
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon sx={{ fontSize: 48, opacity: 0.9 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {esPaciente ? "Editar Mi Cuenta" : "Editar Información del Usuario"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {esPaciente
                  ? "Actualiza tu información personal, datos médicos y contraseña."
                  : "Actualiza los datos del usuario y cambia su contraseña en el sistema."}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Información del usuario */}
      <Card
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <EditIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información del Usuario
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <TextField
                label="Nombre de usuario"
                name="nombre_usuario"
                value={usuarioFormik.values.nombre_usuario}
                onChange={usuarioFormik.handleChange}
                onBlur={usuarioFormik.handleBlur}
                error={
                  usuarioFormik.touched.nombre_usuario &&
                  Boolean(usuarioFormik.errors.nombre_usuario)
                }
                helperText={
                  usuarioFormik.touched.nombre_usuario && usuarioFormik.errors.nombre_usuario
                }
                inputProps={{ "data-testid": "input-usuario-nombre" }}
                sx={{ flex: 1, minWidth: 200 }}
                variant="outlined"
                fullWidth
                disabled={!puedeEditarNombreUsuario}
              />
              <TextField
                label="Correo electrónico"
                name="correo"
                type="email"
                value={usuarioFormik.values.correo}
                onChange={usuarioFormik.handleChange}
                onBlur={usuarioFormik.handleBlur}
                error={
                  usuarioFormik.touched.correo &&
                  Boolean(usuarioFormik.errors.correo)
                }
                helperText={
                  usuarioFormik.touched.correo && usuarioFormik.errors.correo
                }
                inputProps={{ "data-testid": "input-usuario-correo" }}
                sx={{ flex: 1, minWidth: 200 }}
                variant="outlined"
                fullWidth
                required
              />
            </Stack>
            {!esPaciente && (
              <FormControl sx={{ minWidth: 200 }} fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol_id"
                  value={usuarioFormik.values.rol_id || ""}
                  label="Rol"
                  onChange={usuarioFormik.handleChange}
                  onBlur={usuarioFormik.handleBlur}
                  disabled={!puedeEditarRol}
                  inputProps={{ "data-testid": "select-usuario-rol" }}
                >
                  {roles.map((rol) => (
                    <MenuItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {esUnicoAdministrador && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, ml: 1.75 }}
                  >
                    No se puede cambiar el rol del único administrador de la
                    empresa
                  </Typography>
                )}
                {esUsuarioActual && !esUnicoAdministrador && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, ml: 1.75 }}
                  >
                    No puedes cambiar tu propio rol
                  </Typography>
                )}
                {!esAdmin && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, ml: 1.75 }}
                  >
                    Solo los administradores pueden cambiar roles
                  </Typography>
                )}
              </FormControl>
            )}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                data-testid="button-usuario-cancelar"
                onClick={() => navigate(esPaciente ? "/home" : "/usuarios")}
                sx={{
                  minWidth: 120,
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                data-testid="button-usuario-actualizar"
                onClick={usuarioFormik.handleSubmit}
                disabled={loading || usuarioFormik.isSubmitting}
                startIcon={<EditIcon />}
                sx={{
                  minWidth: 180,
                  backgroundColor: "#3293BA",
                  "&:hover": {
                    backgroundColor: "#155a5b",
                  },
                }}
              >
                Actualizar Información
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Información del paciente (solo para pacientes) */}
      {esPaciente && pacienteId && !loadingPaciente && (
        <Card
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <PersonIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Información Personal del Paciente
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={pacienteFormik.handleSubmit}>
              <Stack spacing={4}>
                {/* Información personal */}
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    1. Información Personal
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <TextField
                      label="RUT"
                      name="rut"
                      value={pacienteFormik.values.rut}
                      onChange={pacienteFormik.handleChange}
                      onBlur={(e) => {
                        const formatted = formatRut(
                          e.target.value,
                          RutFormat.DOTS_DASH
                        );
                        pacienteFormik.setFieldValue("rut", formatted);
                        pacienteFormik.handleBlur(e);
                      }}
                      error={pacienteFormik.touched.rut && Boolean(pacienteFormik.errors.rut)}
                      helperText={pacienteFormik.touched.rut && pacienteFormik.errors.rut}
                      sx={{ flex: 1, minWidth: 200 }}
                      required
                    />
                    <TextField
                      label="Primer Nombre"
                      name="primer_nombre"
                      value={pacienteFormik.values.primer_nombre}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.primer_nombre && Boolean(pacienteFormik.errors.primer_nombre)}
                      helperText={pacienteFormik.touched.primer_nombre && pacienteFormik.errors.primer_nombre}
                      sx={{ flex: 1, minWidth: 200 }}
                      required
                    />
                    <TextField
                      label="Apellido Paterno"
                      name="apellido_paterno"
                      value={pacienteFormik.values.apellido_paterno}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.apellido_paterno && Boolean(pacienteFormik.errors.apellido_paterno)}
                      helperText={pacienteFormik.touched.apellido_paterno && pacienteFormik.errors.apellido_paterno}
                      sx={{ flex: 1, minWidth: 200 }}
                      required
                    />
                    <TextField
                      label="Apellido Materno"
                      name="apellido_materno"
                      value={pacienteFormik.values.apellido_materno}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.apellido_materno && Boolean(pacienteFormik.errors.apellido_materno)}
                      helperText={pacienteFormik.touched.apellido_materno && pacienteFormik.errors.apellido_materno}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <TextField
                      label="Fecha de Nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={pacienteFormik.values.fecha_nacimiento}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.fecha_nacimiento && Boolean(pacienteFormik.errors.fecha_nacimiento)}
                      helperText={pacienteFormik.touched.fecha_nacimiento && pacienteFormik.errors.fecha_nacimiento}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1, minWidth: 200 }}
                      required
                    />
                    <FormControl sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel>Sexo</InputLabel>
                      <Select
                        name="sexo"
                        value={pacienteFormik.values.sexo}
                        onChange={pacienteFormik.handleChange}
                        onBlur={pacienteFormik.handleBlur}
                        label="Sexo"
                        error={pacienteFormik.touched.sexo && Boolean(pacienteFormik.errors.sexo)}
                      >
                        <MenuItem value="M">Masculino</MenuItem>
                        <MenuItem value="F">Femenino</MenuItem>
                        <MenuItem value="O">Otro</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Nacionalidad"
                      name="nacionalidad"
                      value={pacienteFormik.values.nacionalidad}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.nacionalidad && Boolean(pacienteFormik.errors.nacionalidad)}
                      helperText={pacienteFormik.touched.nacionalidad && pacienteFormik.errors.nacionalidad}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <FormControl sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel>Estado Civil</InputLabel>
                      <Select
                        name="estado_civil"
                        value={pacienteFormik.values.estado_civil}
                        onChange={pacienteFormik.handleChange}
                        onBlur={pacienteFormik.handleBlur}
                        label="Estado Civil"
                      >
                        <MenuItem value="soltero">Soltero</MenuItem>
                        <MenuItem value="casado">Casado</MenuItem>
                        <MenuItem value="divorciado">Divorciado</MenuItem>
                        <MenuItem value="viudo">Viudo</MenuItem>
                        <MenuItem value="union_libre">Unión Libre</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>

                <Divider />

                {/* Información de contacto */}
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    2. Información de Contacto
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={pacienteFormik.values.email}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.email && Boolean(pacienteFormik.errors.email)}
                      helperText={pacienteFormik.touched.email && pacienteFormik.errors.email}
                      sx={{ flex: 1, minWidth: 200 }}
                      required
                    />
                    <TextField
                      label="Teléfono"
                      name="telefono"
                      value={pacienteFormik.values.telefono}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      error={pacienteFormik.touched.telefono && Boolean(pacienteFormik.errors.telefono)}
                      helperText={pacienteFormik.touched.telefono && pacienteFormik.errors.telefono}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                  </Stack>
                  <TextField
                    label="Dirección"
                    name="direccion"
                    value={pacienteFormik.values.direccion}
                    onChange={pacienteFormik.handleChange}
                    onBlur={pacienteFormik.handleBlur}
                    error={pacienteFormik.touched.direccion && Boolean(pacienteFormik.errors.direccion)}
                    helperText={pacienteFormik.touched.direccion && pacienteFormik.errors.direccion}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 600 }}>
                    Contacto de Emergencia
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <TextField
                      label="Nombre"
                      name="contacto_emergencia_nombre"
                      value={pacienteFormik.values.contacto_emergencia_nombre}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                      label="Teléfono"
                      name="contacto_emergencia_telefono"
                      value={pacienteFormik.values.contacto_emergencia_telefono}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                      label="Relación"
                      name="contacto_emergencia_relacion"
                      value={pacienteFormik.values.contacto_emergencia_relacion}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                  </Stack>
                </Stack>

                <Divider />

                {/* Información de previsión social */}
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    3. Previsión Social
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <TextField
                      label="Tipo de Previsión"
                      name="tipo_prevision"
                      value={pacienteFormik.values.tipo_prevision}
                      onChange={pacienteFormik.handleChange}
                      onBlur={pacienteFormik.handleBlur}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="tiene_convenio"
                          checked={pacienteFormik.values.tiene_convenio}
                          onChange={pacienteFormik.handleChange}
                        />
                      }
                      label="Tiene Convenio"
                    />
                  </Stack>
                </Stack>

                <Divider />

                {/* Información médica */}
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    4. Información Médica
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <FormControl sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel>Grupo Sanguíneo</InputLabel>
                      <Select
                        name="grupo_sanguineo"
                        value={pacienteFormik.values.grupo_sanguineo}
                        onChange={pacienteFormik.handleChange}
                        onBlur={pacienteFormik.handleBlur}
                        label="Grupo Sanguíneo"
                      >
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                  <TextField
                    label="Alergias"
                    name="alergias"
                    value={pacienteFormik.values.alergias}
                    onChange={pacienteFormik.handleChange}
                    onBlur={pacienteFormik.handleBlur}
                    error={pacienteFormik.touched.alergias && Boolean(pacienteFormik.errors.alergias)}
                    helperText={pacienteFormik.touched.alergias && pacienteFormik.errors.alergias}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="Enfermedades Crónicas"
                    name="enfermedades_cronicas"
                    value={pacienteFormik.values.enfermedades_cronicas}
                    onChange={pacienteFormik.handleChange}
                    onBlur={pacienteFormik.handleBlur}
                    error={pacienteFormik.touched.enfermedades_cronicas && Boolean(pacienteFormik.errors.enfermedades_cronicas)}
                    helperText={pacienteFormik.touched.enfermedades_cronicas && pacienteFormik.errors.enfermedades_cronicas}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="Discapacidades"
                    name="discapacidades"
                    value={pacienteFormik.values.discapacidades}
                    onChange={pacienteFormik.handleChange}
                    onBlur={pacienteFormik.handleBlur}
                    error={pacienteFormik.touched.discapacidades && Boolean(pacienteFormik.errors.discapacidades)}
                    helperText={pacienteFormik.touched.discapacidades && pacienteFormik.errors.discapacidades}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="Observaciones Médicas Generales"
                    name="observaciones_medicas_generales"
                    value={pacienteFormik.values.observaciones_medicas_generales}
                    onChange={pacienteFormik.handleChange}
                    onBlur={pacienteFormik.handleBlur}
                    error={pacienteFormik.touched.observaciones_medicas_generales && Boolean(pacienteFormik.errors.observaciones_medicas_generales)}
                    helperText={pacienteFormik.touched.observaciones_medicas_generales && pacienteFormik.errors.observaciones_medicas_generales}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Stack>

                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={pacienteFormik.handleSubmit}
                    disabled={loading || pacienteFormik.isSubmitting}
                    startIcon={<EditIcon />}
                    sx={{
                      minWidth: 180,
                      backgroundColor: "#3293BA",
                      "&:hover": {
                        backgroundColor: "#155a5b",
                      },
                    }}
                  >
                    Actualizar Información del Paciente
                  </Button>
                </Stack>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cambiar contraseña */}
      <Card
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <LockIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Cambiar Contraseña
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <TextField
                label="Nueva contraseña"
                name="contrasena_hash"
                type="password"
                value={passwordFormik.values.contrasena_hash}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={
                  passwordFormik.touched.contrasena_hash &&
                  Boolean(passwordFormik.errors.contrasena_hash)
                }
                helperText={
                  passwordFormik.touched.contrasena_hash &&
                  passwordFormik.errors.contrasena_hash
                }
                inputProps={{ "data-testid": "input-usuario-password" }}
                sx={{ flex: 1, minWidth: 200 }}
                variant="outlined"
                fullWidth
                required
              />
              <TextField
                label="Confirmar contraseña"
                name="confirmar_contrasena"
                type="password"
                value={passwordFormik.values.confirmar_contrasena}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={
                  passwordFormik.touched.confirmar_contrasena &&
                  Boolean(passwordFormik.errors.confirmar_contrasena)
                }
                helperText={
                  passwordFormik.touched.confirmar_contrasena &&
                  passwordFormik.errors.confirmar_contrasena
                }
                inputProps={{
                  "data-testid": "input-usuario-confirmar-password",
                }}
                sx={{ flex: 1, minWidth: 200 }}
                variant="outlined"
                fullWidth
                required
              />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                data-testid="button-usuario-actualizar-password"
                onClick={passwordFormik.handleSubmit}
                disabled={loading || passwordFormik.isSubmitting}
                startIcon={<LockIcon />}
                sx={{
                  minWidth: 180,
                  backgroundColor: "#3293BA",
                  "&:hover": {
                    backgroundColor: "#155a5b",
                  },
                }}
              >
                Actualizar Contraseña
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
