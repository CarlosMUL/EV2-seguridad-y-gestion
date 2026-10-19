import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AcercaDe() {
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
          <InfoIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" color="primary">
              Acerca de cuidarteplus
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestión de Exámenes Médicos
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ¿Qué es cuidarteplus?
              </Typography>
              <Typography variant="body1" paragraph>
                cuidarteplus es una plataforma integral de gestión de exámenes
                médicos diseñada para facilitar la administración de información
                médica de manera segura, eficiente y accesible. Nuestro sistema
                permite a profesionales de la salud y pacientes gestionar
                exámenes, resultados y documentos médicos en un entorno digital
                confiable.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Nuestras Características Principales
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <LocalHospitalIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Gestión de Exámenes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Crea, edita y gestiona exámenes médicos con toda la
                          información relevante: diagnósticos, tratamientos,
                          observaciones y más.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <SecurityIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Seguridad y Privacidad
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Protección avanzada de datos con control de acceso
                          basado en roles, encriptación y registros de auditoría
                          completos.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <SpeedIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Acceso Rápido
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Interfaz intuitiva que permite acceso rápido a
                          información médica importante y resultados de
                          exámenes.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Funcionalidades del Sistema
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Chip
                      label="Gestión de Pacientes"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                    <Chip
                      label="Registro de Exámenes Médicos"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                    <Chip
                      label="Almacenamiento de Documentos"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                    <Chip
                      label="Búsqueda y Filtrado"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Chip
                      label="Control de Acceso por Roles"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                    <Chip
                      label="Registros de Auditoría"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                    <Chip
                      label="Dashboard Personalizado"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                    <Chip
                      label="Exportación de Datos"
                      color="primary"
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        width: "fit-content",
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Roles del Sistema
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Administrador
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acceso completo al sistema: gestión de usuarios,
                        pacientes, exámenes, auditoría y configuración del
                        sistema.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Médico
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Puede crear y gestionar exámenes médicos, ver pacientes
                        y acceder a información médica relevante para su
                        práctica.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Paciente
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acceso a sus propios exámenes médicos, resultados y
                        documentos. Puede buscar y visualizar su historial
                        médico.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Compromiso con la Seguridad
              </Typography>
              <Typography variant="body1" paragraph>
                En cuidarteplus, la seguridad y privacidad de la información
                médica es nuestra máxima prioridad. Implementamos medidas de
                seguridad de nivel empresarial, incluyendo:
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Encriptación de datos en tránsito y en reposo.
                </Typography>
                <Typography variant="body2" component="li">
                  Autenticación segura y control de acceso granular.
                </Typography>
                <Typography variant="body2" component="li">
                  Registros de auditoría completos para rastrear todas las
                  acciones.
                </Typography>
                <Typography variant="body2" component="li">
                  Cumplimiento con regulaciones de privacidad de datos médicos.
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contacto
              </Typography>
              <Typography variant="body1" paragraph>
                Para más información sobre cuidarteplus o para solicitar
                soporte, puede contactarnos:
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
