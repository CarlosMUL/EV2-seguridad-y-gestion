import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Ayuda() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const faqGeneral = [
    {
      pregunta: "¿Cómo cambio mi contraseña?",
      respuesta:
        "Puedes cambiar tu contraseña desde el menú de usuario (icono de perfil en la esquina superior derecha) seleccionando 'Editar cuenta'. Allí encontrarás la opción para actualizar tu contraseña.",
    },
    {
      pregunta: "¿Cómo accedo a mis exámenes médicos?",
      respuesta:
        "Si eres paciente, puedes acceder a tus exámenes desde el menú 'Mis Resultados'. Si eres médico o administrador, puedes ver todos los exámenes desde 'Exámenes Médicos' en el menú principal.",
    },
    {
      pregunta: "¿Puedo descargar mis documentos médicos?",
      respuesta:
        "Sí, puedes descargar los documentos asociados a tus exámenes haciendo clic en el botón 'Ver Documento' en la sección de documentos de cada examen.",
    },
    {
      pregunta: "¿Cómo busco un examen específico?",
      respuesta:
        "Si eres paciente, puedes usar la función de búsqueda en la página de inicio para buscar por fecha, tipo de examen o médico. Los médicos y administradores pueden usar los filtros en la lista de exámenes.",
    },
  ];

  const faqMedico = [
    {
      pregunta: "¿Cómo creo un nuevo examen médico?",
      respuesta:
        "Ve a 'Exámenes Médicos' en el menú, luego selecciona la pestaña 'Nuevo Examen'. Completa el formulario con la información del paciente, tipo de examen y detalles médicos. Puedes subir documentos durante la creación o después de guardar.",
    },
    {
      pregunta: "¿Cómo subo documentos a un examen?",
      respuesta:
        "Al editar un examen, encontrarás una sección de 'Documentos del Examen' donde puedes arrastrar y soltar archivos o hacer clic para seleccionarlos. Los formatos permitidos son PDF, JPG y PNG.",
    },
    {
      pregunta: "¿Puedo editar un examen después de crearlo?",
      respuesta:
        "Sí, puedes editar cualquier examen haciendo clic en el botón de editar en la lista de exámenes. Esto te llevará a la misma vista de creación donde podrás modificar la información.",
    },
    {
      pregunta: "¿Cómo veo qué pacientes he atendido?",
      respuesta:
        "En la página de inicio, en la sección de 'Últimos Pacientes Atendidos', puedes ver los pacientes que has atendido recientemente. También puedes acceder a la lista completa desde 'Pacientes' en el menú.",
    },
  ];

  const faqPaciente = [
    {
      pregunta: "¿Cómo veo mis resultados de exámenes?",
      respuesta:
        "Accede a 'Mis Resultados' desde el menú principal. Allí verás todos tus exámenes médicos organizados. Puedes hacer clic en cualquier examen para ver los detalles completos.",
    },
    {
      pregunta: "¿Puedo ver documentos de mis exámenes?",
      respuesta:
        "Sí, en la página de detalle de cada examen verás una sección de 'Documentos' donde puedes ver y descargar todos los documentos asociados a ese examen.",
    },
    {
      pregunta: "¿Cómo busco un examen por fecha?",
      respuesta:
        "En la página de inicio, usa el campo de búsqueda para buscar exámenes por fecha. También puedes buscar por tipo de examen o médico.",
    },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <HelpIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" color="primary">
              Centro de Ayuda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Encuentra respuestas a tus preguntas frecuentes
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Preguntas Frecuentes Generales
              </Typography>
              <Stack spacing={2}>
                {faqGeneral.map((faq, index) => (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${index}-content`}
                      id={`panel${index}-header`}
                    >
                      <Typography sx={{ fontWeight: 500 }}>
                        {faq.pregunta}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {faq.respuesta}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Box>

            {(role === "medico" || role === "admin") && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Preguntas Frecuentes para Médicos
                  </Typography>
                  <Stack spacing={2}>
                    {faqMedico.map((faq, index) => (
                      <Accordion key={index}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`panel-medico-${index}-content`}
                          id={`panel-medico-${index}-header`}
                        >
                          <Typography sx={{ fontWeight: 500 }}>
                            {faq.pregunta}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary">
                            {faq.respuesta}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {role === "paciente" && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Preguntas Frecuentes para Pacientes
                  </Typography>
                  <Stack spacing={2}>
                    {faqPaciente.map((faq, index) => (
                      <Accordion key={index}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`panel-paciente-${index}-content`}
                          id={`panel-paciente-${index}-header`}
                        >
                          <Typography sx={{ fontWeight: 500 }}>
                            {faq.pregunta}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary">
                            {faq.respuesta}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ¿Necesitas más ayuda?
              </Typography>
              <Typography variant="body1" paragraph>
                Si no encuentras la respuesta que buscas, no dudes en
                contactarnos. Estamos aquí para ayudarte.
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body2">
                  <strong>Email:</strong> contacto@cuidarteplus.cl
                </Typography>
                <Typography variant="body2">
                  <strong>Teléfono:</strong> +56 9 1234 5678
                </Typography>
                <Typography variant="body2">
                  <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 -
                  18:00 hrs.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
