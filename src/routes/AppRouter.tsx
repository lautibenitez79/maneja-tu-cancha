import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import Login from "./Login";
import Contacto from "./Contacto";
import QuienesSomos from "./QuienesSomos";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RoleRoute from "../features/auth/components/RoleRoute";
import DashboardGate from "@/features/dashboard/components/DashboardGate";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import ResourcesPage from "@/features/resources/pages/ResourcesPage";
import CreateResourcePage from "@/features/resources/pages/CreateResourcePage";
import EditResourcePage from "@/features/resources/pages/EditResourcePage";
// import CustomersPage from "@/features/customers/pages/CustomersPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import UsersPage from "../features/users/pages/UsersPage";
import PublicBookingPage from "@/features/public-booking/pages/PublicBookingPage";
import PaymentSuccessPage from "@/features/public-booking/pages/PaymentSuccessPage";
import PaymentErrorPage from "@/features/public-booking/pages/PaymentErrorPage";
import PaymentPendingPage from "@/features/public-booking/pages/PaymentPendingPage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

export function AppRouter() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/contacto"
        element={<Contacto />}
      />

      <Route
        path="/quienes-somos"
        element={<QuienesSomos />}
      />

      <Route
        path="/reservar/:slug"
        element={<PublicBookingPage />}
      />

      <Route
        path="/pago/exito"
        element={<PaymentSuccessPage />}
      />

      <Route
        path="/pago/error"
        element={<PaymentErrorPage />}
      />

      <Route
        path="/pago/pendiente"
        element={<PaymentPendingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardGate>
              <DashboardLayout />
            </DashboardGate>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        <Route
          path="resources"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <ResourcesPage />
            </RoleRoute>
          }
        />

        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <UsersPage />
            </RoleRoute>
          }
        />

        <Route
          path="resources/new"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <CreateResourcePage />
            </RoleRoute>
          }
        />

        <Route
          path="resources/:id/edit"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <EditResourcePage />
            </RoleRoute>
          }
        />
        {/* <Route
            path="customers"
            element={<CustomersPage />}
        /> */}
        <Route

          path="calendar"

          element={

            <CalendarPage/>

          }

        />
      </Route>

    </Routes>
  );
}