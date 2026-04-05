// Pages/Citas/Citas.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {useRoleConfig, buildParams } from "../../utils/useRoleConfig";
const Appointments = ({ openModal, closeModal, authToken, currentUser }) => {
  const [data, setData] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [estadosCitas, setEstadosCitas] = useState([]);
  const [tiposConsulta, setTiposConsulta] = useState([]);
  const [loading, setLoading] = useState(true);
  const rc = useRoleConfig(currentUser);

  useEffect(() => {
    fetchPacientes();
    fetchVeterinarios();
    fetchEstadosCitas();
    fetchTiposConsulta();
    fetchCitas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rc.filtros.clienteId, rc.filtros.veterinarioId]);

  const fetchPacientes = async () => {
    try {
      const params = buildParams(rc, "animales");
      const response = await api.get("/animales", { params });
      setPacientes(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const response = await api.get("/veterinarios");
      const veterinariosData = response.data.data || [];

      // Debug: ver qué datos llegan del backend
      console.log("👨‍⚕️ Veterinarios recibidos:", veterinariosData);
      if (veterinariosData.length > 0) {
        console.log("📋 Primer veterinario:", {
          veterinario_id: veterinariosData[0].veterinario_id,
          nombre_completo: veterinariosData[0].nombre_completo,
          especialidad: veterinariosData[0].especialidad,
          todos_los_campos: Object.keys(veterinariosData[0]),
        });
      }

      setVeterinarios(veterinariosData);
    } catch (error) {
      console.error("Error al cargar veterinarios:", error);
      alert(
        "Error al cargar veterinarios: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const fetchEstadosCitas = async () => {
    try {
      const response = await api.get("/catalogos/estado-citas");
      setEstadosCitas(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar estados:", error);
    }
  };

  const fetchTiposConsulta = async () => {
    try {
      const response = await api.get("/catalogos/tipo-consulta");
      setTiposConsulta(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar tipos de consulta:", error);
    }
  };

  const fetchCitas = async () => {
    try {
      setLoading(true);
      // Armamos los parámetros automáticamente según tu rol (gafas)
      const params = buildParams(rc, "citas"); 
      // Mandamos la petición a la API enviando esos parámetros
      const response = await api.get("/citas", { params });

      const citasData = response.data.data || [];

      // Debug: ver qué datos llegan del backend
      console.log("📅 Datos recibidos del backend (citas):", citasData);
      if (citasData.length > 0) {
        console.log("📋 Primera cita:", {
          cita_id: citasData[0].cita_id,
          animal_nombre: citasData[0].animal_nombre,
          veterinario_nombre: citasData[0].veterinario_nombre,
          tipo_consulta_nombre: citasData[0].tipo_consulta_nombre,
          estado_nombre: citasData[0].estado_nombre,
          todos_los_campos: Object.keys(citasData[0]),
        });
      }

      const transformedData = citasData.map((cita) => ({
        citaId: cita.cita_id || cita.id,
        pacienteId: cita.animal_id,
        pacienteNombre: cita.animal_nombre || "Sin paciente",
        pacienteRaza: cita.nombre_raza || "N/A",
        veterinarioId: cita.veterinario_id,
        veterinarioNombre: cita.veterinario_nombre || "Sin veterinario",
        veterinarioEspecialidad: cita.especialidad || "N/A",
        fechaCita: cita.fecha_cita,
        motivo: cita.motivo,
        estadoId: cita.estado_id,
        estadoNombre: cita.estado_nombre || "Sin estado",
        observaciones: cita.observaciones,
        tipoConsultaId: cita.tipo_consulta_id,
        tipoConsultaNombre: cita.tipo_consulta_nombre || "Sin tipo",
        creadoPor: cita.creado_por,
        creadoPorNombre: cita.usuario_creador?.nombre || "N/A",
        fechaCreacion: cita.fecha_creacion || cita.created_at,
      }));

      setData(transformedData);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      alert(
        "Error al cargar las citas: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCita = async (citaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      try {
        await api.delete(`/citas/${citaId}`);
        alert("Cita eliminada exitosamente");
        fetchCitas();
      } catch (error) {
        console.error("Error al eliminar cita:", error);
        alert(
          "Error al eliminar la cita: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  const FormularioCita = ({ cita = null }) => {
    const [formData, setFormData] = useState({
      pacienteId: cita?.pacienteId || "",
      veterinarioId: cita?.veterinarioId || "",
      fechaCita: cita?.fechaCita ? cita.fechaCita.slice(0, 16) : "",
      motivo: cita?.motivo || "",
      estadoId: cita?.estadoId || "",
      tipoConsultaId: cita?.tipoConsultaId || "",
      observaciones: cita?.observaciones || "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Validar que todos los campos requeridos estén llenos
      if (
        !formData.pacienteId ||
        !formData.veterinarioId ||
        !formData.fechaCita ||
        !formData.estadoId ||
        !formData.tipoConsultaId
      ) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      try {
        const citaData = {
          animal_id: parseInt(formData.pacienteId),
          veterinario_id: parseInt(formData.veterinarioId),
          fecha_cita: formData.fechaCita,
          motivo: formData.motivo || null,
          estado_id: parseInt(formData.estadoId),
          tipo_consulta_id: parseInt(formData.tipoConsultaId),
          observaciones: formData.observaciones || null,
          creado_por: currentUser?.id || null,
        };

        // Debug: ver qué datos se están enviando
        console.log("📤 Datos a enviar para crear cita:", citaData);
        console.log("👤 Usuario actual:", currentUser);

        if (cita) {
          await api.put(`/citas/${cita.citaId}`, citaData);
          alert("Cita actualizada exitosamente");
        } else {
          const response = await api.post("/citas", citaData);
          console.log("✅ Respuesta del servidor:", response.data);
          alert("Cita registrada exitosamente");
        }

        closeModal();
        fetchCitas();
      } catch (error) {
        console.error("Error al guardar cita:", error);
        const errorMessage =
          error.response?.data?.error || error.message || "Error desconocido";
        alert("Error al guardar la cita: " + errorMessage);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pacienteId">Paciente: *</label>
          <select
            id="pacienteId"
            name="pacienteId"
            value={formData.pacienteId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar paciente...</option>
            {pacientes.map((p) => (
              <option key={p.animal_id} value={p.animal_id}>
                {p.nombre} - {p.nombre_raza || p.raza?.nombre || "Sin raza"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="veterinarioId">Veterinario: *</label>
          <select
            id="veterinarioId"
            name="veterinarioId"
            value={formData.veterinarioId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar veterinario...</option>
            {veterinarios.length === 0 ? (
              <option value="" disabled>
                No hay veterinarios disponibles
              </option>
            ) : (
              veterinarios.map((v) => (
                <option key={v.veterinario_id} value={v.veterinario_id}>
                  {v.nombre_completo || v.nombre || "Sin nombre"}
                  {v.especialidad ? ` - ${v.especialidad}` : ""}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fechaCita">Fecha y Hora: *</label>
          <input
            type="datetime-local"
            id="fechaCita"
            name="fechaCita"
            value={formData.fechaCita}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipoConsultaId">Tipo de Consulta: *</label>
          <select
            id="tipoConsultaId"
            name="tipoConsultaId"
            value={formData.tipoConsultaId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar tipo...</option>
            {tiposConsulta.map((t) => (
              <option
                key={t.id || t.consulta_id || t.tipo_consulta_id}
                value={t.id || t.consulta_id || t.tipo_consulta_id}
              >
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="motivo">Motivo:</label>
          <textarea
            id="motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Descripción del motivo de la consulta..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="estadoId">Estado: *</label>
          <select
            id="estadoId"
            name="estadoId"
            value={formData.estadoId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar estado...</option>
            {estadosCitas.map((e) => (
              <option key={e.id || e.estado_id} value={e.id || e.estado_id}>
                {e.estado_nombre || e.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Notas adicionales..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {cita ? "Actualizar Cita" : "Agendar Cita"}
        </button>
      </form>
    );
  };

  const getEstadoColor = (estadoNombre) => {
    const colores = {
      Pendiente: "#FFA500",
      Confirmada: "#007BFF",
      Completada: "#28A745",
      Cancelada: "#DC3545",
      "En Proceso": "#17A2B8",
    };
    return colores[estadoNombre] || "#6C757D";
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="section">Cargando citas...</div>;
  }

  return (
    <div className="section appointments-section">
      <div className="section-header">
        <h2 className="section-title">Gestión de Citas</h2>
        <button
          className="btn btn-primary"
          onClick={() => openModal("Agendar Nueva Cita", <FormularioCita />)}
        >
          ➕ Agendar Cita
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha y Hora</th>
            <th>Paciente</th>
            <th>Veterinario</th>
            <th>Tipo Consulta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No hay citas registradas
              </td>
            </tr>
          ) : (
            data.map((cita) => (
              <tr key={cita.citaId}>
                <td>{cita.citaId}</td>
                <td>
                  <strong>{formatDateTime(cita.fechaCita)}</strong>
                </td>
                <td>
                  {cita.pacienteNombre !== "Sin paciente" ? (
                    <>
                      <strong>{cita.pacienteNombre}</strong>
                      {cita.pacienteRaza && cita.pacienteRaza !== "N/A" && (
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>
                          {cita.pacienteRaza}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>
                      Sin paciente
                    </span>
                  )}
                </td>
                <td>
                  {cita.veterinarioNombre !== "Sin veterinario" ? (
                    <>
                      <strong>{cita.veterinarioNombre}</strong>
                      {cita.veterinarioEspecialidad &&
                        cita.veterinarioEspecialidad !== "N/A" && (
                          <div style={{ fontSize: "0.85rem", color: "#666" }}>
                            {cita.veterinarioEspecialidad}
                          </div>
                        )}
                    </>
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>
                      Sin veterinario
                    </span>
                  )}
                </td>
                <td>
                  {cita.tipoConsultaNombre !== "Sin tipo" ? (
                    <strong>{cita.tipoConsultaNombre}</strong>
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>
                      Sin tipo
                    </span>
                  )}
                </td>
                <td>
                  {cita.estadoNombre !== "Sin estado" ? (
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: getEstadoColor(cita.estadoNombre),
                        color: "white",
                        fontSize: "0.85em",
                        fontWeight: "bold",
                      }}
                    >
                      {cita.estadoNombre}
                    </span>
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>
                      Sin estado
                    </span>
                  )}
                </td>
                <td className="actions-cell">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      openModal(
                        `Detalles Cita #${cita.citaId}`,
                        <div>
                          <p>
                            <strong>Fecha:</strong>{" "}
                            {formatDateTime(cita.fechaCita)}
                          </p>
                          <p>
                            <strong>Paciente:</strong> {cita.pacienteNombre} (
                            {cita.pacienteRaza})
                          </p>
                          <p>
                            <strong>Veterinario:</strong>{" "}
                            {cita.veterinarioNombre}
                          </p>
                          <p>
                            <strong>Tipo:</strong> {cita.tipoConsultaNombre}
                          </p>
                          <p>
                            <strong>Estado:</strong> {cita.estadoNombre}
                          </p>
                          {cita.motivo && (
                            <p>
                              <strong>Motivo:</strong> {cita.motivo}
                            </p>
                          )}
                          {cita.observaciones && (
                            <p>
                              <strong>Observaciones:</strong>{" "}
                              {cita.observaciones}
                            </p>
                          )}
                          <p>
                            <strong>Creado por:</strong> {cita.creadoPorNombre}
                          </p>
                          <button
                            className="btn btn-primary"
                            onClick={closeModal}
                            style={{ marginTop: "20px" }}
                          >
                            Cerrar
                          </button>
                        </div>
                      )
                    }
                  >
                    👁️ Ver
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      openModal(
                        `Editar Cita #${cita.citaId}`,
                        <FormularioCita cita={cita} />
                      )
                    }
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteCita(cita.citaId)}
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

export default Appointments;
