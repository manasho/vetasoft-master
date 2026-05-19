// Pages/Reportes/ReporteDonaciones.js
import React, { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api/axios";

const ReporteDonaciones = ({ currentUser }) => {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de fecha
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const hoyStr = hoy.toISOString().split("T")[0];

  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(hoyStr);

  // ── Carga de datos ──────────────────────────────────────────────
  const fetchDonaciones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/donaciones");
      const raw = response.data.data || [];

      const transformed = raw.map((d) => ({
        id: d.donacion_id,
        donante: d.anonimo ? "Anónimo" : d.nombre_donante || "—",
        correo: d.correo_donante || "—",
        telefono: d.telefono_donante || "—",
        monto: parseFloat(d.monto || 0),
        campana: d.campanas?.nombre || "Sin campaña",
        metodoPago: d.metodo_pago || "—",
        numeroTransaccion: d.numero_transaccion || "—",
        observaciones: d.observaciones || "",
        anonimo: !!d.anonimo,
        fecha: d.fecha_donacion ? d.fecha_donacion.split("T")[0] : "",
      }));

      setDonaciones(transformed);
    } catch (err) {
      console.error("Error al cargar donaciones:", err);
      alert("Error al cargar los datos: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonaciones();
  }, [fetchDonaciones]);

  // ── Filtrado por rango de fechas ─────────────────────────────────
  const donacionesFiltradas = donaciones.filter((d) => {
    if (!d.fecha) return true;
    return d.fecha >= fechaDesde && d.fecha <= fechaHasta;
  });

  // ── KPIs ─────────────────────────────────────────────────────────
  const totalMonto = donacionesFiltradas.reduce((s, d) => s + d.monto, 0);
  const totalCount = donacionesFiltradas.length;
  const promedio = totalCount > 0 ? totalMonto / totalCount : 0;
  const anonimas = donacionesFiltradas.filter((d) => d.anonimo).length;

  // ── Desglose por campaña ──────────────────────────────────────────
  const porCampana = donacionesFiltradas.reduce((acc, d) => {
    acc[d.campana] = (acc[d.campana] || 0) + d.monto;
    return acc;
  }, {});
  const campanaEntries = Object.entries(porCampana).sort((a, b) => b[1] - a[1]);
  const maxCampana = campanaEntries[0]?.[1] || 1;

  // ── Desglose por método de pago ────────────────────────────────────
  const porMetodo = donacionesFiltradas.reduce((acc, d) => {
    const key = d.metodoPago === "—" ? "No especificado" : d.metodoPago;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const metodoEntries = Object.entries(porMetodo).sort((a, b) => b[1] - a[1]);
  const maxMetodo = metodoEntries[0]?.[1] || 1;

  // ── Helpers ───────────────────────────────────────────────────────
  const formatCOP = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(n);

  const formatFecha = (str) => {
    if (!str) return "—";
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  };

  const periodoLabel = () => {
    if (fechaDesde === fechaHasta) return formatFecha(fechaDesde);
    return `${formatFecha(fechaDesde)} – ${formatFecha(fechaHasta)}`;
  };

  // ── Generar PDF ────────────────────────────────────────────────────
  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Encabezado degradado simulado con rectángulo
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageW, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("🐾  VetSoft – Sistema de Gestión Veterinaria", 14, 14);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("REPORTE DE DONACIONES", 14, 22);
    doc.text(`Período: ${periodoLabel()}`, 14, 29);
    doc.text(`Generado por: ${currentUser?.name || "Usuario"}`, 14, 36);

    const fechaGen = new Date().toLocaleString("es-CO");
    doc.text(`Generado el: ${fechaGen}`, pageW - 14, 29, { align: "right" });

    // KPIs en texto
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN EJECUTIVO", 14, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total recaudado: ${formatCOP(totalMonto)}`, 14, 55);
    doc.text(`N° donaciones: ${totalCount}`, 80, 55);
    doc.text(`Promedio: ${formatCOP(promedio)}`, 150, 55);
    doc.text(`Anónimas: ${anonimas}`, 220, 55);

    // Tabla principal
    autoTable(doc, {
      startY: 62,
      head: [
        ["ID", "Donante", "Correo", "Monto", "Campaña", "Método Pago", "N° Transacción", "Fecha"],
      ],
      body: donacionesFiltradas.map((d) => [
        d.id,
        d.donante,
        d.correo,
        formatCOP(d.monto),
        d.campana,
        d.metodoPago,
        d.numeroTransaccion,
        formatFecha(d.fecha),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: {
        0: { cellWidth: 12 },
        3: { halign: "right", fontStyle: "bold", textColor: [56, 161, 105] },
        7: { cellWidth: 22 },
      },
    });

    // Desglose por campaña
    if (campanaEntries.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("DESGLOSE POR CAMPAÑA", 14, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["Campaña", "Monto Recaudado"]],
        body: campanaEntries.map(([nombre, monto]) => [nombre, formatCOP(monto)]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [118, 75, 162], textColor: 255, fontStyle: "bold" },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        tableWidth: 120,
      });
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `VetSoft – Reporte de Donaciones | Página ${i} de ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    const nombreArchivo = `reporte-donaciones-${fechaDesde}-${fechaHasta}.pdf`;
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
        <h2>📊 Reporte de Donaciones</h2>
        <div className="toolbar-actions">
          <button className="btn-reload" onClick={fetchDonaciones}>
            🔄 Actualizar
          </button>
          <button className="btn-pdf" onClick={generarPDF}>
            📄 Descargar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="reportes-filters">
        <label>
          📅 Desde:
          <input
            type="date"
            value={fechaDesde}
            max={fechaHasta}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </label>
        <label>
          📅 Hasta:
          <input
            type="date"
            value={fechaHasta}
            min={fechaDesde}
            max={hoyStr}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </label>
        <span style={{ fontSize: "0.85rem", color: "#718096" }}>
          Mostrando <strong>{donacionesFiltradas.length}</strong> de {donaciones.length} donaciones
        </span>
      </div>

      {/* Encabezado institucional */}
      <div className="reporte-header">
        <div className="reporte-header-left">
          <span className="reporte-logo">🐾</span>
          <div>
            <h1>VetSoft – Sistema de Gestión Veterinaria</h1>
            <p>📋 Reporte de Donaciones</p>
            <p>📆 Período: {periodoLabel()}</p>
          </div>
        </div>
        <div className="reporte-header-right">
          <div>👤 Generado por: <strong>{currentUser?.name || "Administrador"}</strong></div>
          <div>🕐 Fecha: {new Date().toLocaleString("es-CO")}</div>
          <div>🏷️ Rol: {currentUser?.role || "Admin Fundación"}</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ "--kpi-color": "#38a169", "--kpi-icon": '"💰"' }}>
          <div className="kpi-label">Total Recaudado</div>
          <div className="kpi-value">{formatCOP(totalMonto)}</div>
          <div className="kpi-sub">en el período seleccionado</div>
        </div>
        <div className="kpi-card" style={{ "--kpi-color": "#667eea", "--kpi-icon": '"📦"' }}>
          <div className="kpi-label">N° Donaciones</div>
          <div className="kpi-value">{totalCount}</div>
          <div className="kpi-sub">registros encontrados</div>
        </div>
        <div className="kpi-card" style={{ "--kpi-color": "#ed8936", "--kpi-icon": '"📊"' }}>
          <div className="kpi-label">Promedio por Donación</div>
          <div className="kpi-value">{formatCOP(promedio)}</div>
          <div className="kpi-sub">por transacción</div>
        </div>
        <div className="kpi-card" style={{ "--kpi-color": "#9f7aea", "--kpi-icon": '"🕵️"' }}>
          <div className="kpi-label">Donaciones Anónimas</div>
          <div className="kpi-value">{anonimas}</div>
          <div className="kpi-sub">
            {totalCount > 0 ? Math.round((anonimas / totalCount) * 100) : 0}% del total
          </div>
        </div>
      </div>

      {/* Desglose */}
      <div className="desglose-grid">
        {/* Por campaña */}
        <div className="desglose-card">
          <h4>🎯 Recaudación por Campaña</h4>
          {campanaEntries.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.85rem" }}>Sin datos</p>
          ) : (
            campanaEntries.map(([nombre, monto]) => (
              <div key={nombre} className="desglose-item">
                <span className="desglose-nombre">{nombre}</span>
                <div className="desglose-barra">
                  <div
                    className="desglose-barra-fill"
                    style={{ width: `${(monto / maxCampana) * 100}%` }}
                  />
                </div>
                <span className="desglose-valor">{formatCOP(monto)}</span>
              </div>
            ))
          )}
        </div>

        {/* Por método de pago */}
        <div className="desglose-card">
          <h4>💳 Métodos de Pago</h4>
          {metodoEntries.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.85rem" }}>Sin datos</p>
          ) : (
            metodoEntries.map(([metodo, count]) => (
              <div key={metodo} className="desglose-item">
                <span className="desglose-nombre">{metodo}</span>
                <div className="desglose-barra">
                  <div
                    className="desglose-barra-fill"
                    style={{
                      width: `${(count / maxMetodo) * 100}%`,
                      background: "linear-gradient(90deg, #ed8936, #dd6b20)",
                    }}
                  />
                </div>
                <span className="desglose-valor">{count} don.</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tabla de detalle */}
      <div className="reporte-tabla-wrapper">
        <div className="reporte-tabla-header">
          <h3>📋 Detalle de Donaciones</h3>
          <span className="reporte-tabla-count">{donacionesFiltradas.length} registros</span>
        </div>

        {donacionesFiltradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#a0aec0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
            <p>No hay donaciones en el período seleccionado</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="reporte-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donante</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Monto</th>
                  <th>Campaña</th>
                  <th>Método Pago</th>
                  <th>N° Transacción</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {donacionesFiltradas.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#667eea" }}>#{d.id}</span>
                    </td>
                    <td>
                      <strong>{d.donante}</strong>
                      {d.anonimo && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: "0.7rem",
                            background: "#e2e8f0",
                            color: "#4a5568",
                            padding: "2px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          Anónimo
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{d.correo}</td>
                    <td style={{ fontSize: "0.8rem" }}>{d.telefono}</td>
                    <td className="td-monto">{formatCOP(d.monto)}</td>
                    <td>{d.campana}</td>
                    <td>{d.metodoPago}</td>
                    <td style={{ fontSize: "0.8rem" }}>{d.numeroTransaccion}</td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {formatFecha(d.fecha)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8f9ff", fontWeight: 700 }}>
                  <td colSpan={4} style={{ padding: "12px 14px", color: "#4a5568" }}>
                    TOTALES
                  </td>
                  <td className="td-monto" style={{ padding: "12px 14px" }}>
                    {formatCOP(totalMonto)}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
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

export default ReporteDonaciones;
