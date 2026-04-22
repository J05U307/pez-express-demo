import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/layout/Layout";
import RoleRoute from "./RoleRoute";

// Carga inmediata solo para rutas críticas
import Home  from "../pages/public/Home";
import Login from "../pages/auth/Login";

// Lazy loading para todo el dashboard (se carga solo cuando entra)
const NotFound        = lazy(() => import("../pages/public/NotFound"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const Dashboard       = lazy(() => import("../pages/dashboard/Dashboard"));
const Pedidos         = lazy(() => import("../pages/dashboard/Pedidos"));
const Pagos           = lazy(() => import("../pages/dashboard/Pagos"));
const Cocina          = lazy(() => import("../pages/dashboard/Cocina"));
const Usuarios        = lazy(() => import("../pages/dashboard/Usuarios"));
const Insumos         = lazy(() => import("../pages/dashboard/Insumos"));
const Productos       = lazy(() => import("../pages/dashboard/Productos"));
const Recetas         = lazy(() => import("../pages/dashboard/Recetas"));
const Reportes        = lazy(() => import("../pages/dashboard/Reportes"));
const General         = lazy(() => import("../pages/dashboard/configuracion/General"));
const Mesas           = lazy(() => import("../pages/dashboard/configuracion/Mesas"));
const Perfil          = lazy(() => import("../pages/dashboard/configuracion/Perfil"));

const ADMIN        = ["ADMINISTRADOR"];
const ADMIN_MESERO = ["ADMINISTRADOR", "MESERO"];
const TODOS        = ["ADMINISTRADOR", "MESERO"];

// Fallback mientras carga el chunk
const PageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
);

export default function AppRouter() {
  return (
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/"          element={<Home />} />
              <Route path="/nosotros"  element={<Home scrollTo="nosotros" />} />
              <Route path="/carta"     element={<Home scrollTo="carta" />} />
              <Route path="/ubicacion" element={<Home scrollTo="ubicacion" />} />
              <Route path="/contacto"  element={<Home scrollTo="contacto" />} />
            </Route>

            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<RoleRoute allowed={TODOS}><Dashboard /></RoleRoute>} />
              <Route path="pedidos"  element={<RoleRoute allowed={ADMIN_MESERO}><Pedidos /></RoleRoute>} />
              <Route path="pagos"    element={<RoleRoute allowed={ADMIN_MESERO}><Pagos /></RoleRoute>} />
              <Route path="cocina"   element={<RoleRoute allowed={ADMIN}><Cocina /></RoleRoute>} />
              <Route path="usuarios" element={<RoleRoute allowed={ADMIN}><Usuarios /></RoleRoute>} />
              <Route path="insumos"  element={<RoleRoute allowed={ADMIN}><Insumos /></RoleRoute>} />
              <Route path="productos" element={<RoleRoute allowed={ADMIN}><Productos /></RoleRoute>} />
              <Route path="recetas"  element={<RoleRoute allowed={ADMIN}><Recetas /></RoleRoute>} />
              <Route path="reportes" element={<RoleRoute allowed={ADMIN}><Reportes /></RoleRoute>} />
              <Route path="configuracion">
                <Route path="perfil"   element={<RoleRoute allowed={TODOS}><Perfil /></RoleRoute>} />
                <Route path="general"  element={<RoleRoute allowed={ADMIN}><General /></RoleRoute>} />
                <Route path="mesas"    element={<RoleRoute allowed={ADMIN}><Mesas /></RoleRoute>} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
  );
}