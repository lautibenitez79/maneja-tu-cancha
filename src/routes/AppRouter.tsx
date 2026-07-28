import { Routes, Route } from "react-router-dom";

import Home from "./Home";
// import Login from "./Login";
// import Dashboard from "./Dashboard";
import Contacto from "./Contacto";
import QuienesSomos from "./QuienesSomos";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} /> */}
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/quienes-somos" element={<QuienesSomos />} />
    </Routes>
  );
}