// Pages/Mascotas/Mascotas.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

import { useRoleConfig , buildParams} from "../../utils/useRoleConfig";
/* ─────────────────────────────────────────────────────────────────
   VISTA ADMIN / PERSONAL: tabla completa de mascotas
   ───────────────────────────────────────────────────────────────── */
const Pets = ({ openModal, closeModal, currentUser }) => {
  const [data, setData] = useState([]);
    
  const [loading, setLoading] = useState(true);
  const rc = useRoleConfig(currentUser); // ¡Tus gafas!
  // El motor de arranque de la página
  useEffect(() => {
    fetchPacientes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rc.filtros.clienteId]);

  const fetchPacientes = async () => {
    
    try {
      setLoading(true);
      const params = buildParams(rc, "animales");
      const res = await api.get("/animales", { params });
      if (!res.data.success) throw new Error("Error al obtener animales");
      const transformedData = res.data.data.map((a) => ({
        pacienteId: a.animal_id || a.id,
        nombre: a.nombre,
        clienteId: a.cliente_id,
        clienteNombre: a.cliente_nombre || "Sin propietario",
        razaId: a.raza_id,
        razaNombre: a.nombre_raza || "Sin raza",
        especieNombre: a.nombre_especie || "Sin especie",
        especieId: a.especie_id,
        edad: a.edad,
        fechaNacimiento: a.fecha_nacimiento,
        peso: a.peso,
        sexo: a.sexo,
        descripcion: a.descripcion,
        numeroChip: a.numero_chip,
        estado: a.estado,
        fechaIngreso: a.fecha_ingreso || a.created_at,
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      alert("Error al cargar las mascotas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaciente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta mascota?")) return;
    try {
      await api.delete(`/animales/${id}`);
      alert("Mascota eliminada exitosamente");
      fetchPacientes();
    } catch (error) {
      console.error("Error eliminando mascota:", error);
      alert("Error al eliminar la mascota");
    }
  };

  const FormularioPaciente = ({ paciente = null }) => {
    const [formData, setFormData] = useState({
      nombre: paciente?.nombre || "",
      clienteId: paciente?.clienteId || "",
      especieId: paciente?.especieId || "",
      razaId: paciente?.razaId || "",
      edad: paciente?.edad || "",
      fechaNacimiento: paciente?.fechaNacimiento || "",
      peso: paciente?.peso || "",
      sexo: paciente?.sexo || "",
      descripcion: paciente?.descripcion || "",
      numeroChip: paciente?.numeroChip || "",
      estado: paciente?.estado || "Activo",
    });
    const [clientes, setClientes] = useState([]);
    const [especies, setEspecies] = useState([]);
    const [razasFiltradas, setRazasFiltradas] = useState([]);
    const [loadingForm, setLoadingForm] = useState(false);

    useEffect(() => {
      api.get("/clientes").then(r => setClientes(r.data.data || [])).catch(() => {});
      api.get("/especies").then(r => setEspecies(r.data.data || [])).catch(() => {});
      if (paciente?.especieId) fetchRazas(paciente.especieId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
      if (formData.especieId) {
        fetchRazas(formData.especieId);
        setFormData(prev => ({ ...prev, razaId: "" }));
      } else {
        setRazasFiltradas([]);
      }
    }, [formData.especieId]);

    const fetchRazas = async (especieId) => {
      try {
        const res = await api.get(`/razas?especie_id=${especieId}`);
        setRazasFiltradas(res.data.data || []);
      } catch { setRazasFiltradas([]); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.clienteId || !formData.razaId) { alert("Por favor completa todos los campos requeridos"); return; }
      try {
        setLoadingForm(true);
        const payload = {
          nombre: formData.nombre.trim(),
          cliente_id: Number(formData.clienteId),
          raza_id: Number(formData.razaId),
          edad: Number(formData.edad),
          fecha_nacimiento: formData.fechaNacimiento || null,
          peso: parseFloat(formData.peso),
          sexo: formData.sexo,
          descripcion: formData.descripcion.trim(),
          numero_chip: formData.numeroChip?.trim() || null,
          estado: formData.estado,
        };
        if (paciente) {
          await api.put(`/animales/${paciente.pacienteId}`, payload);
          alert("✅ Mascota actualizada exitosamente");
        } else {
          await api.post("/animales", payload);
          alert("✅ Mascota registrada exitosamente");
        }
        closeModal();
        fetchPacientes();
      } catch (error) {
        alert("❌ Error al guardar la mascota: " + (error.response?.data?.error || error.message));
      } finally {
        setLoadingForm(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="form-group">
          <label>Nombre de la Mascota *</label>
          <input name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Max, Luna, Toby" />
        </div>
        <div className="form-group">
          <label>Cliente/Propietario *</label>
          <select name="clienteId" value={formData.clienteId} onChange={handleChange} required>
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => <option key={c.cliente_id} value={c.cliente_id}>{c.nombre} {c.telefono ? `- Tel: ${c.telefono}` : ""}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="form-group">
            <label>Especie *</label>
            <select name="especieId" value={formData.especieId} onChange={handleChange} required>
              <option value="">Seleccionar especie...</option>
              {especies.map((e) => <option key={e.especie_id || e.id} value={e.especie_id || e.id}>{e.nombre_especie || e.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Raza *</label>
            <select name="razaId" value={formData.razaId} onChange={handleChange} required disabled={!formData.especieId}>
              <option value="">{!formData.especieId ? "Primero selecciona especie" : "Seleccionar raza..."}</option>
              {razasFiltradas.map((r) => <option key={r.raza_id || r.id} value={r.raza_id || r.id}>{r.nombre_raza || r.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Edad (años) *</label>
            <input type="number" name="edad" value={formData.edad} onChange={handleChange} required min="0" placeholder="Ej: 3" />
          </div>
          <div className="form-group">
            <label>Peso (kg) *</label>
            <input type="number" name="peso" value={formData.peso} onChange={handleChange} required min="0.1" step="0.1" placeholder="Ej: 15.5" />
          </div>
          <div className="form-group">
            <label>Sexo *</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} required>
              <option value="">Seleccionar...</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estado *</label>
            <select name="estado" value={formData.estado} onChange={handleChange} required>
              <option value="Activo">Activo</option>
              <option value="En adopcion">En adopción</option>
              <option value="Adoptado">Adoptado</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Número de Chip</label>
          <input type="text" name="numeroChip" value={formData.numeroChip} onChange={handleChange} placeholder="Ej: CHIP123456789" />
        </div>
        <div className="form-group">
          <label>Descripción *</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows="4"
            placeholder="Características físicas, comportamiento, etc."
            style={{ width: "100%", padding: "10px", fontSize: "14px", borderRadius: "6px", border: "1px solid #ddd", fontFamily: "inherit", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button className="btn btn-primary" type="submit" disabled={loadingForm}>
            {loadingForm ? "⏳ Guardando..." : paciente ? "💾 Actualizar" : "✅ Registrar"}
          </button>
        </div>
      </form>
    );
  };

  // Mientras resolvemos el clienteId, mostrar loading
  if (loading) return <div className="section">Cargando mascotas...</div>;

  return (
    <div className="section pets-section">
      <div className="section-header">
        <h2 className="section-title">
          {rc.isCliente ? 'Mis Mascotas' : 'Gestión de Mascotas'}
        </h2>
        {rc.canEdit && (
          <button className="btn btn-primary" onClick={() => openModal("Registrar Nueva Mascota", <FormularioPaciente />)}>
            ➕ Registrar Mascota
          </button>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Especie/Raza</th>
            <th>Propietario</th>
            <th>Edad/Sexo</th>
            <th>Peso</th>
            <th>Estado</th>
            {rc.canEdit && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: "center" }}>No hay mascotas registradas</td></tr>
          ) : (
            data.map((m) => (
              <tr key={m.pacienteId}>
                <td>{m.pacienteId}</td>
                <td><strong>{m.nombre}</strong></td>
                <td>
                  {m.especieNombre !== "Sin especie" ? (
                    <><strong>{m.especieNombre}</strong>{m.razaNombre !== "Sin raza" && ` / ${m.razaNombre}`}</>
                  ) : <span style={{ color: "#999", fontStyle: "italic" }}>Sin clasificar</span>}
                </td>
                <td>
                  {m.clienteNombre !== "Sin propietario"
                    ? <strong>{m.clienteNombre}</strong>
                    : <span style={{ color: "#999", fontStyle: "italic" }}>Sin propietario</span>}
                </td>
                <td>{m.edad} años, {m.sexo}</td>
                <td>{m.peso} kg</td>
                <td>
                  <span style={{
                    padding: "4px 8px", borderRadius: "4px", fontSize: "0.85em", fontWeight: "500",
                    backgroundColor: m.estado === "Activo" ? "#d4edda" : m.estado === "En adopcion" ? "#fff3cd" : m.estado === "Adoptado" ? "#d1ecf1" : "#f8d7da",
                    color: m.estado === "Activo" ? "#155724" : m.estado === "En adopcion" ? "#856404" : m.estado === "Adoptado" ? "#0c5460" : "#721c24"
                  }}>
                    {m.estado}
                  </span>
                </td>
                {rc.canEdit && (
                <td>
                  
                  
                  <button className="btn btn-secondary" onClick={() => openModal(`Editar - ${m.nombre}`, <FormularioPaciente paciente={m} />)} style={{ marginRight: "8px" }}>
                    ✏️ Editar
                  </button>
                
                  
                  <button className="btn btn-danger" onClick={() => handleDeletePaciente(m.pacienteId)}>
                    🗑️ Eliminar
                  </button>
            
                </td>
                 )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Exportación: decide qué vista renderizar
   ───────────────────────────────────────────────────────────────── */
const MascotasRouter = ({ openModal, closeModal, authToken, currentUser }) => {
return <Pets openModal={openModal} closeModal={closeModal} authToken={authToken} currentUser={currentUser} />;
};

export default MascotasRouter;