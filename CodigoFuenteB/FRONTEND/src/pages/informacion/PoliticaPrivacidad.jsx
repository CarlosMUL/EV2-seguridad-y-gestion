import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import PrivacyIcon from "@mui/icons-material/Policy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();

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
          <PrivacyIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" color="primary">
              Política de Privacidad
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Última actualización: {new Date().toLocaleDateString("es-CL")}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                1. Introducción
              </Typography>
              <Typography variant="body1" paragraph>
                cuidarteplus ("nosotros", "nuestro" o "la plataforma") se
                compromete a proteger la privacidad y seguridad de la
                información personal de nuestros usuarios. Esta Política de
                Privacidad describe cómo recopilamos, usamos, almacenamos y
                protegemos su información cuando utiliza nuestro sistema de
                gestión de exámenes médicos.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                2. Información que Recopilamos
              </Typography>
              <Typography variant="body1" paragraph>
                Recopilamos la siguiente información:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  <strong>Información de cuenta:</strong> nombre de usuario,
                  correo electrónico y contraseña.
                </Typography>
                <Typography variant="body2" component="li">
                  <strong>Datos de pacientes:</strong> información personal,
                  médica y de contacto de los pacientes registrados en el
                  sistema.
                </Typography>
                <Typography variant="body2" component="li">
                  <strong>Datos de exámenes médicos:</strong> resultados,
                  diagnósticos, tratamientos y documentos asociados.
                </Typography>
                <Typography variant="body2" component="li">
                  <strong>Datos de uso:</strong> registros de acceso, acciones
                  realizadas y actividad en el sistema (auditoría).
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                3. Uso de la Información
              </Typography>
              <Typography variant="body1" paragraph>
                Utilizamos la información recopilada para:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Proporcionar y mejorar nuestros servicios de gestión médica.
                </Typography>
                <Typography variant="body2" component="li">
                  Gestionar cuentas de usuario y autenticación.
                </Typography>
                <Typography variant="body2" component="li">
                  Mantener registros médicos seguros y accesibles.
                </Typography>
                <Typography variant="body2" component="li">
                  Cumplir con obligaciones legales y regulatorias.
                </Typography>
                <Typography variant="body2" component="li">
                  Realizar auditorías y mantener la seguridad del sistema.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4. Protección de Datos
              </Typography>
              <Typography variant="body1" paragraph>
                Implementamos medidas de seguridad técnicas y organizativas para
                proteger su información:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Encriptación de datos sensibles en tránsito y en reposo.
                </Typography>
                <Typography variant="body2" component="li">
                  Control de acceso basado en roles y permisos.
                </Typography>
                <Typography variant="body2" component="li">
                  Registros de auditoría para rastrear el acceso a información
                  sensible.
                </Typography>
                <Typography variant="body2" component="li">
                  Actualizaciones regulares de seguridad y parches del sistema.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                5. Compartir Información
              </Typography>
              <Typography variant="body1" paragraph>
                No vendemos, alquilamos ni compartimos su información personal
                con terceros, excepto en las siguientes circunstancias:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Cuando sea requerido por ley o por orden judicial.
                </Typography>
                <Typography variant="body2" component="li">
                  Para proteger los derechos, propiedad o seguridad de
                  cuidarteplus, nuestros usuarios o terceros.
                </Typography>
                <Typography variant="body2" component="li">
                  Con su consentimiento explícito.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                6. Sus Derechos
              </Typography>
              <Typography variant="body1" paragraph>
                Usted tiene derecho a:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Acceder a su información personal almacenada en el sistema.
                </Typography>
                <Typography variant="body2" component="li">
                  Corregir información inexacta o incompleta.
                </Typography>
                <Typography variant="body2" component="li">
                  Solicitar la eliminación de su información (sujeto a
                  obligaciones legales).
                </Typography>
                <Typography variant="body2" component="li">
                  Obtener una copia de sus datos en formato estructurado.
                </Typography>
                <Typography variant="body2" component="li">
                  Retirar su consentimiento en cualquier momento.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                7. Retención de Datos
              </Typography>
              <Typography variant="body1" paragraph>
                Conservamos su información personal durante el tiempo necesario
                para cumplir con los propósitos descritos en esta política, a
                menos que la ley requiera o permita un período de retención más
                largo. Los registros médicos se conservan de acuerdo con las
                regulaciones sanitarias aplicables.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                8. Cambios a esta Política
              </Typography>
              <Typography variant="body1" paragraph>
                Nos reservamos el derecho de actualizar esta Política de
                Privacidad en cualquier momento. Le notificaremos sobre cambios
                significativos mediante una notificación en el sistema o por
                correo electrónico. La fecha de la última actualización se
                indica al inicio de este documento.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                9. Contacto
              </Typography>
              <Typography variant="body1" paragraph>
                Si tiene preguntas, inquietudes o solicitudes relacionadas con
                esta Política de Privacidad o el manejo de sus datos personales,
                puede contactarnos en:
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body2">
                  <strong>Email:</strong> contacto@cuidarteplus.cl
                </Typography>
                <Typography variant="body2">
                  <strong>Teléfono:</strong> +56 9 1234 5678
                </Typography>
                <Typography variant="body2">
                  <strong>Dirección:</strong> Santiago, Chile
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
