import { useState } from 'react'
import axios from 'axios'
import {  Link } from 'react-router-dom'

function Login() {
    
    // O login pode ser tanto o email quanto o username
    const [login, setLogin] = useState('')
    const [senha, setSenha] = useState('')

    const handleLogin = (e) => {
        e.preventDefault()

        axios.post('http://127.0.0.1:5000/login', {
            login: login,
            senha: senha
        })
            .then(res => {
                // O Python respondeu com sucesso!
                const dados = res.data

                // 1. Salva o Token (o crachá de segurança)
                localStorage.setItem('token', dados.token)

                // 2. Salva os dados para mostrar na Navbar
                localStorage.setItem('usuario_nome', dados.nome)

                // Se tiver foto, salva. Se não, salva 'null'
                if (dados.foto) {
                    localStorage.setItem('usuario_foto', dados.foto)
                } else {
                    localStorage.removeItem('usuario_foto')
                }

                // 3. Redireciona para a Home
                // O comando window.location.href força a página a recarregar
                // Isso é necessário para a Navbar perceber que o usuário logou
                window.location.href = "/"
            })
            .catch(erro => {
                console.error(erro)
                alert("Login incorreto! Verifique seus dados.")
            })
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#070707ff', margin: 0 }}>iContas 🔐</h1>
                <p style={{ color: '#ffffffff' }}>Entre para acessar suas finanças</p>
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
                        autoComplete="off"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        required
                        placeholder="Sua senha secreta"
                        style={{ width: '100%' }}
                        autoComplete="off"
                    />
                </div>

                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <Link to="/esqueci-senha" style={{ fontSize: '18px', color: '#000000ff', textDecoration: 'none' }}>
                        Esqueci minha senha
                    </Link>
                </div>

                <button type="submit" style={{ width: '100%', backgroundColor: '#0dc325ff', color: 'white', border: 'none' }}>
                    ENTRAR
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #000000ff', paddingTop: '15px' }}>
                <p style={{ fontSize: '14px', color: '#f6f6f6ff' }}>Ainda não tem conta?</p>
                <Link to="/cadastro" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#000000ff' }}>
                    CRIAR CONTA GRÁTIS
                </Link>
            </div>

        </div>
    )
}

export default Login