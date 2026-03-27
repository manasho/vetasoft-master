// Pages/Campanas/Campanas.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const Campanas = ({ openModal, closeModal, currentUser }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampanas();
  }, []);

  const fetchCampanas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/campanas");
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar campañas:", error);
      alert("Error al cargar las campañas: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas desactivar esta campaña?")) {
      try {
        await api.delete(`/campanas/${id}`);
        alert("Campaña desactivada exitosamente");
        fetchCampanas();
      } catch (error) {
        console.error("Error al eliminar campaña:", error);
        alert("Error: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  };

  const getProgress = (recaudado, meta) => {
    if (!meta || meta === 0) return 0;
    return Math.min(100, Math.round((parseFloat(recaudado || 0) / parseFloat(meta)) * 100));
  };

  const FormularioCampana = ({ campana = null }) => {
    const [formData, setFormData] = useState({
      nombre: campana?.nombre || "",
      descripcion: campana?.descripcion || "",
      meta_monto: campana?.meta_monto || "",
      fecha_inicio: campana?.fecha_inicio ? campana.fecha_inicio.split("T")[0] : "",
      fecha_fin: campana?.fecha_fin ? campana.fecha_fin.split("T")[0] : "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          meta_monto: parseFloat(formData.meta_monto) || null,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          creado_por: currentUser?.id || 1,
        };

        if (campana) {
          await api.put(`/campanas/${campana.campana_id}`, payload);
          alert("Campaña actualizada exitosamente");
        } else {
          await api.post("/campanas", payload);
          alert("Campaña creada exitosamente");
        }

        closeModal();
        fetchCampanas();
      } catch (error) {
        console.error("Error al guardar campaña:", error);
        alert("Error: " + (error.response?.data?.error || error.message));
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div className="form-group">
          <label>Nombre de la Campaña *</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Nombre de la campaña" />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción de la campaña..." rows="3" style={{ width: "100%", padding: "8px", fontSize: "14px" }} />
        </div>
        <div className="form-group">
          <label>Meta de Recaudación (COP)</label>
          <input type="number" name="meta_monto" value={formData.meta_monto} onChange={handleChange} min="0" step="1000" placeholder="1000000" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label>Fecha Inicio *</label>
            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha Fin *</label>
            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
          {campana ? "Actualizar Campaña" : "Crear Campaña"}
        </button>
      </form>
    );
  };

  if (loading) return <div className="section">Cargando campañas...</div>;

  const totalRecaudado = data.reduce((sum, c) => sum + parseFloat(c.monto_recaudado || 0), 0);

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Campañas de Donación</h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            {data.length} {data.length === 1 ? "campaña" : "campañas"} — Total recaudado:{" "}
            <strong style={{ color: "#28a745" }}>{formatCurrency(totalRecaudado)}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal("Crear Nueva Campaña", <FormularioCampana />)}>
          ➕ Nueva Campaña
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
        {data.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", gridColumn: "1 / -1" }}>No hay campañas registradas</p>
        ) : (
          data.map((campana) => {
            const progress = getProgress(campana.monto_recaudado, campana.meta_monto);
            const isActive = campana.activo && new Date(campana.fecha_fin) >= new Date();

            return (
              <div key={campana.campana_id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderLeft: `4px solid ${isActive ? "#28a745" : "#6c757d"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>{campana.nombre}</h3>
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: isActive ? "#d4edda" : "#f8d7da", color: isActive ? "#155724" : "#721c24" }}>
                      {isActive ? "Activa" : "Finalizada"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#999" }}>#{campana.campana_id}</span>
                </div>

                {campana.descripcion && <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 12px" }}>{campana.descripcion}</p>}

                <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "8px" }}>
                  📅 {formatDate(campana.fecha_inicio)} — {formatDate(campana.fecha_fin)}
                </div>

                {campana.meta_monto && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                      <span>{formatCurrency(campana.monto_recaudado)} recaudado</span>
                      <span style={{ fontWeight: "600" }}>{progress}%</span>
                    </div>
                    <div style={{ background: "#e9ecef", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: progress >= 100 ? "#28a745" : "#667eea", borderRadius: "10px", transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "4px" }}>
                      Meta: {formatCurrency(campana.meta_monto)} — {campana.total_donaciones || 0} donaciones
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => openModal(`Editar Campaña - ${campana.nombre}`, <FormularioCampana campana={campana} />)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(campana.campana_id)}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Campanas;
