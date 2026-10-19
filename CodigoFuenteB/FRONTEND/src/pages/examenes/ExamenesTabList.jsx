import { useMemo, useState, useCallback } from "react";
import {
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { toast } from "sonner";

export default function ExamenesTabList({ items, onLoad, onEdit }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [examenToDelete, setExamenToDelete] = useState(null);

  const handleDeleteClick = useCallback((id, tipoExamen) => {
    setExamenToDelete({ id, tipoExamen });
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (examenToDelete) {
      try {
        await api.delete(`/examenes/${examenToDelete.id}`);
        toast.success("Examen eliminado exitosamente");
        setOpenDeleteDialog(false);
        setExamenToDelete(null);
        onLoad();
      } catch (error) {
        toast.error("Error al eliminar el examen: " + error.message);
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setExamenToDelete(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "tipo_examen_nombre",
        header: "Tipo de Examen",
        size: 200,
      },
      ...(role !== "paciente"
        ? [
            {
              accessorKey: "paciente_rut",
              header: "RUT Paciente",
              size: 120,
            },
            {
              accessorKey: "paciente_primer_nombre",
              header: "Paciente",
              size: 250,
              Cell: ({ row }) => (
                <Typography variant="body2">
                  {`${row.original.paciente_primer_nombre || ""} ${
                    row.original.paciente_apellido_paterno || ""
                  } ${row.original.paciente_apellido_materno || ""}`.trim()}
                </Typography>
              ),
            },
          ]
        : []),
      {
        accessorKey: "diagnosis",
        header: "Diagnóstico",
        size: 200,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
            }}
          >
            {row.original.diagnosis || "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        size: 150,
        Cell: ({ row }) => {
          const fecha = row.original.created_at;
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
            {role === "paciente" ? (
              <IconButton
                size="small"
                onClick={() => navigate(`/examenes/${row.original.id}`)}
                title="Ver detalles"
                aria-label="Ver detalles del examen"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            ) : (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (onEdit) {
                      onEdit(row.original.id);
                    } else {
                      navigate(`/examenes/${row.original.id}`);
                    }
                  }}
                  title="Editar"
                  aria-label="Editar examen"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                {role === "admin" && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleDeleteClick(
                        row.original.id,
                        row.original.tipo_examen_nombre
                      )
                    }
                    title="Eliminar"
                    aria-label="Eliminar examen"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </Stack>
        ),
      },
    ],
    [role, navigate, handleDeleteClick, onEdit]
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
            ¿Estás seguro de que deseas eliminar el examen{" "}
            <strong>{examenToDelete?.tipoExamen}</strong>? Esta acción no se
            puede deshacer.
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
