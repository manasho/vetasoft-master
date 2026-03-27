import React, { useState } from 'react';

const Header = ({ currentSection, showSection, isLoggedIn, currentUser, onLogout, userModulos = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavClick = (section) => {
    showSection(section);
    setMenuOpen(false); 
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top">
          <div className="logo" onClick={() => isLoggedIn && handleNavClick('dashboard')} style={{ cursor: isLoggedIn ? 'pointer' : 'default' }}>
            🐾 Vetasoft
          </div>
          
          {/* Botón hamburguesa - solo visible en móvil */}
          <button 
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Botones de autenticación - siempre visibles en desktop */}
          {!isLoggedIn ? (
            <div className="auth-buttons desktop-only">
              <button
                className="btn btn-primary"
                onClick={() => handleNavClick('auth')}
              >
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
                    borderRadius: '10px' 
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

        {/* Navegación dinámica basada en módulos del rol */}
        {isLoggedIn && (
          <nav className={`nav-buttons ${menuOpen ? 'open' : ''}`}>
            <div className="menu-section">
              {userModulos.length > 0 ? (
                // Renderizar dinámicamente desde la API de módulos
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
                // Fallback mientras cargan los módulos
                <span style={{ color: '#999', padding: '8px 12px', fontSize: '0.9em' }}>
                  ⏳ Cargando módulos...
                </span>
              )}
            </div>
            
            {/* Botones de auth en móvil - dentro del menú */}
            <div className="auth-buttons mobile-only">
              <span className="user-welcome">
                Bienvenido, <strong>{currentUser?.name || 'Usuario'}</strong>
                {currentUser?.role && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '0.8em', 
                    padding: '2px 8px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '10px' 
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