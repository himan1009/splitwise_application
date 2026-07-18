import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { hasStoredSession } from "./utils/auth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MonthlyTracker from "./pages/MonthlyTracker";
import Groups from "./pages/Groups";
import Debts from "./pages/Debts";
import CreateGroup from "./pages/CreateGroup";
import GroupDetails from "./pages/GroupDetails";
import AppLayout from "./layout/AppLayout";
import AddDebt from "./pages/AddDebt";
import DebtDetails from "./pages/DebtDetails";
import NotFoundRedirect from "./pages/NotFoundRedirect";
import GuestRoute, { ProtectedRoute, RootRedirect } from "./components/AuthRoute";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasStoredSession());

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login setIsAuthenticated={setIsAuthenticated} />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route path="/" element={<RootRedirect isAuthenticated={isAuthenticated} />} />

      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        }
      >
        <Route path="/tracker" element={<MonthlyTracker />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/dashboard" element={<Navigate to="/groups" replace />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group/:groupId" element={<GroupDetails />} />
        <Route path="/add-debt" element={<AddDebt />} />
        <Route path="/debt/:userId" element={<DebtDetails />} />
      </Route>

      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}
