import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import UsuariosList from "./pages/usuarios/UsuariosList";
import UsuarioForm from "./pages/usuarios/UsuarioForm";
import { RequireAuth, RequireAdmin, RequireAdminOrOwnUser } from "./components/RoleGuard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PacientesList from "./pages/pacientes/PacientesList";
import PacienteForm from "./pages/pacientes/PacienteForm";
import ExamenesList from "./pages/examenes/ExamenesList";
import ExamenDetalle from "./pages/examenes/ExamenDetalle";
import MisResultados from "./pages/examenes/MisResultados";
import AuditoriaList from "./pages/auditoria/AuditoriaList";
import Home from "./pages/Home";
import PoliticaPrivacidad from "./pages/informacion/PoliticaPrivacidad";
import TerminosUso from "./pages/informacion/TerminosUso";
import AcercaDe from "./pages/informacion/AcercaDe";
import Ayuda from "./pages/informacion/Ayuda";

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pacientes" element={<PacientesList />} />
          <Route path="/pacientes/nuevo" element={<PacienteForm />} />
          <Route path="/pacientes/:id/editar" element={<PacienteForm />} />
          <Route path="/examenes" element={<ExamenesList />} />
          <Route path="/examenes/:id" element={<ExamenDetalle />} />
          <Route path="/mis-resultados" element={<MisResultados />} />
          <Route path="/auditoria" element={<RequireAdmin><AuditoriaList /></RequireAdmin>} />
          <Route path="/usuarios" element={<RequireAdmin><UsuariosList /></RequireAdmin>} />
          <Route
            path="/usuarios/:id/editar"
            element={
              <RequireAdminOrOwnUser>
                <UsuarioForm />
              </RequireAdminOrOwnUser>
            }
          />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-uso" element={<TerminosUso />} />
          <Route path="/acerca-de" element={<AcercaDe />} />
          <Route path="/ayuda" element={<Ayuda />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
