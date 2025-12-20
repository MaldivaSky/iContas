import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Cadastro() {
    const navigate = useNavigate()

    // Estados para todos os campos
    const [nomeCompleto, setNomeCompleto] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [nascimento, setNascimento] = useState('')
    const [foto, setFoto] = useState(null)

    // Estado apenas visual (para mostrar a foto antes de enviar)
    const [preview, setPreview] = useState(null)

    const handleFileChange = (e) => {
        const arquivo = e.target.files[0]
        if (arquivo) {
            setFoto(arquivo)
            // Cria uma URL temporária só para mostrar na tela
            setPreview(URL.createObjectURL(arquivo))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // O SEGREDO DO UPLOAD: Usar FormData em vez de objeto comum
        const formData = new FormData()
        formData.append('nome_completo', nomeCompleto)
        formData.append('username', username)
        formData.append('email', email)
        formData.append('senha', senha)
        formData.append('nascimento', nascimento)
        if (foto) {
            formData.append('foto', foto)
        }

        axios.post('https://icontas.onrender.com/registro', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Avisa o Python que tem arquivo indo
            }
        })
            .then(() => {
                alert('Conta criada com sucesso! Agora faça login.')
                setNomeCompleto('')
                setUsername('')
                setEmail('')
                setSenha('')
                setFoto(null)
                setPreview(null)
                
                navigate('/login') // Manda o usuário para a tela de login
            })
            .catch(erro => {
                console.error(erro)
                alert(erro.response?.data?.erro || "Erro ao cadastrar")
            })
    }

    return (
        <div className="card-responsivo">
            <h2 style={{ textAlign: 'center', color: '#010203ff' }}>Crie sua conta</h2>
            <p style={{ textAlign: 'center', color: '#fffdfdff', marginBottom: '20px' }}>
                Comece a controlar suas finanças hoje.
            </p>

            <form onSubmit={handleSubmit} autoComplete="off">

                {/* --- ÁREA DA FOTO --- */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#eee',
                        backgroundImage: `url(${preview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '3px solid #000000ff',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}>
                        {!preview && <span style={{ fontSize: '40px', color: '#ccc' }}>📷</span>}
                    </div>

                    <label style={{
                        cursor: 'pointer',
                        color: '#000000ff',
                        fontWeight: 'bold',
                        padding: '5px 10px',
                        border: '1px solid #ffffffff',
                        borderRadius: '5px'
                    }}>
                        Escolher Foto
                        <input type="file" autoComplete="off" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    </label>
                </div>

                <label>Nome Completo:</label>
                <input type="text" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} required placeholder="Ex: Rafael Silva" style={{ width: '100%', marginBottom: '10px' }} />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Usuário (Login):</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="@rafael" style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Nascimento:</label>
                        <input type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} required style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                </div>

                <label>Email:</label>
                <input type="email" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={{ width: '100%', marginBottom: '10px' }} />

                <label>Senha:</label>
                <input type="password" autoComplete="new-password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="******" style={{ width: '100%', marginBottom: '20px' }} />

                <button type="submit" style={{ width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none' }}>
                    Criar Conta
                </button>

            </form>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                Já tem conta? <Link to="/login" style={{ color: '#007bff' }}>Fazer Login</Link>
            </div>
        </div>
    )
}

export default Cadastro