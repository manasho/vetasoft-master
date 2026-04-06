// Pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useRoleConfig, buildParams } from '../../utils/useRoleConfig';
const Dashboard = ({ openModal, closeModal, currentUser }) => {
  const [stats, setStats] = useState({
    usuarios: 0,
    clientes: 0,
    animales: 0,
    citas: 0,
    donaciones: 0,
    solicitudesAdopcion: 0,
    historialesMedicos: 0
  });
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const rc = useRoleConfig(currentUser);
  // Roles administrativos: Admin fundación (1) y Administrador (2)
  const isAdmin = currentUser?.roleId === 1  || currentUser?.roleId === 2;

  useEffect(() => {
    fetchStats();
    if (isAdmin) {
      fetchUsuarios();
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Obtener estadísticas de cada endpoint
      const [usuariosRes, clientesRes, animalesRes, citasRes, donacionesRes, solicitudesRes, historialesRes] = await Promise.all([
        // Solo administradores pueden ver listas de usuarios y clientes
        isAdmin ? api.get('/usuarios') : Promise.resolve({ data: { data: [] } }),
        isAdmin ? api.get('/clientes') : Promise.resolve({ data: { data: [] } }),
        
        // El resto depende de buildParams (si es cliente, filtra por su ID)
        api.get('/animales', { params: buildParams(rc, "animales") }),
        api.get('/citas', { params: buildParams(rc, "citas") }),
        api.get('/donaciones', { params: buildParams(rc, "donaciones") }),
        api.get('/solicitudes-adopcion', { params: buildParams(rc, "adopciones") }),
        api.get('/historial-medico', { params: buildParams(rc, "historial-medico") })
      ].map(p => p.catch(err => {
        console.warn("Módulo de dashboard con acceso restringido o error:", err);
        return { data: { data: [] } };
      })));

      setStats({
        usuarios: usuariosRes.data.data?.length || 0,
        clientes: clientesRes.data.data?.length || 0,
        animales: animalesRes.data.data?.length || 0,
        citas: citasRes.data.data?.length || 0,
        donaciones: donacionesRes.data.data?.length || 0,
        solicitudesAdopcion: solicitudesRes.data.data?.length || 0,
        historialesMedicos: historialesRes.data.data?.length || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      setUsuariosLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data.data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setUsuariosLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/catalogos/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  const handleDeleteUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;

    try {
      await api.delete(`/usuarios/${id}`);
      alert('Usuario desactivado exitosamente');
      fetchUsuarios();
      fetchStats();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al desactivar usuario');
    }
  };

  const FormularioUsuario = ({ usuario = null }) => {
    const [formData, setFormData] = useState({
      nombre: usuario?.nombre || '',
      correo: usuario?.correo || '',
      contrasena: '',
      telefono: usuario?.telefono || '',
      direccion: usuario?.direccion || '',
      rol_id: usuario?.rol_id || roles[0]?.rol_id || ''
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
          correo: formData.correo,
          telefono: formData.telefono || null,
          direccion: formData.direccion || null,
          rol_id: parseInt(formData.rol_id)
        };

        // Solo incluir contraseña si se está creando o si se cambió
        if (!usuario || formData.contrasena) {
          if (!formData.contrasena) {
            alert('La contraseña es requerida');
            return;
          }
          payload.contrasena = formData.contrasena;
        }

        if (usuario) {
          await api.put(`/usuarios/${usuario.usuario_id}`, payload);
          alert('Usuario actualizado exitosamente');
        } else {
          await api.post('/usuarios', payload);
          alert('Usuario creado exitosamente');
        }

        closeModal();
        fetchUsuarios();
        fetchStats();
      } catch (error) {
        console.error('Error guardando usuario:', error);
        alert('Error al guardar usuario: ' + (error.response?.data?.error || error.message));
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico *</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div className="form-group">
          <label>Contraseña {usuario ? '(dejar vacío para mantener)' : '*'}</label>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required={!usuario}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div className="form-group">
          <label>Rol *</label>
          <select
            name="rol_id"
            value={formData.rol_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="">Seleccionar rol...</option>
            {roles.map(r => (
              <option key={r.rol_id} value={r.rol_id}>
                {r.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
          {usuario ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </form>
    );
  };

  if (loading) {
    return <div className="section">Cargando dashboard...</div>;
  }

  return (
    <div className="section dashboard-section">
      <div style={{ marginBottom: '30px' }}>
        <h2 className="section-title">{isAdmin ? 'Dashboard Administrativo' : 'Mi Dashboard'}</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Bienvenido, <strong>{currentUser?.name || 'Usuario'}</strong>
          {currentUser?.role && (
            <span style={{ marginLeft: '10px', fontSize: '0.85em', padding: '3px 10px', background: '#e9ecef', borderRadius: '10px' }}>
              {currentUser.role}
            </span>
          )}
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {isAdmin && (
          <StatCard
            title="Usuarios"
            value={stats.usuarios}
            icon="👥"
            color="#667eea"
          />
        )}
        {isAdmin && (
          <StatCard
            title="Clientes"
            value={stats.clientes}
            icon="👤"
            color="#764ba2"
          />
        )}
        <StatCard
          title="Animales"
          value={stats.animales}
          icon="🐾"
          color="#f093fb"
        />
        <StatCard
          title="Citas"
          value={stats.citas}
          icon="📅"
          color="#4facfe"
        />
        <StatCard
          title="Donaciones"
          value={stats.donaciones}
          icon="💰"
          color="#43e97b"
        />
        <StatCard
          title="Solicitudes Adopción"
          value={stats.solicitudesAdopcion}
          icon="❤️"
          color="#fa709a"
        />
        <StatCard
          title="Historiales Médicos"
          value={stats.historialesMedicos}
          icon="📋"
          color="#fee140"
        />
      </div>

      {/* Gestión de Usuarios - Solo visible para roles admin */}
      {isAdmin && (<div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            Gestión de Usuarios
          </h3>
          <button
            className="btn btn-primary"
            onClick={() => openModal('Crear Nuevo Usuario', <FormularioUsuario />)}
          >
            ➕ Crear Usuario
          </button>
        </div>

        {usuariosLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.usuario_id}>
                    <td>{u.usuario_id}</td>
                    <td><strong>{u.nombre}</strong></td>
                    <td>{u.correo}</td>
                    <td>{u.telefono || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#e9ecef',
                        fontSize: '0.85em'
                      }}>
                        {u.nombre_rol || 'Sin rol'}
                      </span>
                    </td>
                    <td>
                      {u.fecha_registro
                        ? new Date(u.fecha_registro).toLocaleDateString('es-CO')
                        : '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => openModal(
                          `Editar Usuario - ${u.nombre}`,
                          <FormularioUsuario usuario={u} />
                        )}
                        style={{ marginRight: '8px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteUsuario(u.usuario_id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>)}
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`,
    transition: 'transform 0.2s'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: '500' }}>
          {title}
        </p>
        <h3 style={{ margin: '8px 0 0', fontSize: '32px', color: '#333', fontWeight: '700' }}>
          {value}
        </h3>
      </div>
      <div style={{
        fontSize: '48px',
        opacity: 0.2
      }}>
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;

