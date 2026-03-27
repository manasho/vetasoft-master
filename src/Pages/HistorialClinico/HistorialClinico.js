// Pages/Medical/Medical.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const Medical = ({ openModal, closeModal, authToken, currentUser }) => {
  const [data, setData] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [tiposConsulta, setTiposConsulta] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacientes();
    fetchVeterinarios();
    fetchTiposConsulta();
    fetchCitas();
    fetchHistorial();
  }, []);

  const fetchPacientes = async () => {
    try {
      const response = await api.get("/animales");
      setPacientes(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const response = await api.get("/veterinarios");
      setVeterinarios(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar veterinarios:", error);
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
      const response = await api.get("/citas");
      setCitas(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    }
  };

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const response = await api.get("/historial-medico");

      const historialData = response.data.data || [];

      const transformedData = historialData.map((record) => ({
        id: record.historial_id || record.id,
        pacienteId: record.animal_id,
        petName: record.animal_nombre || "N/A",
        petRaza: record.nombre_raza || "N/A",
        diagnosis: record.diagnostico,
        treatment: record.tratamiento,
        veterinarioId: record.veterinario_id,
        vet: record.veterinario_nombre || "N/A",
        vetEspecialidad: record.especialidad || "",
        tipoConsultaId: record.tipo_consulta_id,
        tipoConsultaNombre: record.tipo_consulta_nombre || "N/A",
        fecha: record.fecha_consulta,
        sintomas: record.sintomas,
        observaciones: record.observaciones,
        examenesRealizados: record.examenes_realizados,
        medicamentos: record.medicamentos,
        proximaCita: record.proxima_cita,
        peso: record.peso,
        temperatura: record.temperatura,
        frecuenciaCardiaca: record.frecuencia_cardiaca,
        frecuenciaRespiratoria: record.frecuencia_respiratoria,
      }));

      setData(transformedData);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      alert(
        "Error al cargar el historial médico: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este registro médico?"
      )
    ) {
      try {
        await api.delete(`/historial-medico/${id}`);
        alert("Historia clínica eliminada exitosamente");
        fetchHistorial();
      } catch (error) {
        console.error("Error al eliminar registro:", error);
        alert(
          "Error al eliminar el registro: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  const FormularioHistorial = ({ record = null }) => {
    const [formData, setFormData] = useState({
      citaId: record?.citaId || "",
      pacienteId: record?.pacienteId || "",
      veterinarioId: record?.veterinarioId || "",
      tipoConsultaId: record?.tipoConsultaId || "",
      fecha: record?.fecha ? record.fecha.slice(0, 16) : "",
      sintomas: record?.sintomas || "",
      diagnosis: record?.diagnosis || "",
      treatment: record?.treatment || "",
      examenesRealizados: record?.examenesRealizados || "",
      medicamentos: record?.medicamentos || "",
      proximaCita: record?.proximaCita ? record.proximaCita.slice(0, 16) : "",
      observaciones: record?.observaciones || "",
      peso: record?.peso || "",
      temperatura: record?.temperatura || "",
      frecuenciaCardiaca: record?.frecuenciaCardiaca || "",
      frecuenciaRespiratoria: record?.frecuenciaRespiratoria || "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const historialData = {
          cita_id: parseInt(formData.citaId),
          animal_id: parseInt(formData.pacienteId),
          veterinario_id: parseInt(formData.veterinarioId),
          tipo_consulta_id: parseInt(formData.tipoConsultaId),
          fecha_consulta: formData.fecha,
          sintomas: formData.sintomas || null,
          diagnostico: formData.diagnosis,
          tratamiento: formData.treatment,
          examenes_realizados: formData.examenesRealizados || null,
          medicamentos: formData.medicamentos || null,
          proxima_cita: formData.proximaCita || null,
          observaciones: formData.observaciones || null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          temperatura: formData.temperatura
            ? parseFloat(formData.temperatura)
            : null,
          frecuencia_cardiaca: formData.frecuenciaCardiaca
            ? parseInt(formData.frecuenciaCardiaca)
            : null,
          frecuencia_respiratoria: formData.frecuenciaRespiratoria
            ? parseInt(formData.frecuenciaRespiratoria)
            : null,
        };

        if (record) {
          // Actualizar (si el backend lo soporta)
          await api.put(`/historial-medico/${record.id}`, historialData);
          alert("Historia clínica actualizada exitosamente");
        } else {
          // Crear
          await api.post("/historial-medico", historialData);
          alert("Historia clínica agregada exitosamente");
        }

        closeModal();
        fetchHistorial();
      } catch (error) {
        console.error("Error al guardar registro:", error);
        alert(
          "Error al guardar el registro: " +
            (error.response?.data?.error || error.message)
        );
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="citaId">Cita Asociada: *</label>
          <select
            id="citaId"
            name="citaId"
            value={formData.citaId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar cita...</option>
            {citas.map((c) => (
              <option key={c.cita_id || c.id} value={c.cita_id || c.id}>
                {c.animal_nombre || "N/A"} -{" "}
                {c.fecha_cita
                  ? new Date(c.fecha_cita).toLocaleString("es-CO")
                  : "N/A"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pacienteId">Mascota: *</label>
          <select
            id="pacienteId"
            name="pacienteId"
            value={formData.pacienteId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar mascota...</option>
            {pacientes.map((p) => (
              <option key={p.animal_id} value={p.animal_id}>
                {p.nombre} - {p.nombre_raza || "Sin raza"}
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
            {veterinarios.map((v) => (
              <option key={v.veterinario_id} value={v.veterinario_id}>
                {v.nombre_completo || v.nombre || "Sin nombre"}{" "}
                {v.especialidad ? `- ${v.especialidad}` : ""}
              </option>
            ))}
          </select>
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
                key={t.id || t.tipo_consulta_id}
                value={t.id || t.tipo_consulta_id}
              >
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fecha">Fecha de Consulta: *</label>
          <input
            type="datetime-local"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sintomas">Síntomas:</label>
          <textarea
            id="sintomas"
            name="sintomas"
            value={formData.sintomas}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Descripción de los síntomas observados..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="diagnosis">Diagnóstico: *</label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows="3"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Descripción del diagnóstico..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="treatment">Tratamiento: *</label>
          <textarea
            id="treatment"
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            required
            rows="3"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Descripción del tratamiento..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="examenesRealizados">Exámenes Realizados:</label>
          <textarea
            id="examenesRealizados"
            name="examenesRealizados"
            value={formData.examenesRealizados}
            onChange={handleChange}
            rows="2"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Exámenes realizados durante la consulta..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicamentos">Medicamentos:</label>
          <textarea
            id="medicamentos"
            name="medicamentos"
            value={formData.medicamentos}
            onChange={handleChange}
            rows="2"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            placeholder="Medicamentos recetados..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="proximaCita">Próxima Cita:</label>
          <input
            type="datetime-local"
            id="proximaCita"
            name="proximaCita"
            value={formData.proximaCita}
            onChange={handleChange}
          />
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
            placeholder="Observaciones adicionales..."
          />
        </div>

        <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
          Signos Vitales
        </h3>

        <div className="form-group">
          <label htmlFor="peso">Peso (kg):</label>
          <input
            type="number"
            id="peso"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            step="0.1"
            min="0"
            placeholder="Ej: 15.5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="temperatura">Temperatura (°C):</label>
          <input
            type="number"
            id="temperatura"
            name="temperatura"
            value={formData.temperatura}
            onChange={handleChange}
            step="0.1"
            min="0"
            placeholder="Ej: 38.5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="frecuenciaCardiaca">Frecuencia Cardíaca (lpm):</label>
          <input
            type="number"
            id="frecuenciaCardiaca"
            name="frecuenciaCardiaca"
            value={formData.frecuenciaCardiaca}
            onChange={handleChange}
            min="0"
            placeholder="Ej: 120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="frecuenciaRespiratoria">
            Frecuencia Respiratoria (rpm):
          </label>
          <input
            type="number"
            id="frecuenciaRespiratoria"
            name="frecuenciaRespiratoria"
            value={formData.frecuenciaRespiratoria}
            onChange={handleChange}
            min="0"
            placeholder="Ej: 30"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {record ? "Actualizar Historia" : "Agregar Historia"}
        </button>
      </form>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="section">Cargando historial médico...</div>;
  }

  return (
    <div className="section medical-section">
      <div className="section-header">
        <h2 className="section-title">Historias Clínicas</h2>
        <button
          className="btn btn-primary"
          onClick={() =>
            openModal("Agregar Nueva Historia Clínica", <FormularioHistorial />)
          }
        >
          ➕ Agregar Historia
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Mascota</th>
            <th>Diagnóstico</th>
            <th>Tratamiento</th>
            <th>Veterinario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No hay historias clínicas registradas
              </td>
            </tr>
          ) : (
            data.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>
                  <strong>{formatDateTime(record.fecha)}</strong>
                </td>
                <td>
                  <strong>{record.petName}</strong>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>
                    {record.petRaza}
                  </div>
                </td>
                <td
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {record.diagnosis}
                </td>
                <td
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {record.treatment}
                </td>
                <td>
                  {record.vet}
                  {record.vetEspecialidad !== "N/A" && (
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      {record.vetEspecialidad}
                    </div>
                  )}
                </td>
                <td className="actions-cell">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      openModal(
                        `Detalles Historia Clínica #${record.id}`,
                        <div>
                          <h3>
                            {record.petName} ({record.petRaza})
                          </h3>
                          <p>
                            <strong>Fecha:</strong>{" "}
                            {formatDateTime(record.fecha)}
                          </p>
                          <p>
                            <strong>Veterinario:</strong> {record.vet}
                          </p>

                          <h4 style={{ marginTop: "20px" }}>Diagnóstico:</h4>
                          <p>{record.diagnosis}</p>

                          <h4 style={{ marginTop: "20px" }}>Tratamiento:</h4>
                          <p>{record.treatment}</p>

                          {record.observaciones && (
                            <>
                              <h4 style={{ marginTop: "20px" }}>
                                Observaciones:
                              </h4>
                              <p>{record.observaciones}</p>
                            </>
                          )}

                          <h4 style={{ marginTop: "20px" }}>Signos Vitales:</h4>
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {record.peso && (
                              <li>
                                <strong>Peso:</strong> {record.peso} kg
                              </li>
                            )}
                            {record.temperatura && (
                              <li>
                                <strong>Temperatura:</strong>{" "}
                                {record.temperatura} °C
                              </li>
                            )}
                            {record.frecuenciaCardiaca && (
                              <li>
                                <strong>Frecuencia Cardíaca:</strong>{" "}
                                {record.frecuenciaCardiaca} lpm
                              </li>
                            )}
                            {record.frecuenciaRespiratoria && (
                              <li>
                                <strong>Frecuencia Respiratoria:</strong>{" "}
                                {record.frecuenciaRespiratoria} rpm
                              </li>
                            )}
                          </ul>

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
                        `Editar Historia Clínica #${record.id}`,
                        <FormularioHistorial record={record} />
                      )
                    }
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteRecord(record.id)}
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

export default Medical;
