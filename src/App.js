import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header.js";
import Auth from "./components/Auth.js";
import Pets from "./Pages/Mascotas/Mascotas.js";
import Home from "./Pages/Home/Home.js";
import Appointments from "./Pages/Citas/Citas.js";
import Adoptions from "./Pages/Adopciones/Adopciones.jsx";
import Medical from "./Pages/HistorialClinico/HistorialClinico.js";
import Donaciones from "./Pages/Donaciones/Donaciones.js";
import Dashboard from "./Pages/Dashboard/Dashboard.js";
import Clientes from "./Pages/Clientes/Clientes.js";
import Veterinarios from "./Pages/Veterinarios/Veterinarios.js";
import Campanas from "./Pages/Campanas/Campanas.js";
import Vacunacion from "./Pages/Vacunacion/Vacunacion.js";
import Modal from "./components/Modal.js";
import api from "./api/axios";
import { mapModulosToNav } from "./utils/modulosConfig";

function App() {
  // Estados principales
  const [currentSection, setCurrentSection] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [userModulos, setUserModulos] = useState([]);
  
  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  // Obtener módulos del usuario desde la API
  const fetchModulos = async () => {
    try {
      const res = await api.get("/modulos/mis-modulos");
      if (res.data.success) {
        const mapped = mapModulosToNav(res.data.data);
        setUserModulos(mapped);
        // Guardar en localStorage para restaurar sesión
        localStorage.setItem("userModulos", JSON.stringify(mapped));
        console.log("📦 Módulos cargados:", mapped.map(m => m.label));
      }
    } catch (error) {
      console.error("Error al obtener módulos:", error);
      // Si falla (ej. token expirado), limpiar sesión
      if (error.response?.status === 401) {
        console.warn("Token expirado, cerrando sesión");
        handleLogout();
      }
    }
  };

  // Verificar si hay sesión activa al cargar la página
  useEffect(() => {
    const storedToken =
      localStorage.getItem("authToken") ||
      localStorage.getItem("vetasoft_token") ||
      localStorage.getItem("token");

    const token = storedToken;
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthToken(token);
        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log('✅ Sesión restaurada:', user);

        // Restaurar módulos guardados y luego refrescar desde API
        const savedModulos = localStorage.getItem('userModulos');
        if (savedModulos) {
          setUserModulos(JSON.parse(savedModulos));
        }
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userModulos');
      }
    }
  }, []);

  // Cuando hay sesión activa, refrescar módulos desde la API
  useEffect(() => {
    if (isLoggedIn && authToken) {
      fetchModulos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // NUEVO: Manejar login exitoso desde el componente Auth
  const handleLoginSuccess = ({ token, usuario }) => {
    console.log("✅ Login exitoso en App.js", { token, usuario });
    
    // Guardar token y usuario
    setAuthToken(token);
    setIsLoggedIn(true);
    
    const userData = {
      id: usuario.usuario_id,
      name: usuario.nombre,
      email: usuario.correo,
      role: usuario.nombre_rol || 'Usuario',
      roleId: usuario.rol_id,
      clienteId:     usuario.cliente_id      ?? null, // rol 3 (cliente)
      veterinarioId: usuario.veterinario_id  ?? null, // rol 5 (médico tratante) / 6 (auxiliar)
    };
    
    setCurrentUser(userData);
    
    // Persistir en localStorage y unificar claves usadas en el proyecto
    // Para compatibilidad con:
    // - utils/api.js  -> usa "vetasoft_token"
    // - api/axios.js  -> usa "token"
    localStorage.setItem("authToken", token);
    localStorage.setItem("vetasoft_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    
    // Obtener módulos del usuario recién autenticado
    // Pequeño delay para que el interceptor de axios ya tenga el token
    setTimeout(() => fetchModulos(), 100);

    // Redirigir al dashboard
    setCurrentSection('dashboard');
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setAuthToken(null);
      setCurrentSection("home");
      
      // Limpiar localStorage y todas las claves de token usadas en el proyecto
      localStorage.removeItem("authToken");
      localStorage.removeItem("vetasoft_token");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userModulos");
      setUserModulos([]);
      
      console.log("🔒 Sesión cerrada");
      alert("Sesión cerrada exitosamente");
    }
  };

  // Navegación entre secciones
  const showSection = (sectionId) => {
    const protectedSections = [
      "dashboard",
      "pets",
      "adoptions",
      "appointments",
      "medical",
      "Donaciones",
      "clientes",
      "veterinarios",
      "campanas",
      "vacunacion",
    ];

    // Verificar si la sección requiere autenticación
    if (protectedSections.includes(sectionId) && !isLoggedIn) {
      alert("Debes iniciar sesión para acceder a esta sección.");
      setCurrentSection("auth");
      return;
    }

    setCurrentSection(sectionId);
  };

  // Funciones del modal
  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent("");
  };

  // Renderizar sección actual
  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return <Home showSection={showSection} />;
      
      case "auth":
        return (
          <Auth 
            onLoginSuccess={handleLoginSuccess}
          />
        );
      
      case "pets":
        return (
          <Pets
            openModal={openModal}
            closeModal={closeModal}
            authToken={authToken}
            currentUser={currentUser}
          />
        );
      
      case "appointments":
        return (
          <Appointments
            openModal={openModal}
            closeModal={closeModal}
            authToken={authToken}
            currentUser={currentUser}
          />
        );
      
      case "adoptions":
        return (
          <Adoptions
            openModal={openModal}
            closeModal={closeModal}
            authToken={authToken}
            currentUser={currentUser}
          />
        );
      
      case "medical":
        return (
          <Medical
            openModal={openModal}
            closeModal={closeModal}
            authToken={authToken}
            currentUser={currentUser}
          />
        );
      
      case "Donaciones":
        return (
          <Donaciones 
            openModal={openModal} 
            closeModal={closeModal}
            authToken={authToken}
            currentUser={currentUser}
          />
        );
      
      case "dashboard":
        return (
          <Dashboard
            openModal={openModal}
            closeModal={closeModal}
            currentUser={currentUser}
          />
        );
      
      case "clientes":
        return (
          <Clientes
            openModal={openModal}
            closeModal={closeModal}
          />
        );
      
      case "veterinarios":
        return (
          <Veterinarios
            openModal={openModal}
            closeModal={closeModal}
          />
        );
      
      case "campanas":
        return (
          <Campanas
            openModal={openModal}
            closeModal={closeModal}
            currentUser={currentUser}
          />
        );
      
      case "vacunacion":
        return (
          <Vacunacion
            openModal={openModal}
            closeModal={closeModal}
            currentUser={currentUser}
          />
        );
      
      default:
        return <Home showSection={showSection} />;
    }
  };

  return (
    <div className="App">
      <div className="container">
        <Header
          currentSection={currentSection}
          showSection={showSection}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={handleLogout}
          userModulos={userModulos}
        />

        <main className="main-content">
          {renderSection()}
        </main>
      </div>

      <Modal
        show={showModal}
        title={modalTitle}
        content={modalContent}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;