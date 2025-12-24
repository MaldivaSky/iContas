import axios from "axios";

// --- LÓGICA INTELIGENTE DE URL ---
// Verifica se o navegador está rodando no seu computador
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Se for local, usa a porta 5000. Se for nuvem, usa o endereço do Render.
const apiUrl = isLocal
    ? "http://127.0.0.1:5000"
    : "https://icontas.onrender.com";

const api = axios.create({
    baseURL: apiUrl
});

console.log(`📡 Conectando API em: ${apiUrl}`); // Ajuda a ver no console qual foi escolhido

// --- 1. O QUE SAI (REQUEST) ---
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
            console.log("⚠️ Erro de Sessão detectado:", error.response);

            // DICA: Para produção, é bom descomentar isso para jogar o usuário pro login se a sessão cair
            // Mas no desenvolvimento local às vezes atrapalha.
            // Se quiser ativar só na nuvem:
            if (!isLocal) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario_dados"); // Limpa tudo
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;