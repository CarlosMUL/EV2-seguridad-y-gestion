import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import {
  Card,
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  CircularProgress,
  Button,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { useAuth } from "../../hooks/useAuth";
import ExamenesTabList from "./ExamenesTabList";
import ExamenForm from "./ExamenForm";

export default function ExamenesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingExamenId, setEditingExamenId] = useState(null);
  const { role } = useAuth();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/examenes");
      setItems(data || []);
    } catch (error) {
      console.error("Error al cargar exámenes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Verificar si hay un parámetro de edición en la URL
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setEditingExamenId(parseInt(editId));
      setTabValue(1);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setEditingExamenId(null);
    }
  };

  const handleCreateSuccess = () => {
    setTabValue(0);
    setEditingExamenId(null);
    load();
  };

  const handleEdit = (examenId) => {
    setEditingExamenId(examenId);
    setTabValue(1);
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
          Cargando exámenes...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <div className="flex flex-row gap-4">
        <LocalHospitalIcon className="text-primary" sx={{ fontSize: 40 }} />
        <div className="flex flex-col pt-1">
          <Typography variant="h5" color="primary">
            {role === "paciente" ? "Mis Exámenes Médicos" : "Gestión de Exámenes Médicos"}
          </Typography>
          <Typography variant="body" className="!pt-1 !mt-0 text-gray-800">
            {role === "paciente"
              ? "Consulta y visualiza tus exámenes médicos y resultados."
              : "Administra los exámenes médicos de los pacientes. Puedes crear, editar y ver exámenes según tus permisos."}
          </Typography>
        </div>
      </div>

      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label="Listar Exámenes"
              icon={<ListIcon />}
              iconPosition="start"
              className="!min-h-[auto] !h-auto !pt-4"
            />
            {(role === "medico" || role === "admin") && (
              <Tab
                label="Nuevo Examen"
                icon={<AddIcon />}
                iconPosition="start"
                className="!min-h-[auto] !h-auto !pt-4"
              />
            )}
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <ExamenesTabList items={items} onLoad={load} onEdit={handleEdit} />
        )}
        {tabValue === 1 && (
          <ExamenForm
            onSuccess={handleCreateSuccess}
            examenId={editingExamenId}
          />
        )}
      </Card>
    </Stack>
  );
}
