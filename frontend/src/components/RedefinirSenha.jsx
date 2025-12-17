import { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom' // useParams pega o token da URL

function RedefinirSenha() {
    const { token } = useParams() // Pega o código gigante da URL
    const navigate = useNavigate()

    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')

    const salvarNovaSenha = (e) => {
        e.preventDefault()

        if (novaSenha !== confirmarSenha) {
            alert("As senhas não conferem!")
            return
        }

        // Enviamos o token no cabeçalho (Authorization) para o backend validar
        axios.post('http://127.0.0.1:5000/resetar-senha-token',
            { nova_senha: novaSenha },
            { headers: { Authorization: 'Bearer ' + token } }
        )
            .then(() => {
                alert('Senha alterada com sucesso! Você receberá um e-mail de confirmação.')
                navigate('/login')
            })
            .catch((error) => {
                console.error(error)
                alert('Link inválido ou expirado. Solicite um novo.')
                navigate('/esqueci-senha')
            })
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <h2 style={{ textAlign: 'center', color: '#820AD1' }}>Criar Nova Senha</h2>

            <form onSubmit={salvarNovaSenha}>
                <label>Nova Senha:</label>
                <input
                    type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    required placeholder="******" style={{ width: '100%', marginBottom: '10px' }}
                />

                <label>Confirme a Nova Senha:</label>
                <input
                    type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                    required placeholder="******" style={{ width: '100%', marginBottom: '20px' }}
                />

                <button type="submit" style={{
                    width: '100%', backgroundColor: '#28a745', color: 'white',
                    border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer'
                }}>
                    Salvar Nova Senha
                </button>
            </form>
        </div>
    )
}

export default RedefinirSenha