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

// --- 2. O QUE VOLTA (RESPONSE) - AQUI ESTÁ A CORREÇÃO ---
// Verifica se o servidor devolveu erro de "Token Inválido"
api.interceptors.response.use(
    (response) => {
        // Se deu tudo certo, só repassa a resposta
        return response;
    },
    (error) => {
        // Se o erro for 401 (Não Autorizado) ou 422 (Token Estranho)
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            console.log("Sessão expirada ou inválida. Fazendo logout...");

            // Limpa a sujeira
            localStorage.removeItem("token");
            localStorage.removeItem("usuario_nome");
            localStorage.removeItem("usuario_foto");

            // Redireciona para o login (força bruta para garantir)
            window.location.href = "/login";
        }

        // Repassa o erro para o componente mostrar aviso se quiser
        return Promise.reject(error);
    }
);

export default api;