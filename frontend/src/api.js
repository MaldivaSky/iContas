import axios from "axios";

const api = axios.create({
    // Certifique-se que este link é o do seu Render
    baseURL: "https://icontas.onrender.com",
});

// --- O SEGREDO ESTÁ AQUI ---
// Antes de qualquer pedido sair do navegador, essa função roda:
api.interceptors.request.use((config) => {
    // 1. Tenta pegar o token salvo no navegador
    const token = localStorage.getItem("token");

    // 2. Se tiver token, cola ele no cabeçalho como um crachá
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;