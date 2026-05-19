// Pages/Reportes/ReporteCitas.js
import React, { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api/axios";

const ReporteCitas = ({ currentUser }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mes actual como valor por defecto (formato YYYY-MM)
  const hoy = new Date();
  const mesActualStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActualStr);

  // ── Carga de datos ──────────────────────────────────────────────
  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/citas");
      const raw = response.data.data || [];

      const transformed = raw.map((c) => ({
        id: c.cita_id || c.id,
        paciente: c.animal_nombre || "—",
        raza: c.nombre_raza || "—",
        veterinario: c.veterinario_nombre || "—",
        especialidad: c.especialidad || "—",
        tipoConsulta: c.tipo_consulta_nombre || "—",
        estado: c.estado_nombre || "—",
        motivo: c.motivo || "—",
        observaciones: c.observaciones || "",
        fecha: c.fecha_cita ? c.fecha_cita.split("T")[0] : "",
        hora: c.fecha_cita
          ? new Date(c.fecha_cita).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        creadoPor: c.usuario_creador?.nombre || "—",
        fechaCreacion: c.fecha_creacion || c.created_at || "",
      }));

      setCitas(transformed);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      alert("Error al cargar los datos: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  // ── Filtrado por mes ─────────────────────────────────────────────
  const citasFiltradas = citas.filter((c) => {
    if (!c.fecha) return false;
    return c.fecha.startsWith(mesSeleccionado);
  });

  // ── KPIs ─────────────────────────────────────────────────────────
  const totalCitas = citasFiltradas.length;
  const completadas = citasFiltradas.filter(
    (c) => c.estado?.toLowerCase() === "completada"
  ).length;
  const pendientes = citasFiltradas.filter(
    (c) => c.estado?.toLowerCase() === "pendiente"
  ).length;
  const canceladas = citasFiltradas.filter(
    (c) => c.estado?.toLowerCase() === "cancelada"
  ).length;

  // ── Desglose por tipo de consulta ─────────────────────────────────
  const porTipo = citasFiltradas.reduce((acc, c) => {
    acc[c.tipoConsulta] = (acc[c.tipoConsulta] || 0) + 1;
    return acc;
  }, {});
  const tipoEntries = Object.entries(porTipo).sort((a, b) => b[1] - a[1]);
  const maxTipo = tipoEntries[0]?.[1] || 1;

  // ── Desglose por veterinario ──────────────────────────────────────
  const porVet = citasFiltradas.reduce((acc, c) => {
    acc[c.veterinario] = (acc[c.veterinario] || 0) + 1;
    return acc;
  }, {});
  const vetEntries = Object.entries(porVet).sort((a, b) => b[1] - a[1]);
  const maxVet = vetEntries[0]?.[1] || 1;

  // ── Helpers ───────────────────────────────────────────────────────
  const formatFecha = (str) => {
    if (!str) return "—";
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  };

  const mesLabel = () => {
    const [y, m] = mesSeleccionado.split("-");
    return new Date(y, parseInt(m) - 1).toLocaleString("es-CO", {
      month: "long",
      year: "numeric",
    });
  };

  const getBadgeClass = (estado) => {
    const e = estado?.toLowerCase() || "";
    if (e === "completada") return "badge badge-completada";
    if (e === "pendiente") return "badge badge-pendiente";
    if (e === "cancelada") return "badge badge-cancelada";
    if (e === "confirmada") return "badge badge-confirmada";
    if (e === "en proceso") return "badge badge-en-proceso";
    return "badge badge-default";
  };

  // ── Generar PDF ────────────────────────────────────────────────────
  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageW, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("🐾  VetSoft – Sistema de Gestión Veterinaria", 14, 14);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("REPORTE DE CITAS MÉDICAS", 14, 22);
    doc.text(`Período: ${mesLabel()}`, 14, 29);
    doc.text(`Generado por: ${currentUser?.name || "Administrador"}`, 14, 36);

    const fechaGen = new Date().toLocaleString("es-CO");
    doc.text(`Generado el: ${fechaGen}`, pageW - 14, 29, { align: "right" });

    // KPIs en texto
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN EJECUTIVO", 14, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total citas: ${totalCitas}`, 14, 55);
    doc.text(`Completadas: ${completadas}`, 70, 55);
    doc.text(`Pendientes: ${pendientes}`, 130, 55);
    doc.text(`Canceladas: ${canceladas}`, 190, 55);

    // Tabla principal
    autoTable(doc, {
      startY: 62,
      head: [
        ["ID", "Fecha", "Hora", "Paciente", "Raza", "Veterinario", "Tipo Consulta", "Estado", "Motivo"],
      ],
      body: citasFiltradas.map((c) => [
        c.id,
        formatFecha(c.fecha),
        c.hora,
        c.paciente,
        c.raza,
        c.veterinario,
        c.tipoConsulta,
        c.estado,
        c.motivo.length > 40 ? c.motivo.substring(0, 40) + "..." : c.motivo,
      ]),
      styles: { fontSize: 7.5, cellPadding: 3 },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 22 },
        2: { cellWidth: 16 },
      },
    });

    // Desglose por veterinario
    if (vetEntries.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("CITAS POR VETERINARIO", 14, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["Veterinario", "N° Citas"]],
        body: vetEntries.map(([vet, count]) => [vet, count]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [118, 75, 162], textColor: 255, fontStyle: "bold" },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        tableWidth: 100,
      });
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `VetSoft – Reporte de Citas | Página ${i} de ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    const nombreArchivo = `reporte-citas-${mesSeleccionado}.pdf`;
    doc.save(nombreArchivo);
  };

  // ── Renderizado ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="reporte-loading">
        <div className="spinner-reporte"></div>
        <p>Cargando datos del reporte...</p>
      </div>
    );
  }

  return (
    <>
      {/* Barra de herramientas */}
      <div className="reportes-toolbar">
        <h2>📅 Reporte de Citas Médicas</h2>
        <div className="toolbar-actions">
          <button className="btn-reload" onClick={fetchCitas}>
            🔄 Actualizar
          </button>
          <button className="btn-pdf" onClick={generarPDF}>
            📄 Descargar PDF
          </button>
        </div>
      </div>

      {/* Filtro de mes */}
      <div className="reportes-filters">
        <label>
          📆 Mes del reporte:
          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          />
        </label>
        <span style={{ fontSize: "0.85rem", color: "#718096" }}>
          Mostrando <strong>{citasFiltradas.length}</strong> citas de{" "}
          <strong>{mesLabel()}</strong>
        </span>
      </div>

      {/* Encabezado institucional */}
      <div className="reporte-header">
        <div className="reporte-header-left">
          <span className="reporte-logo">🐾</span>
          <div>
            <h1>VetSoft – Sistema de Gestión Veterinaria</h1>
            <p>📋 Reporte de Citas Médicas</p>
            <p>📆 Período: {mesLabel()}</p>
          </div>
        </div>
        <div className="reporte-header-right">
          <div>👤 Generado por: <strong>{currentUser?.name || "Administrador"}</strong></div>
          <div>🕐 Fecha: {new Date().toLocaleString("es-CO")}</div>
          <div>🏷️ Rol: {currentUser?.role || "Administrador"}</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ "--kpi-color": "#667eea", "--kpi-icon": '"📅"' }}>
          <div className="kpi-label">Total Citas</div>
          <div className="kpi-value">{totalCitas}</div>
          <div className="kpi-sub">en {mesLabel()}</div>
        </div>
        <div className="kpi-card" style={{ "--kpi-color": "#38a169", "--kpi-icon": '"✅"' }}>
          <div className="kpi-label">Completadas</div>
          <div className="kpi-value">{completadas}</div>
          <div className="kpi-sub">
            {totalCitas > 0 ? Math.round((completadas / totalCitas) * 100) : 0}% del total
          </div>
        </div>
        <div className="kpi-card" style={{ "--kpi-color": "#ed8936", "--kpi-icon": '"⏳"' }}>
          <div className="kpi-label">Pendientes</div>
          <div className="kpi-value">{pendientes}</div>
          <div className="kpi-sub">por atender</div>
        </div>
        <div className="kpi-card" style={{ "--kpi-color": "#e53e3e", "--kpi-icon": '"❌"' }}>
          <div className="kpi-label">Canceladas</div>
          <div className="kpi-value">{canceladas}</div>
          <div className="kpi-sub">
            {totalCitas > 0 ? Math.round((canceladas / totalCitas) * 100) : 0}% del total
          </div>
        </div>
      </div>

      {/* Desglose */}
      <div className="desglose-grid">
        {/* Por tipo de consulta */}
        <div className="desglose-card">
          <h4>🩺 Citas por Tipo de Consulta</h4>
          {tipoEntries.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.85rem" }}>Sin datos</p>
          ) : (
            tipoEntries.map(([tipo, count]) => (
              <div key={tipo} className="desglose-item">
                <span className="desglose-nombre">{tipo}</span>
                <div className="desglose-barra">
                  <div
                    className="desglose-barra-fill"
                    style={{ width: `${(count / maxTipo) * 100}%` }}
                  />
                </div>
                <span className="desglose-valor">{count} cita{count !== 1 ? "s" : ""}</span>
              </div>
            ))
          )}
        </div>

        {/* Por veterinario */}
        <div className="desglose-card">
          <h4>👨‍⚕️ Citas por Veterinario</h4>
          {vetEntries.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.85rem" }}>Sin datos</p>
          ) : (
            vetEntries.map(([vet, count]) => (
              <div key={vet} className="desglose-item">
                <span className="desglose-nombre">{vet}</span>
                <div className="desglose-barra">
                  <div
                    className="desglose-barra-fill"
                    style={{
                      width: `${(count / maxVet) * 100}%`,
                      background: "linear-gradient(90deg, #9f7aea, #6b46c1)",
                    }}
                  />
                </div>
                <span className="desglose-valor">{count} cita{count !== 1 ? "s" : ""}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tabla de detalle */}
      <div className="reporte-tabla-wrapper">
        <div className="reporte-tabla-header">
          <h3>📋 Detalle de Citas</h3>
          <span className="reporte-tabla-count">{citasFiltradas.length} registros</span>
        </div>

        {citasFiltradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#a0aec0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
            <p>No hay citas registradas en {mesLabel()}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="reporte-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Raza</th>
                  <th>Veterinario</th>
                  <th>Tipo Consulta</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#667eea" }}>#{c.id}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                      {formatFecha(c.fecha)}
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>{c.hora}</td>
                    <td>
                      <strong>{c.paciente}</strong>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#718096" }}>{c.raza}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.veterinario}</div>
                      {c.especialidad !== "—" && (
                        <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                          {c.especialidad}
                        </div>
                      )}
                    </td>
                    <td>{c.tipoConsulta}</td>
                    <td>
                      <span className={getBadgeClass(c.estado)}>{c.estado}</span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        maxWidth: "160px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={c.motivo}
                    >
                      {c.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pie */}
      <div className="reporte-footer">
        🐾 VetSoft – Sistema de Gestión Veterinaria &nbsp;|&nbsp;
        Reporte generado el {new Date().toLocaleString("es-CO")} &nbsp;|&nbsp;
        Por {currentUser?.name || "Administrador"}
      </div>
    </>
  );
};

export default ReporteCitas;
