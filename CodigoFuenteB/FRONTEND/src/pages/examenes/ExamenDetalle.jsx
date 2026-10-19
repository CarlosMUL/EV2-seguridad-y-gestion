import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useDropzone } from "react-dropzone";

export default function ExamenDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [examen, setExamen] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    loadExamen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadExamen = async () => {
    try {
      setLoading(true);
      const [examenRes, docsRes] = await Promise.all([
        api.get(`/examenes/${id}`),
        api.get(`/documentos/examen/${id}`).catch(() => ({ data: [] })),
      ]);
      setExamen(examenRes.data);
      setDocumentos(docsRes.data || []);
    } catch {
      toast.error("Error al cargar examen");
      navigate("/examenes");
    } finally {
      setLoading(false);
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

  const onDrop = async (acceptedFiles) => {
    if (!examen) return;

    if (acceptedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("documento", acceptedFiles[0]);
    formData.append("examen_medico_id", examen.id);
    formData.append("paciente_id", examen.paciente_id);

    setUploading(true);
    try {
      await api.post("/documentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Documento subido exitosamente");
      setOpenUpload(false);
      loadExamen();
    } catch {
      toast.error("Error al subir documento");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: false,
  });

  if (loading) {
    return (
      <Stack
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "400px" }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando examen...
        </Typography>
      </Stack>
    );
  }

  if (!examen) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/examenes/${id}`);
      toast.success("Examen eliminado exitosamente");
      navigate("/examenes");
    } catch {
      // El error ya se maneja en el interceptor
    }
  };

  const handleEdit = () => {
    navigate(`/examenes?edit=${id}`);
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/examenes")}
          >
            Volver
          </Button>
          <Typography variant="h5" color="primary">
            Detalle del Examen Médico
          </Typography>
        </Stack>
        {(role === "medico" || role === "admin") && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Editar
            </Button>
            {role === "admin" && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenDelete(true)}
              >
                Eliminar
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Tipo de Examen
            </Typography>
            <Typography variant="body1">{examen.tipo_examen_nombre}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Paciente
            </Typography>
            <Typography variant="body1">
              {`${examen.paciente_primer_nombre} ${
                examen.paciente_apellido_paterno
              } ${examen.paciente_apellido_materno || ""}`.trim()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              RUT: {examen.paciente_rut}
            </Typography>
          </Box>

          <Divider />

          {examen.diagnosis && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Diagnóstico
              </Typography>
              <Typography variant="body1">{examen.diagnosis}</Typography>
            </Box>
          )}

          {examen.tratamiento && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Tratamiento
              </Typography>
              <Typography variant="body1">{examen.tratamiento}</Typography>
            </Box>
          )}

          {examen.observaciones && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Observaciones
              </Typography>
              <Typography variant="body1">{examen.observaciones}</Typography>
            </Box>
          )}

          {examen.notas && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Notas
              </Typography>
              <Typography variant="body1">{examen.notas}</Typography>
            </Box>
          )}

          <Divider />
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Documentos
              </Typography>
              {(role === "medico" || role === "admin") && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setOpenUpload(true)}
                  size="small"
                >
                  Subir Documento
                </Button>
              )}
            </Stack>
            {documentos.length > 0 ? (
              <Stack spacing={1}>
                {documentos.map((doc) => (
                  <Stack
                    key={doc.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadDocument(doc.id)}
                      sx={{ flex: 1, justifyContent: "flex-start" }}
                    >
                      {doc.nombre_archivo}
                    </Button>
                    {role === "admin" && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={async () => {
                          if (
                            window.confirm(
                              `¿Estás seguro de eliminar el documento "${doc.nombre_archivo}"?`
                            )
                          ) {
                            try {
                              await api.delete(`/documentos/${doc.id}`);
                              toast.success("Documento eliminado");
                              loadExamen();
                            } catch {
                              // El error ya se maneja en el interceptor
                            }
                          }
                        }}
                        aria-label={`Eliminar ${doc.nombre_archivo}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay documentos asociados
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Fecha: {new Date(examen.created_at).toLocaleDateString("es-CL")}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Dialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subir Documento</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: isDragActive ? "action.hover" : "background.paper",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {isDragActive
                ? "Suelta el archivo aquí"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)} disabled={uploading}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este examen médico? Esta acción
            no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
