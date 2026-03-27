import React, { useState } from "react";


const AgendarCita = () => {
  const [form, setForm] = useState({
    mascota: "",
    servicio: "",
    veterinario: "",
    fecha: "",
    hora: "",
    observaciones: ""
  });

const [mascotas, setMascotas] = useState([]);
const [servicios, setServicios] = useState([]);
const [veterinarios, setVeterinarios] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.mascota || !form.servicio || !form.fecha || !form.hora) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    console.log("Cita agendada:", form);
    alert("Cita agendada correctamente (simulación)");

    setForm({
      mascota: "",
      servicio: "",
      veterinario: "",
      fecha: "",
      hora: "",
      observaciones: ""
    });
  };

  return (
    <div className="container">
      <div className="main-content section">

        <div className="section-header">
          <h1 className="section-title">Agendar cita</h1>
        </div>

        <p className="services-desc">
          Selecciona los datos necesarios para programar la atención veterinaria.
        </p>

        <div className="extra-info-container">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Mascota *</label>
              <select name="mascota" value={form.mascota} onChange={handleChange}>
                <option value="">Seleccione una mascota</option>
                {mascotas.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Servicio *</label>
              <select name="servicio" value={form.servicio} onChange={handleChange}>
                <option value="">Seleccione un servicio</option>
                {servicios.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Veterinario</label>
              <select
                name="veterinario"
                value={form.veterinario}
                onChange={handleChange}
              >
                <option value="">Asignación automática</option>
                {veterinarios.map((v, i) => (
                  <option key={i} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Hora *</label>
              <input
                type="time"
                name="hora"
                value={form.hora}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                rows="3"
                value={form.observaciones}
                onChange={handleChange}
              />
            </div>

            <button className="btn btn-success">
              Confirmar cita
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AgendarCita;