// Pages/Veterinarios/Veterinarios.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const Veterinarios = ({ openModal, closeModal }) => {
  const [data, setData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVeterinarios();
    fetchUsuarios();
  }, []);

  const fetchVeterinarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/veterinarios");
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar veterinarios:", error);
      alert("Error al cargar veterinarios: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas desactivar este veterinario?")) {
      try {
        await api.delete(`/veterinarios/${id}`);
        alert("Veterinario desactivado exitosamente");
        fetchVeterinarios();
      } catch (error) {
        console.error("Error al eliminar veterinario:", error);
        alert("Error al eliminar el veterinario: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const FormularioVeterinario = ({ veterinario = null }) => {
    const [formData, setFormData] = useState({
      usuario_id: veterinario?.usuario_id || "",
      numero_licencia: veterinario?.numero_licencia || "",
      especialidad: veterinario?.especialidad || "",
      fecha_contratacion: veterinario?.fecha_contratacion ? veterinario.fecha_contratacion.split("T")[0] : "",
      horario_inicio: veterinario?.horario_inicio || "",
      horario_fin: veterinario?.horario_fin || "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          usuario_id: parseInt(formData.usuario_id),
          numero_licencia: formData.numero_licencia || null,
          especialidad: formData.especialidad || null,
          fecha_contratacion: formData.fecha_contratacion || null,
          horario_inicio: formData.horario_inicio || null,
          horario_fin: formData.horario_fin || null,
        };

        if (veterinario) {
          await api.put(`/veterinarios/${veterinario.veterinario_id}`, payload);
          alert("Veterinario actualizado exitosamente");
        } else {
          await api.post("/veterinarios", payload);
          alert("Veterinario registrado exitosamente");
        }

        closeModal();
        fetchVeterinarios();
      } catch (error) {
        console.error("Error al guardar veterinario:", error);
        alert("Error al guardar veterinario: " + (error.response?.data?.error || error.message));
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div className="form-group">
          <label>Usuario del Sistema *</label>
          <select name="usuario_id" value={formData.usuario_id} onChange={handleChange} required style={{ width: "100%", padding: "8px", fontSize: "14px" }}>
            <option value="">Seleccionar usuario...</option>
            {usuarios.map((u) => (
              <option key={u.usuario_id} value={u.usuario_id}>
                {u.nombre} ({u.correo})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Número de Licencia</label>
          <input type="text" name="numero_licencia" value={formData.numero_licencia} onChange={handleChange} placeholder="Número de licencia profesional" />
        </div>
        <div className="form-group">
          <label>Especialidad</label>
          <input type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} placeholder="Ej: Cirugía, Dermatología..." />
        </div>
        <div className="form-group">
          <label>Fecha de Contratación</label>
          <input type="date" name="fecha_contratacion" value={formData.fecha_contratacion} onChange={handleChange} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label>Horario Inicio</label>
            <input type="time" name="horario_inicio" value={formData.horario_inicio} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Horario Fin</label>
            <input type="time" name="horario_fin" value={formData.horario_fin} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
          {veterinario ? "Actualizar Veterinario" : "Registrar Veterinario"}
        </button>
      </form>
    );
  };

  if (loading) {
    return <div className="section">Cargando veterinarios...</div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Veterinarios</h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            {data.length} {data.length === 1 ? "veterinario activo" : "veterinarios activos"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal("Registrar Nuevo Veterinario", <FormularioVeterinario />)}>
          ➕ Nuevo Veterinario
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Licencia</th>
            <th>Especialidad</th>
            <th>Horario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>No hay veterinarios registrados</td>
            </tr>
          ) : (
            data.map((vet) => (
              <tr key={vet.veterinario_id}>
                <td>{vet.veterinario_id}</td>
                <td><strong>{vet.nombre_completo || "Sin nombre"}</strong></td>
                <td>
                  {vet.correo && <div style={{ fontSize: "0.85rem" }}>📧 {vet.correo}</div>}
                  {vet.telefono && <div style={{ fontSize: "0.85rem" }}>📱 {vet.telefono}</div>}
                </td>
                <td>{vet.numero_licencia || "-"}</td>
                <td>
                  {vet.especialidad ? (
                    <span style={{ padding: "4px 8px", borderRadius: "12px", background: "#e8f4fd", color: "#0c5460", fontSize: "0.85em" }}>
                      {vet.especialidad}
                    </span>
                  ) : "-"}
                </td>
                <td style={{ fontSize: "0.85rem" }}>
                  {vet.horario_inicio && vet.horario_fin
                    ? `${vet.horario_inicio} - ${vet.horario_fin}`
                    : "-"}
                </td>
                <td className="actions-cell">
                  <button className="btn btn-secondary" onClick={() => openModal(`Editar Veterinario - ${vet.nombre_completo}`, <FormularioVeterinario veterinario={vet} />)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(vet.veterinario_id)}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Veterinarios;
