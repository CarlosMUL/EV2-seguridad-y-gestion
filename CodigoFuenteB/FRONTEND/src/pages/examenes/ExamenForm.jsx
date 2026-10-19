import { useState, useEffect } from "react";
import {
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Box,
  IconButton,
  Paper,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../hooks/useAuth";

const examenSchema = yup.object().shape({
  tipo_examen_medico_id: yup
    .number()
    .required("El tipo de examen es requerido")
    .positive("Debe seleccionar un tipo de examen"),
  paciente_id: yup
    .number()
    .required("El paciente es requerido")
    .positive("Debe seleccionar un paciente"),
  diagnosis: yup.string().max(2000).optional(),
  tratamiento: yup.string().max(2000).optional(),
  observaciones: yup.string().max(2000).optional(),
  notas: yup.string().max(2000).optional(),
});

export default function ExamenForm({ onSuccess, examenId }) {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tiposExamen, setTiposExamen] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const formik = useFormik({
    initialValues: {
      tipo_examen_medico_id: "",
      paciente_id: "",
      diagnosis: "",
      tratamiento: "",
      observaciones: "",
      notas: "",
    },
    validationSchema: examenSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        let nuevoExamenId = examenId;
        if (examenId) {
          await api.put(`/examenes/${examenId}`, values);
          toast.success("Examen actualizado exitosamente");
        } else {
          const { data } = await api.post("/examenes", values);
          nuevoExamenId = data?.id;
          toast.success("Examen creado exitosamente");

          // Subir documentos pendientes si hay
          if (pendingFiles.length > 0 && nuevoExamenId) {
            await uploadPendingFiles(nuevoExamenId, values.paciente_id);
          }
        }
        formik.resetForm();
        setPendingFiles([]);
        onSuccess();
      } catch {
        // El error ya se maneja en el interceptor
      } finally {
        setLoading(false);
      }
    },
  });

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [tiposRes, pacientesRes] = await Promise.all([
        api.get("/tipo-examen"),
        api.get("/pacientes"),
      ]);
      setTiposExamen(tiposRes.data || []);
      setPacientes(pacientesRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadExamen = async () => {
    try {
      const { data } = await api.get(`/examenes/${examenId}`);
      formik.setValues({
        tipo_examen_medico_id: data.tipo_examen_medico_id,
        paciente_id: data.paciente_id,
        diagnosis: data.diagnosis || "",
        tratamiento: data.tratamiento || "",
        observaciones: data.observaciones || "",
        notas: data.notas || "",
      });
      // Cargar documentos del examen
      loadDocumentos();
    } catch (error) {
      console.error("Error al cargar examen:", error);
    }
  };

  const loadDocumentos = async () => {
    if (!examenId) return;
    try {
      const { data } = await api.get(`/documentos/examen/${examenId}`);
      setDocumentos(data || []);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    }
  };

  const uploadPendingFiles = async (examenIdToUse, pacienteId) => {
    if (pendingFiles.length === 0 || !pacienteId) return;

    const formData = new FormData();
    formData.append("documento", pendingFiles[0]);
    formData.append("examen_medico_id", examenIdToUse);
    formData.append("paciente_id", pacienteId);

    setUploading(true);
    try {
      await api.post("/documentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Documento subido exitosamente");
      setPendingFiles([]);
      if (examenIdToUse) {
        loadDocumentos();
      }
    } catch {
      toast.error("Error al subir documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (documentoId) => {
    try {
      const response = await api.get(`/documentos/${documentoId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `documento-${documentoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Error al descargar documento");
    }
  };

  const handleDeleteDocument = async (documentoId, nombreArchivo) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el documento "${nombreArchivo}"?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/documentos/${documentoId}`);
      toast.success("Documento eliminado");
      loadDocumentos();
    } catch {
      // El error ya se maneja en el interceptor
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    // Si estamos creando un examen, guardar archivo en estado temporal
    if (!examenId) {
      if (!formik.values.paciente_id) {
        toast.error("Debe seleccionar un paciente primero");
        return;
      }
      setPendingFiles([acceptedFiles[0]]);
      toast.success("Archivo listo para subir");
      return;
    }

    // Si estamos editando, subir directamente
    if (!formik.values.paciente_id) {
      toast.error("Debe seleccionar un paciente primero");
      return;
    }

    const formData = new FormData();
    formData.append("documento", acceptedFiles[0]);
    formData.append("examen_medico_id", examenId);
    formData.append("paciente_id", formik.values.paciente_id);

    setUploading(true);
    try {
      await api.post("/documentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Documento subido exitosamente");
      loadDocumentos();
    } catch {
      toast.error("Error al subir documento");
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: false,
    disabled: uploading || loading,
  });

  useEffect(() => {
    loadData();
    if (examenId) {
      loadExamen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examenId]);

  return (
    <Stack spacing={3}>
      <Card sx={{ boxShadow: "0 2px 0px rgba(0,0,0,0.1)" }}>
        <CardContent className="!p-6">
          <div className="py-2">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {examenId ? "Editar examen" : "Registrar nuevo examen"}
            </Typography>
            <Typography variant="body" color="text.secondary">
              {examenId
                ? "Modifica los datos del examen en el sistema."
                : "Ingresa los datos del examen para registrarlo en el sistema."}
            </Typography>
          </div>
          <Divider sx={{ mb: 3, mt: 2 }} />

          {loadingData ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
              <Typography>Cargando datos...</Typography>
            </Stack>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <FormControl required>
                  <InputLabel>Tipo de Examen</InputLabel>
                  <Select
                    name="tipo_examen_medico_id"
                    value={formik.values.tipo_examen_medico_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Tipo de Examen"
                    error={
                      formik.touched.tipo_examen_medico_id &&
                      Boolean(formik.errors.tipo_examen_medico_id)
                    }
                  >
                    {tiposExamen.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl required>
                  <InputLabel>Paciente</InputLabel>
                  <Select
                    name="paciente_id"
                    value={formik.values.paciente_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Paciente"
                    error={
                      formik.touched.paciente_id &&
                      Boolean(formik.errors.paciente_id)
                    }
                  >
                    {pacientes.map((paciente) => (
                      <MenuItem key={paciente.id} value={paciente.id}>
                        {`${paciente.primer_nombre} ${
                          paciente.apellido_paterno
                        } ${paciente.apellido_materno || ""}`.trim()}{" "}
                        - {paciente.rut}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Diagnóstico"
                  name="diagnosis"
                  value={formik.values.diagnosis}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.diagnosis && Boolean(formik.errors.diagnosis)
                  }
                  helperText={
                    formik.touched.diagnosis && formik.errors.diagnosis
                  }
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  label="Tratamiento"
                  name="tratamiento"
                  value={formik.values.tratamiento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.tratamiento &&
                    Boolean(formik.errors.tratamiento)
                  }
                  helperText={
                    formik.touched.tratamiento && formik.errors.tratamiento
                  }
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  label="Observaciones"
                  name="observaciones"
                  value={formik.values.observaciones}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.observaciones &&
                    Boolean(formik.errors.observaciones)
                  }
                  helperText={
                    formik.touched.observaciones && formik.errors.observaciones
                  }
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  label="Notas"
                  name="notas"
                  value={formik.values.notas}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.notas && Boolean(formik.errors.notas)}
                  helperText={formik.touched.notas && formik.errors.notas}
                  fullWidth
                  multiline
                  rows={2}
                />

                {/* Sección de Documentos - Disponible en creación y edición */}
                {(role === "medico" || role === "admin") && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Documentos del Examen
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {examenId
                          ? "Sube el documento de resultado del examen médico"
                          : "Selecciona el documento que deseas subir. Se subirá automáticamente al crear el examen."}
                      </Typography>

                      {/* Dropzone para subir documentos */}
                      <Box
                        {...getRootProps()}
                        sx={{
                          border: "2px dashed",
                          borderColor: isDragActive
                            ? "primary.main"
                            : "grey.300",
                          borderRadius: 2,
                          p: 4,
                          textAlign: "center",
                          cursor: uploading ? "not-allowed" : "pointer",
                          bgcolor: isDragActive
                            ? "action.hover"
                            : "background.paper",
                          transition: "all 0.2s",
                          opacity: uploading ? 0.6 : 1,
                          "&:hover": {
                            borderColor: uploading
                              ? "grey.300"
                              : "primary.main",
                            bgcolor: uploading
                              ? "background.paper"
                              : "action.hover",
                          },
                        }}
                      >
                        <input {...getInputProps()} />
                        <UploadIcon
                          sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {isDragActive
                            ? "Suelta el archivo aquí"
                            : uploading
                            ? "Subiendo documento..."
                            : "Arrastra un archivo aquí"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          o haz clic para seleccionar un archivo
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Formatos permitidos: PDF, JPG, PNG (máximo 10MB)
                        </Typography>
                      </Box>

                      {/* Archivo pendiente (durante creación) */}
                      {!examenId && pendingFiles.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            Archivo listo para subir
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              sx={{ flex: 1 }}
                            >
                              <DescriptionIcon color="primary" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1">
                                  {pendingFiles[0].name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {(pendingFiles[0].size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Box>
                            </Stack>
                            <IconButton
                              color="error"
                              onClick={() => removePendingFile(0)}
                              aria-label={`Eliminar ${pendingFiles[0].name}`}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Paper>
                        </Box>
                      )}

                      {/* Lista de documentos existentes (durante edición) */}
                      {examenId && documentos.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            Documentos subidos ({documentos.length})
                          </Typography>
                          <Stack spacing={1}>
                            {documentos.map((doc) => (
                              <Paper
                                key={doc.id}
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  "&:hover": {
                                    bgcolor: "action.hover",
                                  },
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                  sx={{ flex: 1 }}
                                >
                                  <DescriptionIcon color="primary" />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1">
                                      {doc.nombre_archivo ||
                                        `Archivo ${doc.id}`}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        doc.created_at
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() =>
                                      handleDownloadDocument(doc.id)
                                    }
                                  >
                                    Ver Documento
                                  </Button>
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      handleDeleteDocument(
                                        doc.id,
                                        doc.nombre_archivo
                                      )
                                    }
                                    aria-label={`Eliminar ${doc.nombre_archivo}`}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Stack>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mt: 2 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<LocalHospitalIcon />}
                    disabled={loading || loadingData || uploading}
                  >
                    {loading
                      ? examenId
                        ? "Actualizando..."
                        : "Creando..."
                      : examenId
                      ? "Actualizar Examen"
                      : "Crear Examen"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
