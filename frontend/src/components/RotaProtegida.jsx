import { Navigate } from 'react-router-dom'

// Este componente recebe uma "Página Filha" (children)
function RotaProtegida({ children }) {

    // 1. Verifica se existe o crachá no navegador
    const token = localStorage.getItem('token')

    // 2. Se NÃO tiver token, manda para o Login imediatamente
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // 3. Se tiver token, libera o acesso à página filha
    return children
}

export default RotaProtegida