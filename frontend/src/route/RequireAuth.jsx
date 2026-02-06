// src/routes/RequireAuth.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const location = useLocation();

  // change this key to whatever you store
  const token = localStorage.getItem("token");

  if (!token) {
    // send user to login + remember where they tried to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
