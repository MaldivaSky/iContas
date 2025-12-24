import { useState } from 'react'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'

function RedefinirSenha() {
    const { token } = useParams()
    const navigate = useNavigate()

    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [erro, setErro] = useState('')

    const validarSenhaForte = (senha) => {
        // Regex: Min 6, 1 Maiúscula, 1 Número, 1 Especial
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(senha);
    }

    const salvarNovaSenha = async (e) => {
        e.preventDefault()
        setErro('')

        if (novaSenha !== confirmarSenha) {
            setErro("As senhas não conferem!")
            return
        }

        if (!validarSenhaForte(novaSenha)) {
            setErro("Senha fraca: use min. 6 caracteres, 1 maiúscula, 1 número e 1 símbolo.")
            return
        }

        try {
            await api.post('/resetar-senha-token',
                { nova_senha: novaSenha },
                { headers: { Authorization: 'Bearer ' + token } }
            )
            alert('✅ Senha alterada com sucesso! Redirecionando...')
            navigate('/login')
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.erro || 'Link inválido ou expirado.'
            alert(msg)
        }
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <h2 style={{ textAlign: 'center', color: '#820AD1' }}>Criar Nova Senha</h2>

            <form onSubmit={salvarNovaSenha}>
                <label style={{ fontWeight: 'bold' }}>Nova Senha:</label>
                <input
                    type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    required placeholder="Ex: SenhaForte1!" style={{ width: '100%', padding: 10, marginBottom: '10px', borderRadius: 5, border: '1px solid #ccc' }}
                />
                <small style={{ display: 'block', marginBottom: 15, color: '#666', fontSize: 12 }}>
                    Mínimo 6 caracteres, 1 maiúscula, 1 número e 1 símbolo.
                </small>

                <label style={{ fontWeight: 'bold' }}>Confirme a Nova Senha:</label>
                <input
                    type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                    required placeholder="Repita a senha" style={{ width: '100%', padding: 10, marginBottom: '20px', borderRadius: 5, border: '1px solid #ccc' }}
                />

                {erro && <p style={{ color: 'red', textAlign: 'center', marginBottom: 15 }}>{erro}</p>}

                <button type="submit" style={{
                    width: '100%', backgroundColor: '#0dc325', color: 'white', fontWeight: 'bold',
                    border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer'
                }}>
                    Salvar Nova Senha
                </button>
            </form>
        </div>
    )
}

export default RedefinirSenha