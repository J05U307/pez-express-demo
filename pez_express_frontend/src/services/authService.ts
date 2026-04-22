import api from "./axios";

// LOGIN
export const login = async (usuario: string, password: string) => {
  const response = await api.post("/api/auth/login", { usuario, password });
  localStorage.setItem("hasSession", "true"); // ← agrega esto
  return response.data;
};

// ME
export const getMe = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

// LOGOUT
export const logout = async () => {
  await api.post("/api/auth/logout");
  localStorage.removeItem("hasSession"); // ← agrega esto
};

// REFRESH
export const refresh = async () => {
  const response = await api.post("/api/auth/refresh");
  return response.data;
};