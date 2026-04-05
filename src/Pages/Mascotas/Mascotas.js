// Pages/Mascotas/Mascotas.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useClienteId } from "../../utils/useClienteId";

/* ─────────────────────────────────────────────────────────────────
   VISTA CLIENTE: solo animales "En adopcion" + botón Postular
   ───────────────────────────────────────────────────────────────── */
const VistaAdopciones = ({ openModal, closeModal, currentUser, clienteId }) => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnAdopcion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEnAdopcion = async () => {
    try {
      setLoading(true);
      const res = await api.get("/animales", { params: { estado: "En adopcion" } });
      setAnimales(res.data.data || []);
    } catch (error) {
      console.error("Error al cargar animales en adopción:", error);
    } finally {
      setLoading(false);
    }
  };

  /* Formulario de solicitud de adopción */
  const FormularioAdopcion = ({ animal }) => {
    const [formData, setFormData] = useState({
      nombre_solicitante: currentUser?.name || "",
      correo_solicitante: currentUser?.email || "",
      telefono_solicitante: "",
      direccion_solicitante: "",
      experiencia_animales: "",
      motivo: "",
    });
    const [enviando, setEnviando] = useState(false);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setEnviando(true);
        await api.post("/solicitudes-adopcion", {
          animal_id: animal.animal_id,
          ...formData,
          estado_id: 1, // Pendiente
        });
        alert(`✅ Solicitud enviada para adoptar a ${animal.nombre}. Te contactaremos pronto.`);
        closeModal();
      } catch (error) {
        console.error("Error enviando solicitud:", error);
        alert("Error al enviar la solicitud: " + (error.response?.data?.error || error.message));
      } finally {
        setEnviando(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: "520px" }}>
        <div style={{
          background: "linear-gradient(135deg, #f0f4ff, #e8f0fe)",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "2.5rem" }}>🐾</span>
          <div>
            <strong style={{ fontSize: "1.1rem", color: "#333" }}>{animal.nombre}</strong>
            <div style={{ fontSize: "0.85rem", color: "#666" }}>
              {animal.nombre_especie || "Sin especie"} / {animal.nombre_raza || "Sin raza"} · {animal.edad} años · {animal.sexo}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="form-group">
            <label>Nombre completo *</label>
            <input name="nombre_solicitante" value={formData.nombre_solicitante} onChange={handleChange} required placeholder="Tu nombre" />
          </div>
          <div className="form-group">
            <label>Correo electrónico *</label>
            <input type="email" name="correo_solicitante" value={formData.correo_solicitante} onChange={handleChange} required placeholder="tu@correo.com" />
          </div>
          <div className="form-group">
            <label>Teléfono *</label>
            <input name="telefono_solicitante" value={formData.telefono_solicitante} onChange={handleChange} required placeholder="3001234567" />
          </div>
          <div className="form-group">
            <label>Dirección *</label>
            <input name="direccion_solicitante" value={formData.direccion_solicitante} onChange={handleChange} required placeholder="Tu dirección" />
          </div>
        </div>

        <div className="form-group">
          <label>¿Tienes experiencia con animales?</label>
          <select name="experiencia_animales" value={formData.experiencia_animales} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }}>
            <option value="">Seleccionar...</option>
            <option value="Nunca he tenido mascotas">Nunca he tenido mascotas</option>
            <option value="He tenido mascotas antes">He tenido mascotas antes</option>
            <option value="Tengo mascotas actualmente">Tengo mascotas actualmente</option>
            <option value="Trabajo con animales">Trabajo con animales</option>
          </select>
        </div>

        <div className="form-group">
          <label>¿Por qué quieres adoptar a {animal.nombre}? *</label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Cuéntanos por qué quieres adoptarlo y cómo sería su vida contigo..."
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={enviando} style={{ width: "100%", padding: "12px", marginTop: "8px" }}>
          {enviando ? "⏳ Enviando solicitud..." : "❤️ Enviar Solicitud de Adopción"}
        </button>
      </form>
    );
  };

  if (loading) return <div className="section">Cargando animales disponibles para adopción...</div>;

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🐾 Animales en Adopción</h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            {animales.length === 0
              ? "No hay animales disponibles en este momento"
              : `${animales.length} ${animales.length === 1 ? "animal disponible" : "animales disponibles"} para adoptar`}
          </p>
        </div>
      </div>

      {animales.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🐾</div>
          <h3 style={{ color: "#ccc", marginBottom: "8px" }}>No hay animales disponibles</h3>
          <p>No hay animales en adopción en este momento. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {animales.map((animal) => (
            <div key={animal.animal_id} style={{
              background: "white",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(102,126,234,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
            >
              {/* Header de la card */}
              <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", padding: "20px", color: "white", position: "relative" }}>
                <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "8px" }}>
                  {animal.nombre_especie?.toLowerCase().includes("gato") ? "🐱" :
                   animal.nombre_especie?.toLowerCase().includes("perro") ? "🐶" : "🐾"}
                </div>
                <h3 style={{ margin: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: "700" }}>{animal.nombre}</h3>
                <div style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.85, marginTop: "4px" }}>
                  {animal.nombre_especie} · {animal.nombre_raza || "Sin raza"}
                </div>
                <span style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "rgba(255,255,255,0.25)", borderRadius: "20px",
                  padding: "3px 10px", fontSize: "0.75rem", fontWeight: "600"
                }}>
                  ❤️ En adopción
                </span>
              </div>

              {/* Cuerpo */}
              <div style={{ padding: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                  {[
                    { label: "Edad", value: `${animal.edad} ${animal.edad === 1 ? "año" : "años"}` },
                    { label: "Sexo", value: animal.sexo || "N/A" },
                    { label: "Peso", value: animal.peso ? `${animal.peso} kg` : "N/A" },
                    { label: "Chip", value: animal.numero_chip || "Sin chip" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#f8f9ff", borderRadius: "8px", padding: "8px 10px" }}>
                      <div style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#333" }}>{value}</div>
                    </div>
                  ))}
                </div>

                {animal.descripcion && (
                  <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: "1.5", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {animal.descripcion}
                  </p>
                )}

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "12px" }}
                  onClick={() => openModal(
                    `Postular para adoptar a ${animal.nombre}`,
                    <FormularioAdopcion animal={animal} />
                  )}
                >
                  ❤️ Quiero Adoptar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   VISTA ADMIN / PERSONAL: tabla completa de mascotas
   ───────────────────────────────────────────────────────────────── */
const Pets = ({ openModal, closeModal, currentUser }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clienteId, isCliente, resolving } = useClienteId(currentUser);

  useEffect(() => {
    if (resolving) return; // Esperar a que se resuelva el clienteId
    fetchPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolving, clienteId]);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const params = isCliente && clienteId ? { cliente_id: clienteId } : {};
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
  if (resolving) return <div className="section">Cargando perfil...</div>;
  if (loading) return <div className="section">Cargando mascotas...</div>;

  return (
    <div className="section pets-section">
      <div className="section-header">
        <h2 className="section-title">Gestión de Mascotas</h2>
        {!isCliente && (
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
            <th>Acciones</th>
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
                <td>
                  <button className="btn btn-secondary" onClick={() => openModal(`Editar - ${m.nombre}`, <FormularioPaciente paciente={m} />)} style={{ marginRight: "8px" }}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeletePaciente(m.pacienteId)}>
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

/* ─────────────────────────────────────────────────────────────────
   Exportación: decide qué vista renderizar
   ───────────────────────────────────────────────────────────────── */
const MascotasRouter = ({ openModal, closeModal, authToken, currentUser }) => {
  const { clienteId, isCliente, resolving } = useClienteId(currentUser);

  if (resolving) return <div className="section">Cargando perfil...</div>;

  if (isCliente) {
    // Cliente → solo ve animales en adopción
    return <VistaAdopciones openModal={openModal} closeModal={closeModal} currentUser={currentUser} clienteId={clienteId} />;
  }

  // Resto de roles → gestión completa
  return <Pets openModal={openModal} closeModal={closeModal} authToken={authToken} currentUser={currentUser} />;
};

export default MascotasRouter;