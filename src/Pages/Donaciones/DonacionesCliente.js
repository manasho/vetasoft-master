import React, { useState } from "react";

const Donaciones = () => {
  const [form, setForm] = useState({
    campana: "",
    nombre: "",
    correo: "",
    telefono: "",
    monto: "",
    metodo: "",
    anonimo: false,
    observaciones: ""
  });

  const campañas = [
    {
      id: 1,
      nombre: "Rescate de animales abandonados",
      descripcion: "Apoya el rescate y rehabilitación de mascotas en situación de calle."
    },
    {
      id: 2,
      nombre: "Campaña de esterilización",
      descripcion: "Ayuda a controlar la sobrepoblación animal mediante esterilizaciones."
    },
    {
      id: 3,
      nombre: "Medicamentos veterinarios",
      descripcion: "Compra de medicamentos y suministros médicos para animales necesitados."
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.campana || !form.monto) {
      alert("Campaña y monto son obligatorios");
      return;
    }

    console.log("Donación simulada:", form);
    alert("Donación registrada correctamente (simulación)");

    setForm({
      campana: "",
      nombre: "",
      correo: "",
      telefono: "",
      monto: "",
      metodo: "",
      anonimo: false,
      observaciones: ""
    });
  };

  return (
    <div className="container">
      <div className="main-content section">
        
        {/* HEADER */}
        <div className="section-header">
          <h1 className="section-title">Donaciones</h1>
        </div>

        {/* DESCRIPCIÓN */}
        <p className="services-desc">
          Apoya nuestras campañas activas y contribuye al bienestar de las mascotas
          que más lo necesitan.
        </p>

        {/* CAMPAÑAS */}
        <div className="services-grid" style={{ marginTop: 30 }}>
          {campañas.map((c) => (
            <div key={c.id} className="service-item">
              <div>
                <span>{c.nombre}</span>
                <p style={{ marginTop: 6, fontSize: "0.9rem", color: "#555" }}>
                  {c.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="services-desc" style={{ marginTop: 40 }}>
          Completa el formulario para apoyar nuestras campañas activas.
        </p>

        <div className="extra-info-container">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Campaña *</label>
              <select name="campana" value={form.campana} onChange={handleChange}>
                <option value="">Seleccione una campaña</option>
                {campañas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nombre del donante *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                disabled={form.anonimo}
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Monto a donar *</label>
              <input
                type="number"
                min="1000"
                name="monto"
                value={form.monto}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Método de pago</label>
              <select name="metodo" value={form.metodo} onChange={handleChange}>
                <option value="">Seleccione un método</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="PSE">PSE</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <div className="form-group">
                <label>Donación anónima</label>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    name="anonimo"
                    checked={form.anonimo}
                    onChange={handleChange}
                  />
                </div>
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
              Confirmar donación
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Donaciones;