import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

export default function Home() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Estados para médico
  const [examenes, setExamenes] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  // Estados para paciente
  const [examenesPaciente, setExamenesPaciente] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (role === "medico" || role === "admin") {
        const [examenesRes, pacientesRes] = await Promise.all([
          api.get("/examenes").catch(() => ({ data: [] })),
          api.get("/pacientes").catch(() => ({ data: [] })),
        ]);
        setExamenes(examenesRes.data || []);
        setPacientes(pacientesRes.data || []);
      } else if (role === "paciente" && user?.pacienteId) {
        const { data } = await api
          .get(`/examenes/paciente/${user.pacienteId}`)
          .catch(() => ({ data: [] }));
        setExamenesPaciente(data || []);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [role, user?.pacienteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Métricas para médico
  const metricasMedico = useMemo(() => {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const examenesEsteMes = examenes.filter(
      (e) => new Date(e.created_at) >= inicioMes
    );

    const pacientesAtendidosIds = new Set(examenes.map((e) => e.paciente_id));

    const ultimosPacientes = pacientes
      .filter((p) => pacientesAtendidosIds.has(p.id))
      .slice(0, 5);

    const ultimosExamenes = examenes.slice(0, 5);

    return {
      examenesTotales: examenes.length,
      examenesEsteMes: examenesEsteMes.length,
      pacientesAtendidos: pacientesAtendidosIds.size,
      pacientesTotales: pacientes.length,
      ultimosPacientes,
      ultimosExamenes,
    };
  }, [examenes, pacientes]);

  // Exámenes filtrados para paciente
  const examenesFiltrados = useMemo(() => {
    if (!searchTerm) return examenesPaciente;

    const term = searchTerm.toLowerCase();
    return examenesPaciente.filter((examen) => {
      const fecha = new Date(examen.created_at).toLocaleDateString("es-CL");
      const tipoExamen = examen.tipo_examen_nombre?.toLowerCase() || "";
      return fecha.includes(term) || tipoExamen.includes(term);
    });
  }, [examenesPaciente, searchTerm]);

  if (loading) {
    return (
      <Stack
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "400px" }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Cargando información...
        </Typography>
      </Stack>
    );
  }

  // Dashboard para Médico/Admin
  if (role === "medico" || role === "admin") {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" color="primary">
            Bienvenido, <b>{user?.nombre_usuario}</b>
          </Typography>
        </Box>

        {/* Métricas principales */}
        <div className="grid grid-cols-4 gap-4">
          <Grid item xs={12} sm={6} md={3} className="w-full">
            <Card
              sx={{
                background: "linear-gradient(135deg, #3293BA 0%, #2A9D9E 100%)",
                color: "white",
                boxShadow: "0 10px 30px rgba(27, 117, 118, 0.3)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {metricasMedico.examenesTotales}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Exámenes Cargados
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #C5652C 0%, #6BCF9A 100%)",
                color: "white",
                boxShadow: "0 10px 30px rgba(75, 188, 127, 0.3)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {metricasMedico.examenesEsteMes}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Exámenes de Este Mes
                    </Typography>
                  </Box>
                  <CalendarTodayIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)",
                color: "white",
                boxShadow: "0 10px 30px rgba(255, 152, 0, 0.3)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {metricasMedico.pacientesAtendidos}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pacientes Atendidos
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)",
                color: "white",
                boxShadow: "0 10px 30px rgba(156, 39, 176, 0.3)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {metricasMedico.pacientesTotales}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pacientes Totales
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </div>

        {/* Últimos registros con tabs (8 columnas) y Accesos rápidos (4 columnas) */}
        <div className="grid grid-cols-12 gap-4">
          {/* Últimos registros con tabs - 8 columnas */}
          <div className="col-span-8">
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="tabs de últimos registros"
                >
                  <Tab
                    label="Últimos Pacientes Atendidos"
                    icon={<PeopleIcon />}
                    iconPosition="start"
                    className="!min-h-[auto] !h-auto !pt-4"
                  />
                  <Tab
                    label="Últimos Informes Cargados"
                    icon={<AssignmentIcon />}
                    iconPosition="start"
                    className="!min-h-[auto] !h-auto !pt-4"
                  />
                </Tabs>
              </Box>
              <CardContent>
                {tabValue === 0 && (
                  <Box>
                    {metricasMedico.ultimosPacientes.length > 0 ? (
                      <Stack spacing={1}>
                        {metricasMedico.ultimosPacientes.map((paciente) => (
                          <Paper
                            key={paciente.id}
                            sx={{
                              p: 2,
                              "&:hover": {
                                bgcolor: "action.hover",
                                cursor: "pointer",
                              },
                            }}
                            onClick={() =>
                              navigate(`/pacientes/${paciente.id}/editar`)
                            }
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {`${paciente.primer_nombre || ""} ${
                                    paciente.apellido_paterno || ""
                                  } ${paciente.apellido_materno || ""}`.trim()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  RUT: {paciente.rut}
                                </Typography>
                              </Box>
                              <Chip
                                label="Ver"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay pacientes atendidos aún
                      </Typography>
                    )}
                  </Box>
                )}
                {tabValue === 1 && (
                  <Box>
                    {metricasMedico.ultimosExamenes.length > 0 ? (
                      <Stack spacing={1}>
                        {metricasMedico.ultimosExamenes.map((examen) => (
                          <Paper
                            key={examen.id}
                            sx={{
                              p: 2,
                              "&:hover": {
                                bgcolor: "action.hover",
                                cursor: "pointer",
                              },
                            }}
                            onClick={() => navigate(`/examenes/${examen.id}`)}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {examen.tipo_examen_nombre}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {`${examen.paciente_primer_nombre || ""} ${
                                    examen.paciente_apellido_paterno || ""
                                  }`}{" "}
                                  -{" "}
                                  {new Date(
                                    examen.created_at
                                  ).toLocaleDateString("es-CL")}
                                </Typography>
                              </Box>
                              <Chip
                                label="Ver"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay exámenes cargados aún
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Accesos rápidos - 4 columnas */}
          <div className="col-span-4">
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocalHospitalIcon color="primary" />
                      <Typography variant="h6">Nuevo Examen</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Carga un nuevo examen médico para un paciente.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/examenes")}
                      fullWidth
                    >
                      Cargar Nuevo Examen
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6">Editar Cuenta</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Actualiza tu información personal y cambia tu contraseña.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() =>
                        navigate(`/usuarios/${user?.usuarioId}/editar`)
                      }
                      fullWidth
                    >
                      Editar Cuenta
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </div>
        </div>
      </Stack>
    );
  }

  // Dashboard para Paciente
  if (role === "paciente") {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" color="primary">
            Bienvenido, <b>{user?.nombre_usuario}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Panel de resultados médicos
          </Typography>
        </Box>

        {/* Métrica principal */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #3293BA 0%, #2A9D9E 100%)",
            color: "white",
            boxShadow: "0 10px 30px rgba(27, 117, 118, 0.3)",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {examenesPaciente.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Exámenes Cargados
                </Typography>
              </Box>
              <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Stack>
          </CardContent>
        </Card>

        {/* Accesos rápidos */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <VisibilityIcon color="primary" />
                    <Typography variant="h6">Ver Exámenes</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Consulta todos tus exámenes médicos y resultados.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate("/mis-resultados")}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Ver Mis Exámenes
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6">Editar Cuenta</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Actualiza tu información personal y cambia tu contraseña.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() =>
                      navigate(`/usuarios/${user?.usuarioId}/editar`)
                    }
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Editar Cuenta
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Búsqueda de exámenes */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Buscar Examen
            </Typography>
            <TextField
              fullWidth
              placeholder="Buscar por fecha, tipo de examen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          </CardContent>
        </Card>

        {/* Últimos exámenes cargados */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {searchTerm
                ? "Resultados de Búsqueda"
                : "Últimos Exámenes Cargados"}
            </Typography>
            {examenesFiltrados.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Tipo de Examen
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examenesFiltrados.map((examen) => (
                      <TableRow
                        key={examen.id}
                        sx={{
                          "&:hover": {
                            bgcolor: "action.hover",
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => navigate(`/examenes/${examen.id}`)}
                      >
                        <TableCell>{examen.tipo_examen_nombre}</TableCell>
                        <TableCell>
                          {new Date(examen.created_at).toLocaleDateString(
                            "es-CL"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/examenes/${examen.id}`);
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                {searchTerm
                  ? "No se encontraron exámenes con ese criterio"
                  : "No hay exámenes cargados aún"}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    );
  }

  // Fallback para otros roles o sin rol
  return (
    <Stack spacing={3}>
      <Typography variant="h4" color="primary">
        Bienvenido, <b>{user?.nombre_usuario}</b>
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            No hay información disponible para tu rol.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
