import React, { useState } from "react";

const PerfilCliente = () => {
  const [cliente, setCliente] = useState({
    nombre: "Ana Torres",
    correo: "ana@email.com",
    telefono: "3001234567",
    direccion: "Calle 123"
  });

  const [mascotaActiva, setMascotaActiva] = useState(null);

  const mascotas = [
    {
      id: 1,
      nombre: "Luna",
      especie: "Perro",
      historial: [
        {
          fecha: "2024-02-10",
          diagnostico: "Vacunación",
          veterinario: "Dra. Gómez",
          observaciones: "Vacuna antirrábica aplicada"
        },
        {
          fecha: "2024-05-20",
          diagnostico: "Consulta general",
          veterinario: "Dr. Pérez",
          observaciones: "Buen estado de salud"
        }
      ]
    },
    {
      id: 2,
      nombre: "Michi",
      especie: "Gato",
      historial: [
        {
          fecha: "2024-03-15",
          diagnostico: "Desparasitación",
          veterinario: "Dr. Rodríguez",
          observaciones: "Tratamiento oral"
        }
      ]
    }
  ];

  const handleChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="main-content section">

        <div className="section-header">
          <h1 className="section-title">Mi perfil</h1>
        </div>

        {/* DATOS CLIENTE */}
        <div className="extra-info-container">
          <h2 style={{ marginBottom: 15 }}>Mis datos</h2>

          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" value={cliente.nombre} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Correo</label>
            <input name="correo" value={cliente.correo} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input name="telefono" value={cliente.telefono} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input name="direccion" value={cliente.direccion} onChange={handleChange} />
          </div>

          <button className="btn btn-success">
            Guardar cambios
          </button>
        </div>

        {/* MASCOTAS */}
        <div>
          <h2 className="section-title" style={{ marginTop: "30px" }}>Historial médico de mis mascotas</h2>
        </div>
        <div className="extra-info-container" style={{ marginTop: 30 }}>
          <h2 style={{ marginBottom: 15 }}>Mis mascotas</h2>

          {mascotas.map((m) => (
            <div key={m.id} style={{ marginBottom: 15 }}>
              <button
                className="btn btn-primary"
                onClick={() =>
                  setMascotaActiva(mascotaActiva?.id === m.id ? null : m)
                }
              >
                {m.nombre} ({m.especie})
              </button>

              {/* HISTORIAL */}
              {mascotaActiva?.id === m.id && (
                <table className="data-table" style={{ marginTop: 15 }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Diagnóstico</th>
                      <th>Veterinario</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.historial.map((h, i) => (
                      <tr key={i}>
                        <td>{h.fecha}</td>
                        <td>{h.diagnostico}</td>
                        <td>{h.veterinario}</td>
                        <td>{h.observaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PerfilCliente;