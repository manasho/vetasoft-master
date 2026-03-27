import React, { useState } from "react";
import axiosApi from "../api/axios";

// Wrapper sobre el cliente axios compartido para mantener compatibilidad
const api = {
  post: async (endpoint, data) => {
    try {
      console.log(`🌐 Enviando petición a: ${axiosApi.defaults.baseURL}${endpoint}`);
      console.log('📤 Datos:', data);
      
      const response = await axiosApi.post(endpoint, data);
      
      console.log(`📡 Status: ${response.status}`);
      console.log('📥 Respuesta:', response.data);
      
      return { data: response.data };
    } catch (error) {
      console.error('❌ Error en la petición:', error);
      if (error.response) {
        throw {
          response: {
            data: error.response.data
          }
        };
      }
      throw error;
    }
  }
};

const Auth = ({ onAuthSuccess, onLoginSuccess, onLogin, onRegister, hideWelcomeScreen = true }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estado para guardar el token y usuario en memoria
  const [authToken, setAuthToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLoginMode) {
        // LOGIN
        const res = await api.post("/auth/login", {
          correo: email,
          contrasena: password,
        });

        console.log("✅ Respuesta COMPLETA del servidor:", res);
        console.log("✅ Datos de respuesta:", res.data);

        if (!res.data.success) {
          console.error("❌ Login falló:", res.data.message || res.data.error);
          throw new Error(res.data.message || res.data.error || "Credenciales inválidas");
        }

        // Tu API devuelve los datos dentro de un objeto "data"
        const token = res.data.data?.token || res.data.token;
        const usuario = res.data.data?.user || res.data.usuario;

        console.log("✅ Token extraído:", token);
        console.log("✅ Usuario extraído:", usuario);

        if (!token) {
          console.error("❌ No se recibió token en la respuesta");
          throw new Error("No se recibió token de autenticación");
        }

        // Guardar token y usuario en el estado
        setAuthToken(token);
        setAuthUser(usuario);
        
        // Guardar token también en localStorage para que lo usen otros módulos (utils/api, api/axios)
        localStorage.setItem("authToken", token);
        localStorage.setItem("vetasoft_token", token);
        localStorage.setItem("token", token);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: usuario.usuario_id ?? usuario.id,
            name: usuario.nombre,
            email: usuario.correo,
            role: usuario.nombre_rol || "Usuario",
            roleId: usuario.rol_id,
          })
        );
        
        console.log("✅ Token guardado en estado:", token);
        console.log("✅ Usuario guardado en estado:", usuario);

        // Llamar callbacks - Compatibilidad con App.js existente
        if (onLogin) {
          // Si existe onLogin (tu implementación actual), úsala
          onLogin(email, password);
        }
        
        if (onAuthSuccess) {
          onAuthSuccess(usuario);
        }
        
        if (onLoginSuccess) {
          onLoginSuccess({ token, usuario });
        }

        // Limpiar formulario
        setEmail("");
        setPassword("");
        
        // Mostrar mensaje de éxito
        alert("¡Inicio de sesión exitoso!");
      } else {
        // REGISTRO
        const res = await api.post("/auth/register", {
          nombre: name,
          correo: email,
          contrasena: password,
        });

        if (!res.data.success) {
          throw new Error(res.data.message || res.data.error || "Error al registrarse");
        }

        // Llamar callback si existe (compatibilidad con App.js)
        if (onRegister) {
          onRegister(name, email, password);
        }

        alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
        setIsLoginMode(true);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("❌ Error completo:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Error de conexión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setEmail("");
    setPassword("");
    setError("");
    // Limpiar claves de sesión unificadas
    localStorage.removeItem("authToken");
    localStorage.removeItem("vetasoft_token");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    console.log("🔒 Sesión cerrada");
  };

  // Pantalla de usuario autenticado
  if (authToken && authUser) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "500px",
          width: "100%"
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "40px"
            }}>
              👤
            </div>
            <h2 style={{
              color: "#333",
              marginBottom: "10px",
              fontSize: "28px",
              fontWeight: "700"
            }}>
              ¡Bienvenido!
            </h2>
            <p style={{
              color: "#666",
              fontSize: "16px"
            }}>
              Has iniciado sesión correctamente
            </p>
          </div>
          
          <div style={{
            background: "#f8f9fa",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "1px solid #e9ecef"
          }}>
            <h3 style={{ 
              color: "#333", 
              marginBottom: "20px", 
              fontSize: "18px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              📋 Información del usuario
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <span style={{ color: "#888", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                  Nombre
                </span>
                <span style={{ color: "#333", fontSize: "16px", fontWeight: "500" }}>
                  {authUser.nombre}
                </span>
              </div>
              <div>
                <span style={{ color: "#888", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                  Correo
                </span>
                <span style={{ color: "#333", fontSize: "16px", fontWeight: "500" }}>
                  {authUser.correo}
                </span>
              </div>
              {authUser.id && (
                <div>
                  <span style={{ color: "#888", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                    ID
                  </span>
                  <span style={{ color: "#333", fontSize: "16px", fontWeight: "500" }}>
                    {authUser.id}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{
            background: "#d4edda",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #c3e6cb"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              marginBottom: "8px"
            }}>
              <span style={{ fontSize: "20px" }}>🔐</span>
              <span style={{ color: "#155724", fontSize: "14px", fontWeight: "600" }}>
                Token JWT guardado
              </span>
            </div>
            <div style={{ 
              color: "#666", 
              fontSize: "12px",
              fontFamily: "monospace",
              wordBreak: "break-all",
              background: "white",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #c3e6cb"
            }}>
              {authToken.substring(0, 60)}...
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "14px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#c82333";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(220, 53, 69, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#dc3545";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Formulario de login/registro
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        maxWidth: "420px",
        width: "100%"
      }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "28px"
          }}>
            🔐
          </div>
          <h2 style={{
            color: "#333",
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700"
          }}>
            {isLoginMode ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>
            {isLoginMode 
              ? "Ingresa tus credenciales para continuar" 
              : "Completa los datos para registrarte"
            }
          </p>
        </div>

        <div>
          {!isLoginMode && (
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="name" style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontWeight: "600",
                fontSize: "14px"
              }}>
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "10px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  transition: "all 0.3s",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{
              display: "block",
              marginBottom: "8px",
              color: "#555",
              fontWeight: "600",
              fontSize: "14px"
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "10px",
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "all 0.3s",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="password" style={{
              display: "block",
              marginBottom: "8px",
              color: "#555",
              fontWeight: "600",
              fontSize: "14px"
            }}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSubmit();
                }
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "10px",
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "all 0.3s",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "14px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "14px",
              border: "1px solid #f5c6cb",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)",
              transform: loading ? "none" : "translateY(0)"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? (
              <span>⏳ Procesando...</span>
            ) : (
              <span>{isLoginMode ? "🚀 Ingresar" : "✨ Crear Cuenta"}</span>
            )}
          </button>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "28px",
          paddingTop: "24px",
          borderTop: "1px solid #e9ecef"
        }}>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {isLoginMode ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          </span>
          {" "}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setName("");
              setEmail("");
              setPassword("");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline",
              padding: "0"
            }}
            onMouseOver={(e) => e.target.style.color = "#5568d3"}
            onMouseOut={(e) => e.target.style.color = "#667eea"}
          >
            {isLoginMode ? "Regístrate aquí" : "Inicia sesión"}
          </button>
        </div>

        <div style={{
          marginTop: "24px",
          padding: "12px",
          background: "#d4edda",
          borderRadius: "8px",
          fontSize: "11px",
          color: "#155724",
          border: "1px solid #c3e6cb"
        }}>
          <div style={{ marginBottom: "8px", fontWeight: "600" }}>✅ Conectado a VetaSoft API:</div>
          <div style={{ textAlign: "left", lineHeight: "1.6" }}>
            Asegúrate de que el servidor Express esté corriendo en el puerto 4000.<br/>
            Abre la consola (F12) para ver logs de las peticiones.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;