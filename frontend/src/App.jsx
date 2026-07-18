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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasStoredSession());

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/tracker" : "/login"} replace />}
      />

      <Route
        element={
          isAuthenticated ? (
            <AppLayout setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <Navigate to="/login" replace />
          )
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

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/tracker" : "/login"} replace />}
      />
    </Routes>
  );
}
