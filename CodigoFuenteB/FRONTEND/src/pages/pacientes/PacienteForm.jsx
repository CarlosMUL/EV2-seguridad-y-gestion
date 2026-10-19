import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { useFormik } from "formik";
import { pacienteSchema } from "../../validations/pacientes";
import PacientesTabCreate from "./PacientesTabCreate";

export default function PacienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (id) {
      loadPaciente();
    }
  }, [id]);

  const loadPaciente = async () => {
    try {
      const { data } = await api.get(`/pacientes/${id}`);
      setInitialValues({
        rut: data.rut || "",
        primer_nombre: data.primer_nombre || "",
        apellido_paterno: data.apellido_paterno || "",
        apellido_materno: data.apellido_materno || "",
        fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split("T")[0] : "",
        sexo: data.sexo || "",
        nacionalidad: data.nacionalidad || "",
        estado_civil: data.estado_civil || "",
        email: data.email || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        contacto_emergencia_nombre: data.contacto_emergencia_nombre || "",
        contacto_emergencia_telefono: data.contacto_emergencia_telefono || "",
        contacto_emergencia_relacion: data.contacto_emergencia_relacion || "",
        tipo_prevision: data.tipo_prevision || "",
        tiene_convenio: data.tiene_convenio || false,
        grupo_sanguineo: data.grupo_sanguineo || "",
        alergias: data.alergias || "",
        enfermedades_cronicas: data.enfermedades_cronicas || "",
        discapacidades: data.discapacidades || "",
        observaciones_medicas_generales: data.observaciones_medicas_generales || "",
      });
    } catch (error) {
      toast.error("Error al cargar paciente");
      navigate("/pacientes");
    }
  };

  if (id && !initialValues) {
    return <div>Cargando...</div>;
  }

  return (
    <PacientesTabCreate
      initialValues={initialValues}
      pacienteId={id}
      onSuccess={() => navigate("/pacientes")}
    />
  );
}

