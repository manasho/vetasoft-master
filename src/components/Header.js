import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getNotificaciones,
  getContador,
  marcarTodasLeidas,
  marcarLeida,
  eliminarNotificacion,
} from '../api/notificaciones';

/* ── Componente campana ─────────────────────────────────────────── */
const NotificacionesBell = ({ isLoggedIn }) => {
  const [open, setOpen]               = useState(false);
  const [count, setCount]             = useState(0);
  const [notifs, setNotifs]           = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropRef                       = useRef(null);

  /* Retorna la hora formateada */
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `Hace ${diffH} h`;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  /* Obtiene solo el contador (liviano, se repite cada 30 s) */
  const fetchContador = useCallback(async () => {
    if (!isLoggedIn) return;
    const res = await getContador();
    if (res.success) setCount(res.data.count ?? 0);
  }, [isLoggedIn]);

  /* Obtiene la lista completa (se llama al abrir el panel) */
  const fetchNotifs = useCallback(async () => {
    setLoadingNotifs(true);
    const res = await getNotificaciones();
    if (res.success) setNotifs(res.data ?? []);
    setLoadingNotifs(false);
  }, []);

  /* Polling del contador cada 30 s */
  useEffect(() => {
    if (!isLoggedIn) { setCount(0); setNotifs([]); return; }
    fetchContador();
    const id = setInterval(fetchContador, 30000);
    return () => clearInterval(id);
  }, [isLoggedIn, fetchContador]);

  /* Cerrar dropdown al hacer clic fuera */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Al abrir el panel, cargar notifs */
  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifs();
  };

  const handleMarcarLeida = async (id) => {
    await marcarLeida(id);
    setNotifs(prev => prev.map(n => n.notificacion_id === id ? { ...n, es_leida: true } : n));
    setCount(prev => Math.max(0, prev - 1));
  };

  const handleEliminar = async (id, esLeida) => {
    await eliminarNotificacion(id);
    setNotifs(prev => prev.filter(n => n.notificacion_id !== id));
    if (!esLeida) setCount(prev => Math.max(0, prev - 1));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    setNotifs(prev => prev.map(n => ({ ...n, es_leida: true })));
    setCount(0);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="notif-wrapper" ref={dropRef}>
      {/* ── Botón campana ── */}
      <button
        className="notif-bell-btn"
        onClick={toggleOpen}
        aria-label={`Notificaciones ${count > 0 ? `(${count} nuevas)` : ''}`}
        title="Notificaciones"
      >
        🔔
        {count > 0 && (
          <span className="notif-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="notif-dropdown">
          {/* Cabecera */}
          <div className="notif-header">
            <span className="notif-title">🔔 Notificaciones</span>
            {count > 0 && (
              <button className="notif-mark-all" onClick={handleMarcarTodas}>
                ✅ Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="notif-list">
            {loadingNotifs ? (
              <div className="notif-empty">Cargando...</div>
            ) : notifs.length === 0 ? (
              <div className="notif-empty">
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.notificacion_id}
                  className={`notif-item ${n.es_leida ? 'notif-read' : 'notif-unread'}`}
                >
                  <div className="notif-item-body">
                    <p className="notif-msg">{n.mensaje}</p>
                    <span className="notif-time">{formatTime(n.fecha_creacion)}</span>
                  </div>
                  <div className="notif-item-actions">
                    {!n.es_leida && (
                      <button
                        className="notif-action-btn notif-read-btn"
                        onClick={() => handleMarcarLeida(n.notificacion_id)}
                        title="Marcar como leída"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="notif-action-btn notif-del-btn"
                      onClick={() => handleEliminar(n.notificacion_id, n.es_leida)}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Header principal ───────────────────────────────────────────── */
const Header = ({ currentSection, showSection, isLoggedIn, currentUser, onLogout, userModulos = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavClick = (section) => {
    showSection(section);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top">
          {/* Logo */}
          <div
            className="logo"
            onClick={() => isLoggedIn && handleNavClick('dashboard')}
            style={{ cursor: isLoggedIn ? 'pointer' : 'default' }}
          >
            🐾 Vetasoft
          </div>

          {/* Zona derecha: campana + auth */}
          <div className="header-right">
            {/* Campana — visible solo cuando hay sesión */}
            <NotificacionesBell isLoggedIn={isLoggedIn} />

            {/* Botón hamburguesa (móvil) */}
            <button
              className={`hamburger ${menuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Auth — desktop */}
            {!isLoggedIn ? (
              <div className="auth-buttons desktop-only">
                <button className="btn btn-primary" onClick={() => handleNavClick('auth')}>
                  👤 Ingresar
                </button>
              </div>
            ) : (
              <div className="auth-buttons desktop-only">
                <span className="user-welcome">
                  Bienvenido, <strong>{currentUser?.name || 'Usuario'}</strong>
                  {currentUser?.role && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '0.8em',
                      padding: '2px 8px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                    }}>
                      {currentUser.role}
                    </span>
                  )}
                </span>
                <button className="btn btn-danger" onClick={onLogout}>
                  🚪 Salir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navegación dinámica */}
        {isLoggedIn && (
          <nav className={`nav-buttons ${menuOpen ? 'open' : ''}`}>
            <div className="menu-section">
              {userModulos.length > 0 ? (
                userModulos.map((mod) => (
                  <button
                    key={mod.sectionId}
                    className={`btn ${currentSection === mod.sectionId ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleNavClick(mod.sectionId)}
                  >
                    {mod.emoji} {mod.label}
                  </button>
                ))
              ) : (
                <span style={{ color: '#999', padding: '8px 12px', fontSize: '0.9em' }}>
                  ⏳ Cargando módulos...
                </span>
              )}
            </div>

            {/* Auth en móvil (dentro del panel deslizante) */}
            <div className="auth-buttons mobile-only">
              <span className="user-welcome">
                Bienvenido, <strong>{currentUser?.name || 'Usuario'}</strong>
                {currentUser?.role && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '0.8em',
                    padding: '2px 8px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                  }}>
                    {currentUser.role}
                  </span>
                )}
              </span>
              <button className="btn btn-danger" onClick={onLogout}>
                🚪 Salir
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;