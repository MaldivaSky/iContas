import { useState } from 'react'
import api from '../api' // Usa sua api configurada
import { Link, useNavigate } from 'react-router-dom'
import { PiUserBold, PiEnvelopeSimpleBold, PiLockKeyBold } from "react-icons/pi";
import { toast } from 'react-toastify';
function Cadastro() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', email: '', senha: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleCadastro = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Agora enviamos JSON direto, sem FormData
            await api.post('/registro', form)
            toast.success("Conta criada com sucesso! Faça login.")
            navigate('/login')
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.erro || "Erro ao criar conta")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '150px' }} />
                <h2 style={{ color: '#fcfcfcff' }}>Crie sua conta</h2>
                <p style={{ color: '#030303ff' }}>É rápido e fácil.</p>
            </div>

            <form onSubmit={handleCadastro}>
                <div style={inputGroupStyle}>
                    <PiUserBold size={20} color="#820AD1" />
                    <input name="username" placeholder="Nome de Usuário" value={form.username} onChange={handleChange} style={inputStyle} required />
                </div>

                <div style={inputGroupStyle}>
                    <PiEnvelopeSimpleBold size={20} color="#820AD1" />
                    <input name="email" type="email" placeholder="Seu E-mail" value={form.email} onChange={handleChange} style={inputStyle} required />
                </div>

                <div style={inputGroupStyle}>
                    <PiLockKeyBold size={20} color="#820AD1" />
                    <input name="senha" type="password" placeholder="Crie uma senha" value={form.senha} onChange={handleChange} style={inputStyle} required />
                </div>

                <button type="submit" disabled={loading} style={btnStyle}>
                    {loading ? 'Criando...' : 'CRIAR CONTA'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ color: '#080708ff', fontWeight: 'bold' }}>Já tenho conta</Link>
            </div>
        </div>
    )
}

const inputGroupStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px', marginBottom: '15px'
}

const inputStyle = {
    border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px'
}

const btnStyle = {
    width: '100%', padding: '12px', backgroundColor: '#820AD1', color: 'white',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
}

export default Cadastro