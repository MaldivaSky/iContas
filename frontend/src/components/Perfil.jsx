import { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

function Perfil() {
    const navigate = useNavigate()
    const [usuario, setUsuario] = useState({ nome: '', email: '', foto: '' })

    useEffect(() => {
        // Usa o api.js para não dar erro de token
        api.get('/meus-dados')
            .then(res => setUsuario({
                nome: res.data.nome_completo,
                email: res.data.email,
                foto: res.data.foto
            }))
            .catch(err => console.error("Erro ao carregar perfil", err))
    }, [])

    const fazerLogout = () => {
        localStorage.clear()
        window.location.href = '/login'
    }

    return (
        <div className="card-responsivo" style={{ textAlign: 'center' }}>
            <img
                src={usuario.foto || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                alt="Perfil"
                style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px', objectFit: 'cover' }}
            />
            <h3>{usuario.nome}</h3>
            <p>{usuario.email}</p>

            <button
                onClick={fazerLogout}
                style={{
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    marginTop: '20px',
                    cursor: 'pointer'
                }}>
                Sair do App
            </button>
        </div>
    )
}

export default Perfil