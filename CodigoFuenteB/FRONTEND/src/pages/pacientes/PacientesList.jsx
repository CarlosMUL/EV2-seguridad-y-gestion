import { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import {
  Card,
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import PacientesTabList from "./PacientesTabList";
import PacientesTabCreate from "./PacientesTabCreate";

export default function PacientesList() {
  const [items, setItems] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/pacientes");
      setItems(data || []);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const onDelete = useCallback(
    async (id) => {
      if (role !== "admin") return;
      await api.delete(`/pacientes/${id}`);
      toast.success("Paciente eliminado");
      load();
    },
    [role, load]
  );

  const handleCreateSuccess = () => {
    setTabValue(0);
    load();
  };

  if (loading && items.length === 0) {
    return (
      <Stack
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "400px" }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando pacientes...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <div className="flex flex-row gap-4">
        <PeopleIcon className="text-primary" sx={{ fontSize: 40 }} />
        <div className="flex flex-col pt-1">
          <Typography variant="h5" color="primary">
            Gestión de Pacientes
          </Typography>
          <Typography variant="body" className="!pt-1 !mt-0 text-gray-800">
            Administra la información de los pacientes. Puedes crear, editar y
            eliminar pacientes según tus permisos.
          </Typography>
        </div>
      </div>

      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label="Listar Pacientes"
              icon={<ListIcon />}
              iconPosition="start"
              className="!min-h-[auto] !h-auto !pt-4"
            />
            <Tab
              label="Registrar Paciente"
              icon={<AddIcon />}
              iconPosition="start"
              className="!min-h-[auto] !h-auto !pt-4"
            />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <PacientesTabList
            items={items}
            onDelete={onDelete}
            onLoad={load}
            loading={loading}
          />
        )}
        {tabValue === 1 && (
          <PacientesTabCreate onSuccess={handleCreateSuccess} />
        )}
      </Card>
    </Stack>
  );
}
