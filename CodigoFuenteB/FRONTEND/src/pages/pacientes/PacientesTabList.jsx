import { useMemo, useState, useCallback } from "react";
import {
  IconButton,
  Stack,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function PacientesTabList({ items, onDelete }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState(null);

  const handleDeleteClick = useCallback((id, nombrePaciente) => {
    setPacienteToDelete({ id, nombrePaciente });
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = () => {
    if (pacienteToDelete) {
      onDelete(pacienteToDelete.id);
      setOpenDeleteDialog(false);
      setPacienteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setPacienteToDelete(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "primer_nombre",
        header: "Nombre Completo",
        size: 250,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 32,
                height: 32,
                fontSize: "0.875rem",
                color: "white",
              }}
            >
              {row.original.primer_nombre?.charAt(0)?.toUpperCase() || "P"}
            </Avatar>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, fontSize: "0.9rem" }}
            >
              {`${row.original.primer_nombre || ""} ${
                row.original.apellido_paterno || ""
              } ${row.original.apellido_materno || ""}`.trim()}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "rut",
        header: "RUT",
        size: 120,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">{row.original.email || "-"}</Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "telefono",
        header: "Teléfono",
        size: 150,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">
              {row.original.telefono || "-"}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "fecha_nacimiento",
        header: "Fecha de Nacimiento",
        size: 150,
        Cell: ({ row }) => {
          const fecha = row.original.fecha_nacimiento;
          return fecha ? new Date(fecha).toLocaleDateString("es-CL") : "-";
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              color="primary"
              size="small"
              data-testid={`button-cliente-editar-${row.original.id}`}
              onClick={() => navigate(`/pacientes/${row.original.id}/editar`)}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              data-testid={`button-cliente-eliminar-${row.original.id}`}
              onClick={() =>
                handleDeleteClick(row.original.id, row.original.nombre)
              }
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={items}
        enableColumnResizing={false}
        enablePagination
        enableBottomToolbar
        enableTopToolbar={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enableHiding={false}
        layoutMode="grid"
        initialState={{
          pagination: {
            pageSize: 10,
            pageIndex: 0,
          },
          density: "comfortable",
        }}
        localization={MRT_Localization_ES}
        muiTablePaperProps={{
          sx: {
            width: "100%",
            maxWidth: "100%",
            boxShadow: "none",
            overflow: "hidden",
            fontFamily: '"Poppins", "Arial", "sans-serif"',
            backgroundColor: "#ffffff",
          },
        }}
        muiTableProps={{
          sx: {
            width: "100%",
            minWidth: "100%",
            tableLayout: "auto",
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
        muiTableContainerProps={{
          sx: {
            maxHeight: "600px",
            width: "100%",
            overflowX: "auto",
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            backgroundColor: "#c8e9f7",
            fontWeight: 600,
            fontSize: "1rem",
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
        muiTableHeadProps={{
          sx: {
            width: "100%",
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
        muiTableBodyProps={{
          sx: {
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
        displayColumnDefOptions={{
          "mrt-row-actions": {
            size: 120,
          },
        }}
        muiTableBodyRowProps={{
          sx: {
            "&:nth-of-type(even)": {
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            },
            "&:hover": {
              backgroundColor: "rgba(27, 117, 118, 0.08)",
            },
            transition: "background-color 0.2s ease",
            fontFamily: '"Poppins", "Arial", "sans-serif"',
          },
        }}
      />

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al paciente{" "}
            <strong>{pacienteToDelete?.nombrePaciente}</strong>? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
