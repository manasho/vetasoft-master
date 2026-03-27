// Pages/Adopciones/Adopciones.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const Adopciones = ({ openModal, closeModal, currentUser }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [animalId, setAnimalId] = useState("");
  const [estadoId, setEstadoId] = useState("");

  /* =========================
     CARGA DE DATOS
  ========================== */

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);

      const params = {};
      if (animalId) params.animal_id = animalId;
      if (estadoId) params.estado_id = estadoId;

      const res = await api.get("/solicitudes-adopcion", { params });
      // Mapear campos del backend al formato esperado por el frontend
      const mappedSolicitudes = (res.data.data || []).map(s => ({
        id: s.solicitud_id || s.id,
        animal_id: s.animal_id,
        animal_nombre: s.animal_nombre || 'N/A',
        animal_edad: s.animal_edad,
        nombre_raza: s.nombre_raza,
        nombre_especie: s.nombre_especie,
        nombre_solicitante: s.nombre_solicitante || s.solicitante_nombre || s.nombre || 'N/A',
        correo_solicitante: s.correo_solicitante,
        telefono_solicitante: s.telefono_solicitante,
        direccion_solicitante: s.direccion_solicitante,
        experiencia_animales: s.experiencia_animales,
        motivo: s.motivo,
        fecha_solicitud: s.fecha_solicitud,
        fecha_respuesta: s.fecha_respuesta,
        observacion_respuesta: s.observacion_respuesta,
        respondido_por_nombre: s.respondido_por_nombre,
        estado_id: s.estado_id,
        estado_nombre: s.estado_nombre || 'N/A'
      }));
      setSolicitudes(mappedSolicitudes);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      alert("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimales = async () => {
    try {
      const res = await api.get("/animales");
      setAnimales(res.data.data || []);
    } catch (error) {
      console.error("Error cargando animales:", error);
    }
  };

  const fetchEstados = async () => {
    try {
      const res = await api.get("/catalogos/estados-adopcion");
      setEstados(res.data.data || []);
    } catch (error) {
      console.error("Error cargando estados:", error);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    fetchAnimales();
    fetchEstados();
  }, []);

  /* =========================
     ACCIONES
  ========================== */

  const cambiarEstado = async (solicitud, nuevoEstadoId, observacion = '') => {
    try {
      await api.put(`/solicitudes-adopcion/${solicitud.id}/estado`, {
        estado_id: parseInt(nuevoEstadoId),
        respondido_por: currentUser?.id,
        observacion_respuesta: observacion || null
      });
      alert('Estado actualizado exitosamente');
      fetchSolicitudes();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("No se pudo actualizar el estado: " + (error.response?.data?.error || error.message));
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta solicitud?")) return;

    try {
      await api.delete(`/solicitudes-adopcion/${id}`);
      alert("Solicitud eliminada exitosamente");
      fetchSolicitudes();
    } catch (error) {
      console.error("Error eliminando solicitud:", error);
      alert("No se pudo eliminar: " + (error.response?.data?.error || error.message));
    }
  };

  const FormularioCambioEstado = ({ solicitud }) => {
    const [nuevoEstadoId, setNuevoEstadoId] = useState(solicitud.estado_id);
    const [observacion, setObservacion] = useState(solicitud.observacion_respuesta || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      cambiarEstado(solicitud, nuevoEstadoId, observacion);
      closeModal();
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nuevo Estado: *</label>
          <select
            value={nuevoEstadoId}
            onChange={(e) => setNuevoEstadoId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            {estados.map((e) => (
              <option key={e.estado_id || e.id} value={e.estado_id || e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Observación/Notas:</label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            placeholder="Agregar observaciones sobre el cambio de estado..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Actualizar Estado
        </button>
      </form>
    );
  };

  const getEstadoColor = (estadoNombre) => {
    const colores = {
      'Pendiente': '#FFA500',
      'En Revisión': '#17A2B8',
      'Aprobada': '#28A745',
      'Rechazada': '#DC3545',
      'Completada': '#6C757D'
    };
    return colores[estadoNombre] || '#6C757D';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estadísticas rápidas
  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado_nombre?.toLowerCase().includes('pendiente')).length,
    aprobadas: solicitudes.filter(s => s.estado_nombre?.toLowerCase().includes('aprobada')).length,
    rechazadas: solicitudes.filter(s => s.estado_nombre?.toLowerCase().includes('rechazada')).length
  };

  /* =========================
     RENDER
  ========================== */

  return (
    <div className="section adoptions-section">
      <div className="section-header">
        <h2 className="section-title">Solicitudes de Adopción</h2>
        <button
          className="btn btn-secondary"
          onClick={fetchSolicitudes}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <StatCard title="Total" value={stats.total} color="#667eea" />
        <StatCard title="Pendientes" value={stats.pendientes} color="#FFA500" />
        <StatCard title="Aprobadas" value={stats.aprobadas} color="#28A745" />
        <StatCard title="Rechazadas" value={stats.rechazadas} color="#DC3545" />
      </div>

      {/* Filtros mejorados */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>Filtros</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Animal:</label>
            <select
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="">Todos los animales</option>
              {animales.map((a) => (
                <option key={a.id || a.animal_id} value={a.id || a.animal_id}>
                  {a.nombre} {a.raza?.nombre ? `- ${a.raza.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Estado:</label>
            <select
              value={estadoId}
              onChange={(e) => setEstadoId(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="">Todos los estados</option>
              {estados.map((e) => (
                <option key={e.estado_id || e.id} value={e.estado_id || e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={fetchSolicitudes}
            disabled={loading}
            style={{ height: 'fit-content' }}
          >
            🔍 Filtrar
          </button>

          {(animalId || estadoId) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setAnimalId('');
                setEstadoId('');
                fetchSolicitudes();
              }}
              style={{ height: 'fit-content' }}
            >
              🗑️ Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla mejorada */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando solicitudes...</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Animal</th>
                <th>Solicitante</th>
                <th>Contacto</th>
                <th>Fecha Solicitud</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No hay solicitudes de adopción registradas
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      <strong>{s.animal_nombre}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                        {s.nombre_especie} / {s.nombre_raza}
                        {s.animal_edad && ` • ${s.animal_edad} años`}
                      </div>
                    </td>
                    <td>
                      <strong>{s.nombre_solicitante}</strong>
                      {s.direccion_solicitante && (
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                          📍 {s.direccion_solicitante}
                        </div>
                      )}
                    </td>
                    <td>
                      {s.correo_solicitante && (
                        <div style={{ fontSize: '0.9rem' }}>
                          📧 {s.correo_solicitante}
                        </div>
                      )}
                      {s.telefono_solicitante && (
                        <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                          📞 {s.telefono_solicitante}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>
                        {formatDate(s.fecha_solicitud)}
                      </div>
                      {s.fecha_respuesta && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                          Respondida: {formatDate(s.fecha_respuesta)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: getEstadoColor(s.estado_nombre),
                          color: 'white',
                          fontSize: '0.85em',
                          fontWeight: 'bold',
                          display: 'inline-block'
                        }}
                      >
                        {s.estado_nombre}
                      </span>
                      {s.respondido_por_nombre && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                          Por: {s.respondido_por_nombre}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openModal(
                            `Detalles Solicitud #${s.id}`,
                            <div>
                              <h3 style={{ marginTop: 0 }}>{s.animal_nombre}</h3>
                              <div style={{ marginBottom: '20px' }}>
                                <p><strong>Solicitante:</strong> {s.nombre_solicitante}</p>
                                <p><strong>Correo:</strong> {s.correo_solicitante}</p>
                                <p><strong>Teléfono:</strong> {s.telefono_solicitante}</p>
                                <p><strong>Dirección:</strong> {s.direccion_solicitante}</p>
                                <p><strong>Fecha Solicitud:</strong> {formatDate(s.fecha_solicitud)}</p>
                                <p><strong>Estado:</strong> 
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: getEstadoColor(s.estado_nombre),
                                    color: 'white',
                                    marginLeft: '8px',
                                    fontSize: '0.9em'
                                  }}>
                                    {s.estado_nombre}
                                  </span>
                                </p>
                                {s.fecha_respuesta && (
                                  <p><strong>Fecha Respuesta:</strong> {formatDate(s.fecha_respuesta)}</p>
                                )}
                                {s.respondido_por_nombre && (
                                  <p><strong>Respondido por:</strong> {s.respondido_por_nombre}</p>
                                )}
                              </div>
                              
                              <div style={{ marginBottom: '20px' }}>
                                <h4>Experiencia con Animales:</h4>
                                <p style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px' }}>
                                  {s.experiencia_animales || 'No especificada'}
                                </p>
                              </div>

                              <div style={{ marginBottom: '20px' }}>
                                <h4>Motivo de Adopción:</h4>
                                <p style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px' }}>
                                  {s.motivo || 'No especificado'}
                                </p>
                              </div>

                              {s.observacion_respuesta && (
                                <div style={{ marginBottom: '20px' }}>
                                  <h4>Observaciones:</h4>
                                  <p style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px' }}>
                                    {s.observacion_respuesta}
                                  </p>
                                </div>
                              )}

                              <button className="btn btn-primary" onClick={closeModal}>
                                Cerrar
                              </button>
                            </div>
                          )}
                          style={{ fontSize: '0.85em', padding: '6px 10px' }}
                        >
                          👁️ Ver
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openModal(
                            `Cambiar Estado - Solicitud #${s.id}`,
                            <FormularioCambioEstado solicitud={s} />
                          )}
                          style={{ fontSize: '0.85em', padding: '6px 10px' }}
                        >
                          ✏️ Estado
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => eliminarSolicitud(s.id)}
                          style={{ fontSize: '0.85em', padding: '6px 10px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ title, value, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`,
    textAlign: 'center'
  }}>
    <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: '500' }}>
      {title}
    </p>
    <h3 style={{ margin: '8px 0 0', fontSize: '28px', color: '#333', fontWeight: '700' }}>
      {value}
    </h3>
  </div>
);

export default Adopciones;
