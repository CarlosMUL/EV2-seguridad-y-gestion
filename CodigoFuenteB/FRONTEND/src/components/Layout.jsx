import React, { useState } from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Logo from "../assets/logo.svg";

export default function Layout() {
  const { role, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      to: "/home",
      icon: <HomeIcon />,
      roles: ["admin", "medico", "paciente"],
    },
    {
      to: "/pacientes",
      label: "Pacientes",
      icon: <PeopleIcon />,
      roles: ["admin", "medico"],
    },
    {
      to: "/examenes",
      label: "Exámenes Médicos",
      icon: <LocalHospitalIcon />,
      roles: ["admin", "medico", "paciente"],
    },
    {
      to: "/mis-resultados",
      label: "Mis Resultados",
      icon: <AssignmentIcon />,
      roles: ["paciente"],
    },
    {
      to: "/auditoria",
      label: "Auditoría",
      icon: <HistoryIcon />,
      roles: ["admin"],
    },
    {
      to: "/usuarios",
      label: "Usuarios",
      icon: <PeopleIcon />,
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(role || "")
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditAccount = () => {
    navigate(`/usuarios/${user?.usuarioId || 1}/editar`);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Barra de navegación superior */}
      <AppBar
        position="sticky"
        elevation={8}
        sx={{
          backgroundColor: "white",
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Logo y título */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleMobileMenuToggle}
                sx={{ mr: 1, color: "text.primary" }}
                aria-label="Abrir menú de navegación"
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box
              component={Link}
              to="/home"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textDecoration: "none",
                "&:hover": { opacity: 0.8 },
              }}
            >
              <img
                src={Logo}
                alt="Logo del Sistema Médico"
                height={40}
                width={180}
              />
            </Box>
          </Box>

          {/* Menú de navegación (desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              flex: 1,
              justifyContent: "center",
            }}
            component="nav"
            aria-label="Navegación principal"
          >
            {filteredMenuItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  startIcon={item.icon}
                  aria-current={active ? "page" : undefined}
                  aria-label={`Ir a ${item.label}`}
                  sx={{
                    color: active ? "primary" : "black",
                    fontWeight: active ? 600 : 400,
                    fontFamily: '"Rubik", sans-serif',
                    textTransform: "none",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    "&[aria-current='page']": {
                      backgroundColor: "rgba(27, 117, 118, 0.08)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Menú de usuario */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1.5,
                mr: 1,
              }}
            >
              <Box>
                <Typography
                  className="text-black text-sm inline-block"
                  sx={{
                    fontWeight: 600,
                    fontFamily: '"Rubik", sans-serif',
                  }}
                >
                  {user?.nombre_usuario || "Usuario"}
                </Typography>
                <Typography
                  className="text-black text-sm block"
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Rubik", sans-serif',
                    fontSize: 11,
                    textTransform: "capitalize",
                  }}
                >
                  {role || "Usuario"}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: "text.secondary",
              }}
              aria-label="Menú de usuario"
              aria-controls={anchorEl ? "user-menu" : undefined}
              aria-haspopup="true"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              MenuListProps={{
                "aria-labelledby": "user-menu-button",
              }}
            >
              <MenuItem
                onClick={handleEditAccount}
                aria-label="Editar cuenta de usuario"
                className="text-black font-semibold"
                sx={{
                  fontFamily: '"Rubik", sans-serif',
                  fontSize: 13,
                }}
              >
                <EditIcon sx={{ mr: 1, fontSize: 16 }} />
                Editar cuenta
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="text-black text-xs font-semibold"
                sx={{
                  fontFamily: '"Rubik", sans-serif',
                  color: "error.main",
                  fontSize: 13,
                }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: 16 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móvil
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            Menú
          </Typography>
          <IconButton onClick={handleMobileMenuToggle} aria-label="Cerrar menú">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List component="nav" aria-label="Navegación móvil">
          {filteredMenuItems.map((item) => {
            const active = isActive(item.to);
            return (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                onClick={handleMobileMenuToggle}
                selected={active}
                aria-current={active ? "page" : undefined}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(27, 117, 118, 0.08)",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(27, 117, 118, 0.12)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: active ? "primary.main" : "inherit" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: "auto",
          bgcolor: "white",
          borderTop: "1px solid",
          borderColor: "divider",
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 4,
            }}
          >
            {/* Logo y descripción */}
            <Box sx={{ flex: 1 }}>
              <Box
                component={Link}
                to="/home"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  mb: 2,
                  textDecoration: "none",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                <img
                  src={Logo}
                  alt="Logo del Sistema Médico"
                  height={32}
                  width={140}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 300 }}
              >
                Sistema de gestión de exámenes médicos. Administra pacientes,
                exámenes y resultados de manera eficiente y segura.
              </Typography>
            </Box>

            {/* Enlaces rápidos */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 4 },
                flex: 1,
                justifyContent: { xs: "flex-start", md: "center" },
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
                >
                  Enlaces Rápidos
                </Typography>
                <Stack spacing={0.5}>
                  <Button
                    component={Link}
                    to="/home"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      color: "text.secondary",
                      textTransform: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Inicio
                  </Button>
                  {(role === "medico" || role === "admin") && (
                    <>
                      <Button
                        component={Link}
                        to="/pacientes"
                        size="small"
                        sx={{
                          justifyContent: "flex-start",
                          color: "text.secondary",
                          textTransform: "none",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        Pacientes
                      </Button>
                      <Button
                        component={Link}
                        to="/examenes"
                        size="small"
                        sx={{
                          justifyContent: "flex-start",
                          color: "text.secondary",
                          textTransform: "none",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        Exámenes
                      </Button>
                    </>
                  )}
                  {role === "paciente" && (
                    <Button
                      component={Link}
                      to="/mis-resultados"
                      size="small"
                      sx={{
                        justifyContent: "flex-start",
                        color: "text.secondary",
                        textTransform: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      Mis Resultados
                    </Button>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
                >
                  Información
                </Typography>
                <Stack spacing={0.5}>
                  <Button
                    component={Link}
                    to="/acerca-de"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      color: "text.secondary",
                      textTransform: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Acerca de
                  </Button>
                  <Button
                    component={Link}
                    to="/ayuda"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      color: "text.secondary",
                      textTransform: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Ayuda
                  </Button>
                  <Button
                    component={Link}
                    to={`/usuarios/${user?.usuarioId || 1}/editar`}
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      color: "text.secondary",
                      textTransform: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Mi Cuenta
                  </Button>
                </Stack>
              </Box>
            </Box>

            {/* Información de contacto */}
            <Box sx={{ flex: 1, textAlign: { xs: "left", md: "right" } }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
              >
                Contacto
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <EmailIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    contacto@cuidarteplus.cl
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    +56 9 1234 5678
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <LocationOnIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Santiago, Chile
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Copyright y derechos */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} cuidarteplus. Todos los derechos
              reservados.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                component={Link}
                to="/politica-privacidad"
                size="small"
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  minWidth: "auto",
                  px: 1,
                  "&:hover": { color: "primary.main" },
                }}
              >
                Política de Privacidad
              </Button>
              <Button
                component={Link}
                to="/terminos-uso"
                size="small"
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  minWidth: "auto",
                  px: 1,
                  "&:hover": { color: "primary.main" },
                }}
              >
                Términos de Uso
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
