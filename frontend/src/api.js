import axios from "axios";

const api = axios.create({
    baseURL: "https://icontas.onrender.com", // Seu backend no Render
});

// --- 1. O QUE SAI (REQUEST) ---
// Coloca o Token em tudo que sai do navegador
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- 2. O QUE VOLTA (RESPONSE) ---
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Se o erro for 401 (Não Autorizado) ou 422 (Token Estranho)
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            console.log("⚠️ Erro de Sessão detectado:", error.response); // Apenas avisa no console

            // 🚨 COMENTE ESTAS LINHAS (Coloque // na frente)
            // console.log("Sessão expirada ou inválida. Fazendo logout...");
            // localStorage.removeItem("token");
            // localStorage.removeItem("usuario_nome");
            // window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;