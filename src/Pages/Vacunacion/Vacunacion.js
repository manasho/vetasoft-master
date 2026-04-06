// Pages/Vacunacion/Vacunacion.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useRoleConfig, buildParams } from "../../utils/useRoleConfig";

const Vacunacion = ({ openModal, closeModal, currentUser }) => {
  const [historial, setHistorial] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAnimal, setFiltroAnimal] = useState("");
  const rc = useRoleConfig(currentUser);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rc.filtros.clienteId, rc.filtros.veterinarioId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Si es cliente, filtrar sus animales
     const animalesParams = buildParams(rc, "animales");
      const historialParams = buildParams(rc, "historial-vacunacion");
      const [histRes, animalesRes, vacunasRes, vetsRes] = await Promise.all([
        api.get("/historial-vacunacion", { params: historialParams }),
        api.get("/animales", { params: animalesParams }),
        api.get("/vacunas"),
        api.get("/veterinarios"),
      ]);
      setHistorial(histRes.data.data || []);
      setAnimales(animalesRes.data.data || []);
      setVacunas(vacunasRes.data.data || []);
      setVeterinarios(vetsRes.data.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorialByAnimal = async (animalId) => {
    setFiltroAnimal(animalId);
    try {
      setLoading(true);
      
      // 1. Construimos los parámetros de seguridad base
      const params = buildParams(rc, "historial-vacunacion");
      
      // 2. Si el usuario seleccionó un animal específico, se lo sumamos a los parámetros
      if (animalId) {
        params.animal_id = animalId;
      }
      // 3. Hacemos la petición blindada
      const res = await api.get("/historial-vacunacion", { params });
      
      setHistorial(res.data.data || []);
    } catch (error) {
      console.error("Error al filtrar:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  };



  const FormularioVacunacion = () => {
    const [formData, setFormData] = useState({
      animal_id: "",
      vacuna_id: "",
      veterinario_id: "",
      fecha_vacunacion: new Date().toISOString().split("T")[0],
      lote_vacuna: "",
      proxima_vacuna: "",
      observaciones: "",
    });
    const [vacunasFiltradas, setVacunasFiltradas] = useState(vacunas);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Cuando cambia el animal, filtrar vacunas por especie
      if (name === "animal_id" && value) {
        const animal = animales.find((a) => a.animal_id === parseInt(value));
        if (animal && animal.especie_id) {
          setVacunasFiltradas(vacunas.filter((v) => v.especie_id === animal.especie_id));
        } else {
          setVacunasFiltradas(vacunas);
        }
        // Reset vacuna selection
        setFormData((prev) => ({ ...prev, animal_id: value, vacuna_id: "" }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          animal_id: parseInt(formData.animal_id),
          vacuna_id: parseInt(formData.vacuna_id),
          veterinario_id: parseInt(formData.veterinario_id),
          fecha_vacunacion: formData.fecha_vacunacion,
          lote_vacuna: formData.lote_vacuna || null,
          proxima_vacuna: formData.proxima_vacuna || null,
          observaciones: formData.observaciones || null,
        };

        await api.post("/historial-vacunacion", payload);
        alert("Vacunación registrada exitosamente");
        closeModal();
        fetchHistorialByAnimal(filtroAnimal);
      } catch (error) {
        console.error("Error al registrar vacunación:", error);
        alert("Error: " + (error.response?.data?.error || error.message));
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div className="form-group">
          <label>Animal *</label>
          <select name="animal_id" value={formData.animal_id} onChange={handleChange} required style={{ width: "100%", padding: "8px", fontSize: "14px" }}>
            <option value="">Seleccionar animal...</option>
            {animales.map((a) => (
              <option key={a.animal_id} value={a.animal_id}>
                {a.nombre} (ID: {a.animal_id})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Vacuna *</label>
          <select name="vacuna_id" value={formData.vacuna_id} onChange={handleChange} required style={{ width: "100%", padding: "8px", fontSize: "14px" }}>
            <option value="">Seleccionar vacuna...</option>
            {vacunasFiltradas.map((v) => (
              <option key={v.vacuna_id} value={v.vacuna_id}>
                {v.nombre} ({v.nombre_especie || "General"})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Veterinario *</label>
          <select name="veterinario_id" value={formData.veterinario_id} onChange={handleChange} required style={{ width: "100%", padding: "8px", fontSize: "14px" }}>
            <option value="">Seleccionar veterinario...</option>
            {veterinarios.map((v) => (
              <option key={v.veterinario_id} value={v.veterinario_id}>
                {v.nombre_completo || `Vet #${v.veterinario_id}`}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label>Fecha Vacunación *</label>
            <input type="date" name="fecha_vacunacion" value={formData.fecha_vacunacion} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Próxima Vacuna</label>
            <input type="date" name="proxima_vacuna" value={formData.proxima_vacuna} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Lote de Vacuna</label>
          <input type="text" name="lote_vacuna" value={formData.lote_vacuna} onChange={handleChange} placeholder="Número de lote" />
        </div>
        <div className="form-group">
          <label>Observaciones</label>
          <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Notas adicionales..." rows="3" style={{ width: "100%", padding: "8px", fontSize: "14px" }} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
          Registrar Vacunación
        </button>
      </form>
    );
  };

  if (loading) return <div className="section">Cargando historial de vacunación...</div>;

  // Agrupar historial por animal para mostrar resumen
  const animalesConVacunas = {};
  historial.forEach((h) => {
    if (!animalesConVacunas[h.animal_id]) {
      animalesConVacunas[h.animal_id] = {
        animal_nombre: h.animal_nombre,
        animal_id: h.animal_id,
        vacunas: [],
      };
    }
    animalesConVacunas[h.animal_id].vacunas.push(h);
  });

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
  {rc.isCliente ? 'Carnet de Vacunación' : 'Panel de Vacunación'}
</h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            {historial.length} {historial.length === 1 ? "registro" : "registros"}
            {filtroAnimal && " (filtrado)"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={filtroAnimal}
            onChange={(e) => fetchHistorialByAnimal(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
          >
            
            <option value="">Todos los animales</option>
            {animales.map((a) => (
              <option key={a.animal_id} value={a.animal_id}>
                {a.nombre} (ID: {a.animal_id})
              </option>
            ))}
          </select>
         {rc.canEdit && (
  <button className="btn btn-primary" onClick={() => openModal("Registrar Vacunación", <FormularioVacunacion />)}>
    ➕ Registrar Vacuna
  </button>
)}
        </div>
      </div>

      {/* Vista por animal cuando se filtra */}
      {filtroAnimal && Object.keys(animalesConVacunas).length > 0 && (
        <div style={{ marginBottom: "20px", padding: "16px", background: "#f8f9fa", borderRadius: "12px", borderLeft: "4px solid #667eea" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>
            🐾 {Object.values(animalesConVacunas)[0]?.animal_nombre || "Animal"}
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
            Total de vacunaciones: <strong>{historial.length}</strong>
          </p>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Animal</th>
            <th>Vacuna</th>
            <th>Veterinario</th>
            <th>Fecha</th>
            <th>Lote</th>
            <th>Próxima</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {historial.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                {filtroAnimal ? "Este animal no tiene vacunaciones registradas" : "No hay registros de vacunación"}
              </td>
            </tr>
          ) : (
            historial.map((h) => {
              const proximaVencida = h.proxima_vacuna && new Date(h.proxima_vacuna) < new Date();
              return (
                <tr key={h.vacunacion_id}>
                  <td>{h.vacunacion_id}</td>
                  <td><strong>{h.animal_nombre || `Animal #${h.animal_id}`}</strong></td>
                  <td>
                    <span style={{ padding: "4px 8px", borderRadius: "12px", background: "#e8f5e9", color: "#2e7d32", fontSize: "0.85em" }}>
                      💉 {h.vacuna_nombre || `Vacuna #${h.vacuna_id}`}
                    </span>
                  </td>
                  <td>{h.veterinario_nombre || "-"}</td>
                  <td style={{ fontSize: "0.85rem" }}>{formatDate(h.fecha_vacunacion)}</td>
                  <td style={{ fontSize: "0.85rem" }}>{h.lote_vacuna || "-"}</td>
                  <td>
                    {h.proxima_vacuna ? (
                      <span style={{ fontSize: "0.85rem", color: proximaVencida ? "#dc3545" : "#28a745", fontWeight: proximaVencida ? "600" : "normal" }}>
                        {proximaVencida ? "⚠️ " : ""}{formatDate(h.proxima_vacuna)}
                      </span>
                    ) : "-"}
                  </td>
                  <td style={{ fontSize: "0.85rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.observaciones || "-"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Vacunacion;
