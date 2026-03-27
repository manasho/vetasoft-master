// Pages/Mascotas/Mascotas.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const Pets = ({ openModal, closeModal }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacientes();
  }, []);

  // =========================
  // OBTENER MASCOTAS
  // =========================
  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/animales");

      if (!res.data.success) throw new Error("Error al obtener animales");

      // Debug: ver qué datos llegan del backend
      console.log("📊 Datos recibidos del backend:", res.data.data);
      
      const transformedData = res.data.data.map((a) => {
        // Debug individual
        console.log("🐾 Animal:", {
          id: a.animal_id || a.id,
          nombre: a.nombre,
          cliente_id: a.cliente_id,
          cliente_nombre: a.cliente_nombre,
          raza_id: a.raza_id,
          nombre_raza: a.nombre_raza,
          especie_id: a.especie_id,
          nombre_especie: a.nombre_especie,
          todos_los_campos: Object.keys(a)
        });
        
        return {
          pacienteId: a.animal_id || a.id,
          nombre: a.nombre,
          clienteId: a.cliente_id,
          clienteNombre: a.cliente_nombre || "Sin propietario",
          clienteTelefono: a.cliente_telefono || "N/A",
          razaId: a.raza_id,
          razaNombre: a.nombre_raza || "Sin raza",
          especieNombre: a.nombre_especie || "Sin especie",
          especieId: a.especie_id, // Necesario para el formulario de edición
          edad: a.edad,
          fechaNacimiento: a.fecha_nacimiento,
          peso: a.peso,
          sexo: a.sexo,
          descripcion: a.descripcion,
          numeroChip: a.numero_chip,
          estado: a.estado,
          fechaIngreso: a.fecha_ingreso || a.created_at,
        };
      });

      setData(transformedData);
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      alert("Error al cargar las mascotas");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ELIMINAR MASCOTA
  // =========================
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

  // =========================
  // FORMULARIO
  // =========================
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
    const [razas, setRazas] = useState([]);
    const [razasFiltradas, setRazasFiltradas] = useState([]);
    const [loadingForm, setLoadingForm] = useState(false);

    // Cargar datos para los selectores
    useEffect(() => {
      fetchClientes();
      fetchEspecies();
      
      // Si hay paciente, obtener su especie desde la raza
      if (paciente?.razaId && !paciente?.especieId) {
        fetchEspecieFromRaza(paciente.razaId);
      } else if (paciente?.especieId) {
        fetchRazas(paciente.especieId);
      }
    }, []);

    const fetchEspecieFromRaza = async (razaId) => {
      try {
        const res = await api.get(`/razas/${razaId}`);
        if (res.data.data?.especie_id) {
          setFormData(prev => ({ ...prev, especieId: res.data.data.especie_id }));
          fetchRazas(res.data.data.especie_id);
        }
      } catch (error) {
        console.error("Error obteniendo especie desde raza:", error);
      }
    };

    // Actualizar razas cuando cambia la especie
    useEffect(() => {
      if (formData.especieId) {
        fetchRazas(formData.especieId);
        // Limpiar raza seleccionada si cambia la especie
        setFormData(prev => ({ ...prev, razaId: "" }));
      } else {
        setRazasFiltradas([]);
      }
    }, [formData.especieId]);

    const fetchClientes = async () => {
      try {
        const res = await api.get("/clientes");
        setClientes(res.data.data || []);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };

    const fetchEspecies = async () => {
      try {
        const res = await api.get("/especies");
        setEspecies(res.data.data || []);
      } catch (error) {
        console.error("Error cargando especies:", error);
      }
    };

    const fetchRazas = async (especieId) => {
      try {
        const res = await api.get(`/razas?especie_id=${especieId}`);
        setRazasFiltradas(res.data.data || []);
      } catch (error) {
        console.error("Error cargando razas:", error);
        setRazasFiltradas([]);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.clienteId || !formData.razaId) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

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
        console.error("Error guardando mascota:", error);
        alert("❌ Error al guardar la mascota: " + (error.response?.data?.error || error.message));
      } finally {
        setLoadingForm(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Información Básica */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
            Información Básica
          </h3>
          
          <div className="form-group">
            <label>Nombre de la Mascota *</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Max, Luna, Toby"
              style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group">
            <label>Cliente/Propietario *</label>
            <select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.cliente_id || c.id} value={c.cliente_id || c.id}>
                  {c.nombre} {c.telefono ? `- Tel: ${c.telefono}` : ''}
                </option>
              ))}
            </select>
            {clientes.length === 0 && (
              <small style={{ color: '#666', fontSize: '12px' }}>
                No hay clientes registrados. Regístralos primero.
              </small>
            )}
          </div>
        </div>

        {/* Especie y Raza */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
            Especie y Raza
          </h3>

          <div className="form-group">
            <label>Especie *</label>
            <select
              name="especieId"
              value={formData.especieId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">Seleccionar especie...</option>
              {especies.map((e) => (
                <option key={e.especie_id || e.id} value={e.especie_id || e.id}>
                  {e.nombre_especie || e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Raza *</label>
            <select
              name="razaId"
              value={formData.razaId}
              onChange={handleChange}
              required
              disabled={!formData.especieId || razasFiltradas.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                opacity: !formData.especieId ? 0.6 : 1
              }}
            >
              <option value="">
                {!formData.especieId
                  ? 'Primero selecciona una especie'
                  : razasFiltradas.length === 0
                  ? 'No hay razas disponibles'
                  : 'Seleccionar raza...'}
              </option>
              {razasFiltradas.map((r) => (
                <option key={r.raza_id || r.id} value={r.raza_id || r.id}>
                  {r.nombre_raza || r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Características Físicas */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
            Características Físicas
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Edad (años) *</label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                required
                min="0"
                max="150"
                placeholder="Ej: 3"
                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group">
              <label>Peso (kg) *</label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                required
                min="0.1"
                step="0.1"
                placeholder="Ej: 15.5"
                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Sexo *</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">Seleccionar...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado *</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="Activo">Activo</option>
                <option value="En adopcion">En adopción</option>
                <option value="Adoptado">Adoptado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Opcional. Si no se especifica, se calculará según la edad.
            </small>
          </div>

          <div className="form-group">
            <label>Número de Chip</label>
            <input
              type="text"
              name="numeroChip"
              value={formData.numeroChip}
              onChange={handleChange}
              placeholder="Ej: CHIP123456789"
              style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Opcional. Identificador único del chip de identificación.
            </small>
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
            Información Adicional
          </h3>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe las características físicas, comportamiento, historial médico relevante, etc."
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
            style={{ padding: '10px 20px' }}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loadingForm}
            style={{ padding: '10px 20px', opacity: loadingForm ? 0.6 : 1 }}
          >
            {loadingForm ? '⏳ Guardando...' : paciente ? '💾 Actualizar Mascota' : '✅ Registrar Mascota'}
          </button>
        </div>
      </form>
    );
  };

  if (loading) return <div className="section">Cargando mascotas...</div>;

  return (
    <div className="section pets-section">
      <div className="section-header">
        <h2 className="section-title">Gestión de Mascotas</h2>
        <button
          className="btn btn-primary"
          onClick={() => openModal("Registrar Nueva Mascota", <FormularioPaciente />)}
        >
          ➕ Registrar Mascota
        </button>
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>No hay mascotas registradas</td>
            </tr>
          ) : (
            data.map((m) => (
              <tr key={m.pacienteId}>
                <td>{m.pacienteId}</td>
                <td><strong>{m.nombre}</strong></td>
                <td>
                  {m.especieNombre !== "Sin especie" ? (
                    <>
                      <strong>{m.especieNombre}</strong>
                      {m.razaNombre !== "Sin raza" && ` / ${m.razaNombre}`}
                    </>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Sin clasificar</span>
                  )}
                </td>
                <td>
                  {m.clienteNombre !== "Sin propietario" ? (
                    <strong>{m.clienteNombre}</strong>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Sin propietario</span>
                  )}
                </td>
                <td>{m.edad} años, {m.sexo}</td>
                <td>{m.peso} kg</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    backgroundColor: m.estado === 'Activo' ? '#d4edda' : 
                                    m.estado === 'En adopcion' ? '#fff3cd' : 
                                    m.estado === 'Adoptado' ? '#d1ecf1' : '#f8d7da',
                    color: m.estado === 'Activo' ? '#155724' : 
                           m.estado === 'En adopcion' ? '#856404' : 
                           m.estado === 'Adoptado' ? '#0c5460' : '#721c24'
                  }}>
                    {m.estado}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => openModal(`Editar - ${m.nombre}`, <FormularioPaciente paciente={m} />)}
                    style={{ marginRight: '8px' }}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeletePaciente(m.pacienteId)}
                  >
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

export default Pets;