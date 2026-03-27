// Pages/Donaciones/Donaciones.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const Donations = ({ openModal, closeModal }) => {
  const [data, setData] = useState([]);
  const [finesDonacion, setFinesDonacion] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinesDonacion();
    fetchDonaciones();
  }, []);

  const fetchFinesDonacion = async () => {
    try {
      const response = await api.get("/campanas");
      setFinesDonacion(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar fines de donación:", error);
    }
  };

  const fetchDonaciones = async () => {
    try {
      setLoading(true);
      const response = await api.get("/donaciones");

      const donaciones = response.data.data || [];

      const transformedData = donaciones.map((donacion) => ({
        donacion_id: donacion.donacion_id,
        nombreDonante: donacion.anonimo ? "Anónimo" : donacion.nombre_donante,
        correoDonante: donacion.correo_donante,
        telefonoDonante: donacion.telefono_donante,
        monto: donacion.monto,
        fechaDonacion: donacion.fecha_donacion,
        metodoPago: donacion.metodo_pago,
        numeroTransaccion: donacion.numero_transaccion,
        observaciones: donacion.observaciones,
        anonimo: donacion.anonimo,
        finId: donacion.campana_id || donacion.fin,
        finNombre: donacion.campanas?.nombre || donacion.fin_donacion?.nombre || "Sin especificar",
        campanaId: donacion.campana_id,
        campanaNombre: donacion.campanas?.nombre || null,
      }));

      setData(transformedData);
    } catch (error) {
      console.error("Error al cargar donaciones:", error);
      alert(
        "Error al cargar las donaciones: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (donacionId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta donación?")) {
      try {
        await api.delete(`/donaciones/${donacionId}`);
        alert("Donación eliminada exitosamente");
        fetchDonaciones();
      } catch (error) {
        console.error("Error al eliminar donación:", error);
        alert(
          "Error al eliminar la donación: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  const FormularioDonacion = ({ donacion = null }) => {
    const [formData, setFormData] = useState({
      nombreDonante:
        donacion?.nombreDonante && donacion.nombreDonante !== "Anónimo"
          ? donacion.nombreDonante
          : "",
      correoDonante: donacion?.correoDonante || "",
      telefonoDonante: donacion?.telefonoDonante || "",
      monto: donacion?.monto || "",
      finId: donacion?.finId || "",
      metodoPago: donacion?.metodoPago || "",
      numeroTransaccion: donacion?.numeroTransaccion || "",
      observaciones: donacion?.observaciones || "",
      anonimo: donacion?.anonimo || false,
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const donacionData = {
          nombre_donante: formData.anonimo ? "Anónimo" : formData.nombreDonante,
          correo_donante: formData.correoDonante || null,
          telefono_donante: formData.telefonoDonante || null,
          monto: parseFloat(formData.monto),
          campana_id: parseInt(formData.finId),
          metodo_pago: formData.metodoPago || null,
          numero_transaccion: formData.numeroTransaccion || null,
          observaciones: formData.observaciones || null,
          anonimo: formData.anonimo,
        };

        if (donacion) {
          // Actualizar
          await api.put(`/donaciones/${donacion.donacion_id}`, donacionData);
          alert("Donación actualizada exitosamente");
        } else {
          // Crear
          await api.post("/donaciones", donacionData);
          alert("Donación registrada exitosamente");
        }

        closeModal();
        fetchDonaciones();
      } catch (error) {
        console.error("Error al guardar donación:", error);
        alert(
          "Error al guardar la donación: " +
            (error.response?.data?.error || error.message)
        );
      }
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="anonimo"
              checked={formData.anonimo}
              onChange={handleChange}
              style={{ width: "auto", marginRight: "8px" }}
            />
            Donación Anónima
          </label>
        </div>

        {!formData.anonimo && (
          <>
            <div className="form-group">
              <label htmlFor="nombreDonante">Nombre del Donante: *</label>
              <input
                type="text"
                id="nombreDonante"
                name="nombreDonante"
                value={formData.nombreDonante}
                onChange={handleChange}
                required={!formData.anonimo}
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="correoDonante">Correo Electrónico:</label>
              <input
                type="email"
                id="correoDonante"
                name="correoDonante"
                value={formData.correoDonante}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoDonante">Teléfono:</label>
              <input
                type="tel"
                id="telefonoDonante"
                name="telefonoDonante"
                value={formData.telefonoDonante}
                onChange={handleChange}
                placeholder="3001234567"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="monto">Monto: *</label>
          <input
            type="number"
            id="monto"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            required
            min="1000"
            step="0.01"
            placeholder="50000.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="finId">Campaña de Donación: *</label>
          <select
            id="finId"
            name="finId"
            value={formData.finId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar campaña...</option>
            {finesDonacion.map((fin) => (
              <option key={fin.id || fin.campana_id || fin.fin_donacion_id} value={fin.id || fin.campana_id || fin.fin_donacion_id}>
                {fin.nombre || fin.nombre_campana}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="metodoPago">Método de Pago:</label>
          <select
            id="metodoPago"
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
          >
            <option value="">Seleccionar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="PSE">PSE</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="numeroTransaccion">Número de Transacción:</label>
          <input
            type="text"
            id="numeroTransaccion"
            name="numeroTransaccion"
            value={formData.numeroTransaccion}
            onChange={handleChange}
            placeholder="Referencia o número de transacción"
          />
        </div>

        <div className="form-group">
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales..."
            rows="3"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {donacion ? "Actualizar Donación" : "Registrar Donación"}
        </button>
      </form>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="section">Cargando donaciones...</div>;
  }

  // Calcular totales
  const totalDonaciones = data.reduce(
    (sum, d) => sum + parseFloat(d.monto || 0),
    0
  );

  return (
    <div className="section donations-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Donaciones</h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Total recaudado:{" "}
            <strong style={{ color: "#667eea", fontSize: "1.2rem" }}>
              {formatCurrency(totalDonaciones)}
            </strong>{" "}
            <span style={{ fontSize: "0.9rem" }}>
              ({data.length} {data.length === 1 ? "donación" : "donaciones"})
            </span>
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() =>
            openModal("Registrar Nueva Donación", <FormularioDonacion />)
          }
        >
          ➕ Registrar Donación
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Donante</th>
            <th>Contacto</th>
            <th>Monto</th>
            <th>Fin</th>
            <th>Método Pago</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No hay donaciones registradas
              </td>
            </tr>
          ) : (
            data.map((donacion) => (
              <tr key={donacion.donacion_id}>
                <td>{donacion.donacion_id}</td>
                <td>
                  <strong>{donacion.nombreDonante}</strong>
                  {donacion.anonimo && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.75rem",
                        padding: "2px 6px",
                        background: "#6c757d",
                        color: "white",
                        borderRadius: "4px",
                      }}
                    >
                      Anónimo
                    </span>
                  )}
                </td>
                <td>
                  {donacion.correoDonante && (
                    <div style={{ fontSize: "0.85rem" }}>
                      📧 {donacion.correoDonante}
                    </div>
                  )}
                  {donacion.telefonoDonante && (
                    <div style={{ fontSize: "0.85rem" }}>
                      📱 {donacion.telefonoDonante}
                    </div>
                  )}
                  {!donacion.correoDonante && !donacion.telefonoDonante && (
                    <span style={{ color: "#999" }}>-</span>
                  )}
                </td>
                <td>
                  <strong style={{ color: "#28a745", fontSize: "1.1rem" }}>
                    {formatCurrency(donacion.monto)}
                  </strong>
                </td>
                <td>{donacion.finNombre}</td>
                <td>{donacion.metodoPago || "-"}</td>
                <td style={{ fontSize: "0.85rem" }}>
                  {formatDate(donacion.fechaDonacion)}
                </td>
                <td className="actions-cell">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      openModal(
                        `Detalles de Donación #${donacion.donacion_id}`,
                        <div>
                          <h3>Información de la Donación</h3>
                          <p>
                            <strong>Donante:</strong> {donacion.nombreDonante}
                          </p>
                          {donacion.correoDonante && (
                            <p>
                              <strong>Correo:</strong> {donacion.correoDonante}
                            </p>
                          )}
                          {donacion.telefonoDonante && (
                            <p>
                              <strong>Teléfono:</strong>{" "}
                              {donacion.telefonoDonante}
                            </p>
                          )}
                          <p>
                            <strong>Monto:</strong>{" "}
                            <span
                              style={{ color: "#28a745", fontSize: "1.2rem" }}
                            >
                              {formatCurrency(donacion.monto)}
                            </span>
                          </p>
                          <p>
                            <strong>Fin:</strong> {donacion.finNombre}
                          </p>
                          {donacion.campanaNombre && (
                            <p>
                              <strong>Campaña:</strong> {donacion.campanaNombre}
                            </p>
                          )}
                          {donacion.metodoPago && (
                            <p>
                              <strong>Método de Pago:</strong>{" "}
                              {donacion.metodoPago}
                            </p>
                          )}
                          {donacion.numeroTransaccion && (
                            <p>
                              <strong>Número de Transacción:</strong>{" "}
                              {donacion.numeroTransaccion}
                            </p>
                          )}
                          <p>
                            <strong>Fecha:</strong>{" "}
                            {formatDate(donacion.fechaDonacion)}
                          </p>
                          {donacion.observaciones && (
                            <>
                              <h4 style={{ marginTop: "20px" }}>
                                Observaciones:
                              </h4>
                              <p>{donacion.observaciones}</p>
                            </>
                          )}
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
                        `Editar Donación #${donacion.donacion_id}`,
                        <FormularioDonacion donacion={donacion} />
                      )
                    }
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteDonation(donacion.donacion_id)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Resumen de estadísticas */}
      {data.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "8px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <h4 style={{ marginBottom: "10px", color: "#666" }}>
              Estadísticas
            </h4>
            <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
              <strong>Total de donaciones:</strong> {data.length}
            </p>
            <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
              <strong>Donaciones anónimas:</strong>{" "}
              {data.filter((d) => d.anonimo).length}
            </p>
            <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>
              <strong>Promedio por donación:</strong>{" "}
              {formatCurrency(totalDonaciones / data.length)}
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: "10px", color: "#666" }}>
              Métodos de Pago
            </h4>
            {Array.from(
              new Set(data.map((d) => d.metodoPago).filter(Boolean))
            ).map((metodo) => {
              const count = data.filter((d) => d.metodoPago === metodo).length;
              return (
                <p key={metodo} style={{ fontSize: "0.9rem", margin: "5px 0" }}>
                  <strong>{metodo}:</strong> {count}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
/*
// Pages/Donaciones/Donaciones.js
import React, { useState, useEffect } from 'react';
import { fetchDonaciones, createDonacion, updateDonacion, deleteDonacion, fetchCampanas } from '../../utils/api';

const Donations = ({ openModal, closeModal }) => {
  const [data, setData] = useState([]);
  const [finesDonacion, setFinesDonacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDonation, setEditingDonation] = useState(null);

  
  useEffect(() => {
    fetchFinesDonacion();
    fetchDonacionesApi();
  }, []);


  const fetchFinesDonacion = async () => {
    try {
      const res = await fetchCampanas({ activo: true });
      if (res.ok && res.body && res.body.success) {
        setFinesDonacion(res.body.data || []);
      }
    } catch (error) {
      console.error('Error al cargar fines de donación:', error);
    }
  };

  // Obtener todas las donaciones
  const fetchDonacionesApi = async () => {
    try {
      setLoading(true);
      const res = await fetchDonaciones();
      if (res.ok && res.body && res.body.success) {
        const donaciones = res.body.data || [];
        const transformedData = donaciones.map(donacion => ({
          donacion_id: donacion.donacion_id,
          nombreDonante: donacion.anonimo ? 'Anónimo' : donacion.nombre_donante,
          correoDonante: donacion.correo_donante,
          telefonoDonante: donacion.telefono_donante,
          monto: donacion.monto,
          fechaDonacion: donacion.fecha_donacion,
          metodoPago: donacion.metodo_pago || null,
          numeroTransaccion: donacion.numero_transaccion || null,
          observaciones: donacion.observaciones || null,
          anonimo: donacion.anonimo || false,
          finId: donacion.campana_id || null,
          finNombre: donacion.campana_nombre || 'Sin especificar'
        }));
        setData(transformedData);
      }
    } catch (error) {
      console.error('Error al cargar donaciones:', error);
      alert('Error al cargar las donaciones: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar donación
  const handleDeleteDonation = async (donacionId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta donación?')) {
      try {
        const res = await deleteDonacion(donacionId);
        if (res.ok) {
          alert('Donación eliminada exitosamente');
          fetchDonacionesApi();
        } else {
          throw new Error(res.body?.error || 'Error eliminando donación');
        }
      } catch (error) {
        console.error('Error al eliminar donación:', error);
        alert('Error al eliminar la donación: ' + error.message);
      }
    }
  };

  // Componente del formulario
  const FormularioDonacion = ({ donacion = null }) => {
    const [formData, setFormData] = useState({
      nombreDonante: donacion?.nombreDonante || '',
      correoDonante: donacion?.correoDonante || '',
      telefonoDonante: donacion?.telefonoDonante || '',
      monto: donacion?.monto || '',
      finId: donacion?.finId || '',
      metodoPago: donacion?.metodoPago || '',
      numeroTransaccion: donacion?.numeroTransaccion || '',
      observaciones: donacion?.observaciones || '',
      anonimo: donacion?.anonimo || false
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const donacionData = {
          // backend expects these exact fields
          nombre_donante: formData.anonimo ? null : formData.nombreDonante,
          correo_donante: formData.correoDonante || null,
          telefono_donante: formData.telefonoDonante || null,
          monto: parseFloat(formData.monto),
          campana_id: parseInt(formData.finId),
          // optional extra fields (backend currently ignores them on insert)
          metodo_pago: formData.metodoPago || null,
          numero_transaccion: formData.numeroTransaccion || null,
          observaciones: formData.observaciones || null,
          anonimo: formData.anonimo || false,
        };

        if (donacion) {
          const res = await updateDonacion(donacion.donacion_id, donacionData);
          if (res.ok) {
            alert('Donación actualizada exitosamente');
          } else {
            throw new Error(res.body?.error || 'Error actualizando donación');
          }
        } else {
          const res = await createDonacion(donacionData);
          if (res.ok) {
            alert('Donación registrada exitosamente');
          } else {
            throw new Error(res.body?.error || 'Error creando donación');
          }
        }

        closeModal();
        fetchDonacionesApi();
      } catch (error) {
        console.error('Error al guardar donación:', error);
        alert('Error al guardar la donación: ' + error.message);
      }
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? checked : value 
      });
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="anonimo"
              checked={formData.anonimo}
              onChange={handleChange}
              style={{ width: 'auto', marginRight: '8px' }}
            />
            Donación Anónima
          </label>
        </div>

        {!formData.anonimo && (
          <>
            <div className="form-group">
              <label htmlFor="nombreDonante">Nombre del Donante: *</label>
              <input
                type="text"
                id="nombreDonante"
                name="nombreDonante"
                value={formData.nombreDonante}
                onChange={handleChange}
                required={!formData.anonimo}
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="correoDonante">Correo Electrónico:</label>
              <input
                type="email"
                id="correoDonante"
                name="correoDonante"
                value={formData.correoDonante}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoDonante">Teléfono:</label>
              <input
                type="tel"
                id="telefonoDonante"
                name="telefonoDonante"
                value={formData.telefonoDonante}
                onChange={handleChange}
                placeholder="3001234567"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="monto">Monto: *</label>
          <input
            type="number"
            id="monto"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            required
            min="1000"
            step="0.01"
            placeholder="50000.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="finId">Fin de la Donación: *</label>
          <select
            id="finId"
            name="finId"
            value={formData.finId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar fin...</option>
            {finesDonacion.map(fin => (
              <option key={fin.campana_id || fin.fin_donacion_id} value={fin.campana_id || fin.fin_donacion_id}>
                  {fin.nombre || fin.nombre_campana}
                </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="metodoPago">Método de Pago:</label>
          <select
            id="metodoPago"
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
          >
            <option value="">Seleccionar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="PSE">PSE</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="numeroTransaccion">Número de Transacción:</label>
          <input
            type="text"
            id="numeroTransaccion"
            name="numeroTransaccion"
            value={formData.numeroTransaccion}
            onChange={handleChange}
            placeholder="Referencia o número de transacción"
          />
        </div>

        <div className="form-group">
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales..."
            rows="3"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {donacion ? 'Actualizar Donación' : 'Registrar Donación'}
        </button>
      </form>
    );
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="section">Cargando donaciones...</div>;
  }

  // Calcular totales
  const totalDonaciones = data.reduce((sum, d) => sum + parseFloat(d.monto), 0);

  return (
    <div className="section donations-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Donaciones</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Total recaudado: <strong style={{ color: '#667eea', fontSize: '1.2rem' }}>
              {formatCurrency(totalDonaciones)}
            </strong>
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => openModal(
            'Registrar Nueva Donación', 
            <FormularioDonacion />
          )}
        >
          ➕ Registrar Donación
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Donante</th>
            <th>Contacto</th>
            <th>Monto</th>
            <th>Fin</th>
            <th>Método Pago</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No hay donaciones registradas
              </td>
            </tr>
          ) : (
            data.map((donacion) => (
              <tr key={donacion.donacion_id}>
                <td>{donacion.donacion_id}</td>
                <td>
                  <strong>{donacion.nombreDonante}</strong>
                  {donacion.anonimo && (
                    <span style={{ 
                      marginLeft: '8px',
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      background: '#6c757d',
                      color: 'white',
                      borderRadius: '4px'
                    }}>
                      Anónimo
                    </span>
                  )}
                </td>
                <td>
                  {donacion.correoDonante && (
                    <div style={{ fontSize: '0.85rem' }}>📧 {donacion.correoDonante}</div>
                  )}
                  {donacion.telefonoDonante && (
                    <div style={{ fontSize: '0.85rem' }}>📱 {donacion.telefonoDonante}</div>
                  )}
                  {!donacion.correoDonante && !donacion.telefonoDonante && (
                    <span style={{ color: '#999' }}>-</span>
                  )}
                </td>
                <td>
                  <strong style={{ color: '#28a745', fontSize: '1.1rem' }}>
                    {formatCurrency(donacion.monto)}
                  </strong>
                </td>
                <td>{donacion.finNombre}</td>
                <td>{donacion.metodoPago || '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>
                  {formatDate(donacion.fechaDonacion)}
                </td>
                <td className="actions-cell">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => openModal(
                      `Editando donación #${donacion.donacion_id}`,
                      <FormularioDonacion donacion={donacion} />
                    )}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => openModal(
                      `Detalles de Donación #${donacion.donacion_id}`,
                      <div>
                        <p><strong>Donante:</strong> {donacion.nombreDonante}</p>
                        <p><strong>Monto:</strong> {formatCurrency(donacion.monto)}</p>
                        <p><strong>Fin:</strong> {donacion.finNombre}</p>
                        <p><strong>Método:</strong> {donacion.metodoPago || '-'}</p>
                        <p><strong>Transacción:</strong> {donacion.numeroTransaccion || '-'}</p>
                        <p><strong>Fecha:</strong> {formatDate(donacion.fechaDonacion)}</p>
                        {donacion.observaciones && (
                          <p><strong>Observaciones:</strong> {donacion.observaciones}</p>
                        )}
                        <button className="btn btn-primary" onClick={closeModal} style={{ marginTop: '20px' }}>
                          Cerrar
                        </button>
                      </div>
                    )}
                  >
                    👁️ Ver
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteDonation(donacion.donacion_id)}
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

export default Donations;*/
