import { Navigate } from 'react-router-dom'

// Este componente recebe uma "Página Filha" (children)
function RotaProtegida({ children }) {

    // 1. Verifica se existe o crachá no navegador
    const token = localStorage.getItem('token')
    console.log("🔒 RotaProtegida: Verificando token...", token ? "OK" : "VAZIO");
    // 2. Se tiver token, deixa entrar. Se não, manda pro Login.
    return token ? children : <Navigate to="/login" />;
}

export default RotaProtegida