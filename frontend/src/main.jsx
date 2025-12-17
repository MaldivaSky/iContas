import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import axios from 'axios' // <--- Importe o axios

// --- O EXTERMINADOR DE TOKENS VELHOS ---
axios.interceptors.response.use(
  (response) => response, // Se der certo, segue a vida
  (error) => {
    // Se o erro for 401 (Não autorizado) ou 422 (Token inválido/processamento)
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      console.log("Sessão inválida. Limpando tudo...")
      localStorage.clear() // Limpa o token velho
      window.location.href = '/login' // Manda pro login na força bruta
    }
    return Promise.reject(error)
  }
)
// ---------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// --- FIM DO EXTERMINADOR DE TOKENS VELHOS ---
