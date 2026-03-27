// Pages/Clientes/Clientes.js
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const Clientes = ({ openModal, closeModal }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clientes");
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      alert("Error al cargar los clientes: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clienteId) => {
    if (window.confirm("¿Estás seguro de que deseas desactivar este cliente?")) {
      try {
        await api.delete(`/clientes/${clienteId}`);
        alert("Cliente desactivado exitosamente");
        fetchClientes();
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("Error al eliminar el cliente: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const FormularioCliente = ({ cliente = null }) => {
    const [formData, setFormData] = useState({
      nombre: cliente?.nombre || "",
      correo: cliente?.correo || "",
      telefono: cliente?.telefono || "",
      direccion: cliente?.direccion || "",
      fecha_nacimiento: cliente?.fecha_nacimiento ? cliente.fecha_nacimiento.split("T")[0] : "",
      documento_id: cliente?.documento_id || "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          nombre: formData.nombre,
          correo: formData.correo || null,
          telefono: formData.telefono || null,
          direccion: formData.direccion || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          documento_id: formData.documento_id,
        };

        if (cliente) {
          await api.put(`/clientes/${cliente.cliente_id}`, payload);
          alert("Cliente actualizado exitosamente");
        } else {
          await api.post("/clientes", payload);
          alert("Cliente registrado exitosamente");
        }

        closeModal();
        fetchClientes();
      } catch (error) {
        console.error("Error al guardar cliente:", error);
        alert("Error al guardar el cliente: " + (error.response?.data?.error || error.message));
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Nombre completo del cliente" />
        </div>
        <div className="form-group">
          <label>Documento de Identidad *</label>
          <input type="text" name="documento_id" value={formData.documento_id} onChange={handleChange} required placeholder="Cédula o NIT" disabled={!!cliente} />
        </div>
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="3001234567" />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección del cliente" />
        </div>
        <div className="form-group">
          <label>Fecha de Nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
          {cliente ? "Actualizar Cliente" : "Registrar Cliente"}
        </button>
      </form>
    );
  };

  const filteredData = data.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(term) ||
      c.documento_id?.toLowerCase().includes(term) ||
      c.correo?.toLowerCase().includes(term) ||
      c.telefono?.includes(term)
    );
  });

  if (loading) {
    return <div className="section">Cargando clientes...</div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Clientes</h2>
          <p style={{ color: "#666", marginTop: "8px" }}>
            {data.length} {data.length === 1 ? "cliente registrado" : "clientes registrados"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal("Registrar Nuevo Cliente", <FormularioCliente />)}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, documento, correo o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", fontSize: "14px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Contacto</th>
            <th>Dirección</th>
            <th>Mascotas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                {searchTerm ? "No se encontraron resultados" : "No hay clientes registrados"}
              </td>
            </tr>
          ) : (
            filteredData.map((cliente) => (
              <tr key={cliente.cliente_id}>
                <td>{cliente.cliente_id}</td>
                <td><strong>{cliente.nombre}</strong></td>
                <td>{cliente.documento_id}</td>
                <td>
                  {cliente.correo && <div style={{ fontSize: "0.85rem" }}>📧 {cliente.correo}</div>}
                  {cliente.telefono && <div style={{ fontSize: "0.85rem" }}>📱 {cliente.telefono}</div>}
                  {!cliente.correo && !cliente.telefono && <span style={{ color: "#999" }}>-</span>}
                </td>
                <td>{cliente.direccion || "-"}</td>
                <td>
                  <span style={{ padding: "4px 8px", borderRadius: "12px", background: parseInt(cliente.total_animales) > 0 ? "#d4edda" : "#f8f9fa", color: parseInt(cliente.total_animales) > 0 ? "#155724" : "#666", fontSize: "0.85em", fontWeight: "600" }}>
                    {cliente.total_animales || 0} 🐾
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-secondary" onClick={() => openModal(`Editar Cliente - ${cliente.nombre}`, <FormularioCliente cliente={cliente} />)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(cliente.cliente_id)}>
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

export default Clientes;
