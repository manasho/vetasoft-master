// Pages/Reportes/Reportes.js
import React from "react";
import "./Reportes.css";
import ReporteDonaciones from "./ReporteDonaciones";
import ReporteCitas from "./ReporteCitas";

/**
 * Módulo de Reportes – VetSoft
 *
 * Enrutador de reportes basado en el rol del usuario:
 *   Rol 1 (Admin Fundación) → Reporte de Donaciones
 *   Rol 2 (Administrador)   → Reporte de Citas del mes
 *   Otros roles             → Mensaje de acceso no disponible
 */
const Reportes = ({ currentUser }) => {
  const roleId = currentUser?.roleId;

  const renderReporte = () => {
    switch (roleId) {
      case 1:
        return <ReporteDonaciones currentUser={currentUser} />;
      case 2:
        return <ReporteCitas currentUser={currentUser} />;
      default:
        return (
          <div className="sin-acceso">
            <span className="sin-acceso-icon">🔒</span>
            <h3>Módulo no disponible</h3>
            <p>
              Tu rol (<strong>{currentUser?.role || "Usuario"}</strong>) no tiene acceso a los reportes.
            </p>
            <p>Contacta a un administrador si crees que esto es un error.</p>
          </div>
        );
    }
  };

  return (
    <div className="reportes-page">
      {renderReporte()}
    </div>
  );
};

export default Reportes;
