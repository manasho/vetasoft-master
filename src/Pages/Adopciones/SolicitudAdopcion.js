import React, { useState } from "react";

const Adopciones = () => {
  //const [mascotas, setMascotas] = useState([]);//
  const mascotas = [
  {
    id: 1,
    nombre: "Luna",
    especie: "Perro",
    edad: 2,
    imagen: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8"
  }
];
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    experiencia: "",
    motivo: ""
  });

  const handleSolicitar = (mascota) => {
    setMascotaSeleccionada(mascota);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    /*Pruebaaa sin ingreso real*/ 
    console.log("Solicitud enviada:", {
      animal_id: mascotaSeleccionada?.id,
      ...form
    });

    alert("Solicitud de adopción enviada correctamente (simulación)");

    setMascotaSeleccionada(null);
    setForm({
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
      experiencia: "",
      motivo: ""
    });
  };

  return (
    <div className="container">
      <div className="main-content section">

        <div className="section-header">
          <h1 className="section-title">Adopciones</h1>
        </div>

        <p className="services-desc">
          Conoce las mascotas disponibles y envía una solicitud de adopción.
        </p>

        {/* LISTADO */}
        {mascotas.length === 0 && (
          <p className="services-desc">
            No hay mascotas disponibles en este momento.
          </p>
        )}

        <div className="services-grid">
          {mascotas.map((m) => (
            <div key={m.id} className="service-item">
              <div style={{ textAlign: "center" }}>
                  <img
                    src={m.imagen}
                    alt={m.nombre}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginBottom: "10px"
                    }}
                  />
                </div>
              <div>
                <span>{m.nombre}</span>
                <p style={{ fontSize: "0.9rem", marginTop: 6 }}>
                  {m.especie} · {m.edad} años
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={() => handleSolicitar(m)}
                >
                  Solicitar adopción
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL SOLICITUD */}
        {mascotaSeleccionada && (
          <div className="modal">
            <div className="modal-content" style={{ marginTop: "80px" }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  Solicitud de adopción – {mascotaSeleccionada.nombre}
                </h2>
                <button
                  className="close"
                  onClick={() => setMascotaSeleccionada(null)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>

                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Correo electrónico *</label>
                  <input
                    type="email"
                    required
                    value={form.correo}
                    onChange={(e) =>
                      setForm({ ...form, correo: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Dirección *</label>
                  <input
                    type="text"
                    required
                    value={form.direccion}
                    onChange={(e) =>
                      setForm({ ...form, direccion: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Experiencia con animales *</label>
                  <textarea
                    rows="3"
                    required
                    value={form.experiencia}
                    onChange={(e) =>
                      setForm({ ...form, experiencia: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Motivo de adopción</label>
                  <textarea
                    rows="3"
                    value={form.motivo}
                    onChange={(e) =>
                      setForm({ ...form, motivo: e.target.value })
                    }
                  />
                </div>

                <button className="btn btn-success">
                  Enviar solicitud
                </button>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Adopciones;