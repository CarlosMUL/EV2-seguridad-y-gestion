import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TerminosUso() {
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
          <DescriptionIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" color="primary">
              Términos de Uso
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
                1. Aceptación de los Términos
              </Typography>
              <Typography variant="body1" paragraph>
                Al acceder y utilizar el sistema cuidarteplus, usted acepta
                estar sujeto a estos Términos de Uso y a todas las leyes y
                regulaciones aplicables. Si no está de acuerdo con alguno de
                estos términos, no debe utilizar el sistema.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                2. Descripción del Servicio
              </Typography>
              <Typography variant="body1" paragraph>
                cuidarteplus es una plataforma de gestión de exámenes médicos
                que permite a profesionales de la salud y pacientes gestionar,
                almacenar y acceder a información médica de manera segura y
                eficiente.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                3. Cuentas de Usuario
              </Typography>
              <Typography variant="body1" paragraph>
                Para utilizar el sistema, debe crear una cuenta proporcionando
                información precisa y completa. Usted es responsable de:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Mantener la confidencialidad de sus credenciales de acceso.
                </Typography>
                <Typography variant="body2" component="li">
                  Todas las actividades que ocurran bajo su cuenta.
                </Typography>
                <Typography variant="body2" component="li">
                  Notificar inmediatamente cualquier uso no autorizado de su
                  cuenta.
                </Typography>
                <Typography variant="body2" component="li">
                  Asegurarse de que la información proporcionada sea precisa y
                  esté actualizada.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4. Uso Aceptable
              </Typography>
              <Typography variant="body1" paragraph>
                Usted se compromete a utilizar el sistema únicamente para fines
                legítimos y de acuerdo con estos términos. Está prohibido:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Intentar acceder a áreas restringidas del sistema sin
                  autorización.
                </Typography>
                <Typography variant="body2" component="li">
                  Modificar, copiar o distribuir el contenido del sistema sin
                  permiso.
                </Typography>
                <Typography variant="body2" component="li">
                  Utilizar el sistema para actividades ilegales o no
                  autorizadas.
                </Typography>
                <Typography variant="body2" component="li">
                  Interferir con el funcionamiento del sistema o intentar
                  vulnerar sus medidas de seguridad.
                </Typography>
                <Typography variant="body2" component="li">
                  Compartir sus credenciales de acceso con terceros.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                5. Información Médica
              </Typography>
              <Typography variant="body1" paragraph>
                Al utilizar el sistema, usted reconoce que:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  La información médica almacenada es confidencial y está
                  protegida por leyes de privacidad.
                </Typography>
                <Typography variant="body2" component="li">
                  Es responsable de la exactitud de la información médica que
                  ingresa al sistema.
                </Typography>
                <Typography variant="body2" component="li">
                  El sistema es una herramienta de gestión y no reemplaza el
                  juicio clínico profesional.
                </Typography>
                <Typography variant="body2" component="li">
                  Debe cumplir con todas las regulaciones sanitarias aplicables
                  al manejar información médica.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                6. Propiedad Intelectual
              </Typography>
              <Typography variant="body1" paragraph>
                Todo el contenido del sistema, incluyendo diseño, código,
                logotipos y documentación, es propiedad de cuidarteplus y está
                protegido por leyes de propiedad intelectual. Usted no puede
                reproducir, distribuir o crear trabajos derivados sin
                autorización escrita.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                7. Limitación de Responsabilidad
              </Typography>
              <Typography variant="body1" paragraph>
                cuidarteplus se proporciona "tal cual" sin garantías de ningún
                tipo. No garantizamos que el sistema esté libre de errores,
                virus o interrupciones. No seremos responsables por daños
                directos, indirectos, incidentales o consecuentes derivados del
                uso o incapacidad de usar el sistema.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                8. Modificaciones del Servicio
              </Typography>
              <Typography variant="body1" paragraph>
                Nos reservamos el derecho de modificar, suspender o discontinuar
                cualquier aspecto del sistema en cualquier momento, con o sin
                previo aviso. No seremos responsables ante usted o terceros por
                cualquier modificación, suspensión o discontinuación.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                9. Terminación
              </Typography>
              <Typography variant="body1" paragraph>
                Podemos terminar o suspender su acceso al sistema
                inmediatamente, sin previo aviso, por cualquier motivo,
                incluyendo el incumplimiento de estos términos. Al terminar, su
                derecho a utilizar el sistema cesará inmediatamente.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                10. Ley Aplicable
              </Typography>
              <Typography variant="body1" paragraph>
                Estos términos se rigen por las leyes de Chile. Cualquier
                disputa relacionada con estos términos será resuelta en los
                tribunales competentes de Santiago, Chile.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                11. Contacto
              </Typography>
              <Typography variant="body1" paragraph>
                Para consultas sobre estos Términos de Uso, puede contactarnos
                en:
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
