/**
 * VetaSoft - Capa de API unificada
 * Todas las peticiones pasan por el cliente axios central (src/api/axios.js)
 * que ya incluye interceptores para JWT y manejo de errores.
 */
import api from "../api/axios";

// ============ AUTH ============

export async function apiLogin(email, password) {
	try {
		const res = await api.post("/auth/login", { correo: email, contrasena: password });
		return { ok: true, status: res.status, body: res.data };
	} catch (err) {
		return { ok: false, status: err.response?.status, body: err.response?.data || null };
	}
}

export async function apiRegister(name, email, password) {
	try {
		const res = await api.post("/auth/register", { nombre: name, correo: email, contrasena: password });
		return { ok: true, status: res.status, body: res.data };
	} catch (err) {
		return { ok: false, status: err.response?.status, body: err.response?.data || null };
	}
}

export async function apiVerify(token) {
	try {
		const res = await api.post("/auth/verify", { token });
		return { ok: true, status: res.status, body: res.data };
	} catch (err) {
		return { ok: false, status: err.response?.status, body: err.response?.data || null };
	}
}

// ============ TOKEN HELPERS ============

export function setToken(token) {
	if (token) {
		localStorage.setItem("token", token);
		localStorage.setItem("vetasoft_token", token);
		localStorage.setItem("authToken", token);
	}
}

export function getToken() {
	return localStorage.getItem("token") || localStorage.getItem("vetasoft_token") || localStorage.getItem("authToken");
}

export function removeToken() {
	localStorage.removeItem("token");
	localStorage.removeItem("vetasoft_token");
	localStorage.removeItem("authToken");
	localStorage.removeItem("currentUser");
}

export function authHeader() {
	const t = getToken();
	return t ? { Authorization: `Bearer ${t}` } : {};
}

// ============ HELPER GENÉRICO ============
// Wrapper que convierte respuestas axios al formato { ok, status, body }
// usado por componentes que aún dependen de este formato.
async function wrap(promise) {
	try {
		const res = await promise;
		return { ok: true, status: res.status, body: res.data };
	} catch (err) {
		return { ok: false, status: err.response?.status, body: err.response?.data || null };
	}
}

// ============ ANIMALES ============

export async function fetchAnimales(params = {}) {
	return wrap(api.get("/animales", { params }));
}

export async function createAnimal(payload) {
	return wrap(api.post("/animales", payload));
}

export async function updateAnimal(id, payload) {
	return wrap(api.put(`/animales/${id}`, payload));
}

export async function deleteAnimal(id) {
	return wrap(api.delete(`/animales/${id}`));
}

// ============ CITAS ============

export async function fetchCitas(params = {}) {
	return wrap(api.get("/citas", { params }));
}

export async function createCita(payload) {
	return wrap(api.post("/citas", payload));
}

export async function updateCita(id, payload) {
	return wrap(api.put(`/citas/${id}`, payload));
}

export async function deleteCita(id) {
	return wrap(api.delete(`/citas/${id}`));
}

// ============ DONACIONES ============

export async function fetchDonaciones(params = {}) {
	return wrap(api.get("/donaciones", { params }));
}

export async function createDonacion(payload) {
	return wrap(api.post("/donaciones", payload));
}

export async function updateDonacion(id, payload) {
	return wrap(api.put(`/donaciones/${id}`, payload));
}

export async function deleteDonacion(id) {
	return wrap(api.delete(`/donaciones/${id}`));
}

// ============ HISTORIAL MÉDICO ============

export async function fetchHistorialMedico(params = {}) {
	return wrap(api.get("/historial-medico", { params }));
}

export async function createHistorial(payload) {
	return wrap(api.post("/historial-medico", payload));
}

// ============ CAMPAÑAS ============

export async function fetchCampanas(params = {}) {
	return wrap(api.get("/campanas", { params }));
}

// ============ ADOPCIONES ============

export async function fetchSolicitudes(params = {}) {
	return wrap(api.get("/solicitudes-adopcion", { params }));
}

export async function createSolicitud(payload) {
	return wrap(api.post("/solicitudes-adopcion", payload));
}

export async function updateSolicitud(id, payload) {
	return wrap(api.put(`/solicitudes-adopcion/${id}`, payload));
}

export async function deleteSolicitud(id) {
	return wrap(api.delete(`/solicitudes-adopcion/${id}`));
}

// ============ CATÁLOGOS ============

export async function fetchEstadosAdopcion(params = {}) {
	return wrap(api.get("/catalogos/estados-adopcion", { params }));
}

export async function fetchClientes(params = {}) {
	return wrap(api.get("/clientes", { params }));
}

export async function fetchEspecies(params = {}) {
	return wrap(api.get("/especies", { params }));
}

export async function fetchRazas(params = {}) {
	return wrap(api.get("/razas", { params }));
}

export async function fetchVeterinarios(params = {}) {
	return wrap(api.get("/veterinarios", { params }));
}

export async function fetchEstadoCitas(params = {}) {
	return wrap(api.get("/catalogos/estado-citas", { params }));
}

export async function fetchTipoConsulta(params = {}) {
	return wrap(api.get("/catalogos/tipo-consulta", { params }));
}

// ============ DEFAULT EXPORT ============

export default {
	apiLogin,
	apiRegister,
	apiVerify,
	setToken,
	getToken,
	removeToken,
	authHeader,
	fetchAnimales,
	createAnimal,
	updateAnimal,
	deleteAnimal,
	fetchCitas,
	createCita,
	updateCita,
	deleteCita,
	fetchDonaciones,
	createDonacion,
	updateDonacion,
	deleteDonacion,
	fetchHistorialMedico,
	createHistorial,
	fetchClientes,
	fetchEspecies,
	fetchRazas,
	fetchVeterinarios,
	fetchEstadoCitas,
	fetchTipoConsulta,
	fetchCampanas,
	fetchSolicitudes,
	createSolicitud,
	updateSolicitud,
	deleteSolicitud,
	fetchEstadosAdopcion,
};
