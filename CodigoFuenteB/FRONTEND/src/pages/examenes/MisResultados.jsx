import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import {
  Card,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

export default function MisResultados() {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    loadExamenes();
  }, []);

  const loadExamenes = async () => {
    try {
      setLoading(true);
      if (user?.pacienteId) {
        const { data } = await api.get(`/examenes/paciente/${user.pacienteId}`);
        setExamenes(data || []);
        
        // Cargar documentos para cada examen
        const documentosData = {};
        for (const examen of data || []) {
          try {
            const docsRes = await api.get(`/documentos/examen/${examen.id}`);
            documentosData[examen.id] = docsRes.data || [];
          } catch (error) {
            documentosData[examen.id] = [];
          }
        }
        setDocumentos(documentosData);
      }
    } catch (error) {
      console.error("Error al cargar exámenes:", error);
      toast.error("Error al cargar tus resultados");
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
    } catch (error) {
      toast.error("Error al descargar documento");
    }
  };

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
          Cargando tus resultados...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <div className="flex flex-row gap-4">
        <AssignmentIcon className="text-primary" sx={{ fontSize: 40 }} />
        <div className="flex flex-col pt-1">
          <Typography variant="h5" color="primary">
            Mis Resultados Médicos
          </Typography>
          <Typography variant="body" className="!pt-1 !mt-0 text-gray-800">
            Aquí puedes ver todos tus exámenes médicos y descargar los documentos asociados.
          </Typography>
        </div>
      </div>

      {examenes.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No tienes exámenes médicos registrados
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {examenes.map((examen) => (
            <Card key={examen.id} sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {examen.tipo_examen_nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fecha: {new Date(examen.created_at).toLocaleDateString("es-CL")}
                      </Typography>
                    </Box>
                    <Chip label="Completado" color="success" size="small" />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {examen.diagnosis && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Diagnóstico:
                        </Typography>
                        <Typography variant="body2">{examen.diagnosis}</Typography>
                      </Box>
                    )}
                    {examen.tratamiento && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Tratamiento:
                        </Typography>
                        <Typography variant="body2">{examen.tratamiento}</Typography>
                      </Box>
                    )}
                    {examen.observaciones && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Observaciones:
                        </Typography>
                        <Typography variant="body2">{examen.observaciones}</Typography>
                      </Box>
                    )}
                    {examen.notas && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Notas:
                        </Typography>
                        <Typography variant="body2">{examen.notas}</Typography>
                      </Box>
                    )}
                    
                    {documentos[examen.id] && documentos[examen.id].length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Documentos:
                          </Typography>
                          <Stack spacing={1}>
                            {documentos[examen.id].map((doc) => (
                              <Button
                                key={doc.id}
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadDocument(doc.id)}
                                sx={{ justifyContent: "flex-start" }}
                              >
                                {doc.nombre_archivo}
                              </Button>
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

