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
  Checkbox,
  Card,
  FormControlLabel,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { useFormik } from "formik";
import { pacienteSchema } from "../../validations/pacientes";
import { formatRut, RutFormat } from "@fdograph/rut-utilities";
import { normalizeRut } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function PacientesTabCreate({
  onSuccess,
  initialValues: propInitialValues,
  pacienteId,
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: propInitialValues || {
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
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Normalizar RUT antes de enviar (quitar puntos)
        const normalizedValues = {
          ...values,
          rut: normalizeRut(values.rut),
        };
        if (pacienteId) {
          await api.put(`/pacientes/${pacienteId}`, normalizedValues);
          toast.success("Paciente actualizado exitosamente");
        } else {
          await api.post("/pacientes", normalizedValues);
          toast.success("Paciente registrado exitosamente");
        }
        if (!pacienteId) {
          formik.resetForm();
        }
        onSuccess();
      } catch {
        // El error ya se maneja en el interceptor
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Stack spacing={3}>
      {pacienteId && (
        <div className="flex flex-row gap-4">
          <PersonIcon className="text-primary" sx={{ fontSize: 40 }} />
          <div className="flex flex-col pt-1">
            <Typography variant="h5" color="primary">
              Editar Cliente
            </Typography>
            <Typography variant="body" className="!pt-1 !mt-0 text-gray-800">
              Actualiza la información del cliente en el sistema. Puedes
              modificar todos los datos del cliente según tus permisos.
            </Typography>
          </div>
        </div>
      )}

      <Card sx={{ boxShadow: "0 2px 0px rgba(0,0,0,0.1)" }}>
        <CardContent className="!p-6">
          <div className="py-2">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {pacienteId ? "Editar paciente" : "Registrar nuevo paciente"}
            </Typography>
            <Typography variant="body" color="text.secondary">
              {pacienteId
                ? "Modifica los datos del paciente en el sistema."
                : "Ingresa los datos del paciente para registrarlo en el sistema."}
            </Typography>
          </div>
          <Divider sx={{ mb: 3, mt: 2 }} />
          <form onSubmit={formik.handleSubmit}>
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
                    value={formik.values.rut}
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      const formatted = formatRut(
                        e.target.value,
                        RutFormat.DOTS_DASH
                      );
                      formik.setFieldValue("rut", formatted);
                      formik.handleBlur(e);
                    }}
                    error={formik.touched.rut && Boolean(formik.errors.rut)}
                    helperText={formik.touched.rut && formik.errors.rut}
                    sx={{ flex: 1, minWidth: 200 }}
                    required
                  />
                  <TextField
                    label="Primer Nombre"
                    name="primer_nombre"
                    value={formik.values.primer_nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.primer_nombre &&
                      Boolean(formik.errors.primer_nombre)
                    }
                    helperText={
                      formik.touched.primer_nombre &&
                      formik.errors.primer_nombre
                    }
                    sx={{ flex: 1, minWidth: 200 }}
                    required
                  />
                  <TextField
                    label="Apellido Paterno"
                    name="apellido_paterno"
                    value={formik.values.apellido_paterno}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.apellido_paterno &&
                      Boolean(formik.errors.apellido_paterno)
                    }
                    helperText={
                      formik.touched.apellido_paterno &&
                      formik.errors.apellido_paterno
                    }
                    sx={{ flex: 1, minWidth: 200 }}
                    required
                  />
                  <TextField
                    label="Apellido Materno"
                    name="apellido_materno"
                    value={formik.values.apellido_materno}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.apellido_materno &&
                      Boolean(formik.errors.apellido_materno)
                    }
                    helperText={
                      formik.touched.apellido_materno &&
                      formik.errors.apellido_materno
                    }
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <TextField
                    label="Fecha de Nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formik.values.fecha_nacimiento}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.fecha_nacimiento &&
                      Boolean(formik.errors.fecha_nacimiento)
                    }
                    helperText={
                      formik.touched.fecha_nacimiento &&
                      formik.errors.fecha_nacimiento
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1, minWidth: 200 }}
                    required
                  />
                  <FormControl sx={{ flex: 1, minWidth: 200 }}>
                    <InputLabel>Sexo</InputLabel>
                    <Select
                      name="sexo"
                      value={formik.values.sexo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Sexo"
                      error={formik.touched.sexo && Boolean(formik.errors.sexo)}
                    >
                      <MenuItem value="M">Masculino</MenuItem>
                      <MenuItem value="F">Femenino</MenuItem>
                      <MenuItem value="O">Otro</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Nacionalidad"
                    name="nacionalidad"
                    value={formik.values.nacionalidad}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.nacionalidad &&
                      Boolean(formik.errors.nacionalidad)
                    }
                    helperText={
                      formik.touched.nacionalidad && formik.errors.nacionalidad
                    }
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <FormControl sx={{ flex: 1, minWidth: 200 }}>
                    <InputLabel>Estado Civil</InputLabel>
                    <Select
                      name="estado_civil"
                      value={formik.values.estado_civil}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    sx={{ flex: 1, minWidth: 200 }}
                    required
                  />
                  <TextField
                    label="Teléfono"
                    name="telefono"
                    value={formik.values.telefono}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.telefono && Boolean(formik.errors.telefono)
                    }
                    helperText={
                      formik.touched.telefono && formik.errors.telefono
                    }
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                </Stack>
                <TextField
                  label="Dirección"
                  name="direccion"
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.direccion && Boolean(formik.errors.direccion)
                  }
                  helperText={
                    formik.touched.direccion && formik.errors.direccion
                  }
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
                    value={formik.values.contacto_emergencia_nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    label="Teléfono"
                    name="contacto_emergencia_telefono"
                    value={formik.values.contacto_emergencia_telefono}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    label="Relación"
                    name="contacto_emergencia_relacion"
                    value={formik.values.contacto_emergencia_relacion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
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
                    value={formik.values.tipo_prevision}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="tiene_convenio"
                        checked={formik.values.tiene_convenio}
                        onChange={formik.handleChange}
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
                      value={formik.values.grupo_sanguineo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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
                  value={formik.values.alergias}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.alergias && Boolean(formik.errors.alergias)
                  }
                  helperText={formik.touched.alergias && formik.errors.alergias}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Enfermedades Crónicas"
                  name="enfermedades_cronicas"
                  value={formik.values.enfermedades_cronicas}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.enfermedades_cronicas &&
                    Boolean(formik.errors.enfermedades_cronicas)
                  }
                  helperText={
                    formik.touched.enfermedades_cronicas &&
                    formik.errors.enfermedades_cronicas
                  }
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Discapacidades"
                  name="discapacidades"
                  value={formik.values.discapacidades}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.discapacidades &&
                    Boolean(formik.errors.discapacidades)
                  }
                  helperText={
                    formik.touched.discapacidades &&
                    formik.errors.discapacidades
                  }
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Observaciones Médicas Generales"
                  name="observaciones_medicas_generales"
                  value={formik.values.observaciones_medicas_generales}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.observaciones_medicas_generales &&
                    Boolean(formik.errors.observaciones_medicas_generales)
                  }
                  helperText={
                    formik.touched.observaciones_medicas_generales &&
                    formik.errors.observaciones_medicas_generales
                  }
                  fullWidth
                  multiline
                  rows={3}
                />
              </Stack>

              <Divider />

              {/* Botones */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/pacientes")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonIcon />}
                  disabled={loading}
                >
                  {loading
                    ? pacienteId
                      ? "Actualizando..."
                      : "Registrando..."
                    : pacienteId
                    ? "Actualizar Paciente"
                    : "Registrar Paciente"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack>
  );
}
