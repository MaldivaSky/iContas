import axios from "axios";

// Aqui definimos o endereço padrão do seu Backend
const api = axios.create({
    baseURL: "https://icontas.onrender.com",
});

export default api;