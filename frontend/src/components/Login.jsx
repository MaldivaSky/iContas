import { useState } from 'react'
import api from '../api' 
import { Link, useNavigate } from 'react-router-dom' // useNavigate é mais moderno
import { toast } from 'react-toastify';


function Login() {
    const [login, setLogin] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false) // Para desabilitar o botão enquanto carrega
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Usa 'api' em vez de 'axios' direto
            const resposta = await api.post('/login', {
                login: login.trim(), // Remove espaços acidentais
                senha: senha
            })

            const dados = resposta.data

            // Salva tudo
            localStorage.setItem('usuario_dados', JSON.stringify(dados));
            localStorage.setItem('token', dados.token);
            

            // Redireciona
            navigate('/')
            window.location.reload() // Garante que a Navbar atualize

        } catch (error) {
            console.error("Erro no login:", error)

            // Tratamento de erro detalhado
            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("Usuário ou senha incorretos! Tente novamente.")
                } else if (error.response.status === 500) {
                    toast.error("Erro no Servidor! O banco de dados pode estar desconectado.")
                } else {
                    toast.error(`Erro desconhecido: ${error.response.status}`)
                }
            } else {
                toast.error("Erro de conexão. Verifique sua internet.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '210px', height: 'auto' }} />
                <p style={{ color: '#000000ff' }}>Entre para acessar suas finanças</p>
            </div>

            <form onSubmit={handleLogin} autoComplete="off">
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>E-mail ou Usuário:</label>
                    <input
                        type="text"
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        required
                        placeholder="Digite seu login..."
                        style={{ width: '100%', padding: '10px' }}
                    />
                </div>

                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        required
                        placeholder="Sua senha secreta"
                        style={{ width: '100%', padding: '10px' }}
                    />
                </div>

                <div style={{ textAlign: 'center', marginTop: '5px', marginBottom: '20px' }}>
                    <Link to="/esqueci-senha" style={{ fontSize: '14px', color: '#000000ff' }}>Esqueci minha senha</Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        backgroundColor: '#0dc325',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}>
                    {loading ? 'Entrando...' : 'ENTRAR'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/cadastro" style={{ fontWeight: 'bold', color: '#090909ff' }}>
                    CRIAR CONTA GRÁTIS
                </Link>
            </div>
            
        </div>
    )
}

export default Login