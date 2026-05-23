
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetails from "./pages/GroupDetails";
import AppLayout from "./layout/AppLayout";
import AddDebt from "./pages/AddDebt";
import DebtDetails from "./pages/DebtDetails";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />

      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to="/login" />} />

      {/* PROTECTED ROUTES */}
      <Route
        element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group/:groupId" element={<GroupDetails />} />
        <Route path="/add-debt" element={<AddDebt />} />
        <Route path="/debt/:userId" element={<DebtDetails />} />
      </Route>
    </Routes>
  );
}
