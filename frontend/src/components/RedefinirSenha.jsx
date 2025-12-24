import { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
// 1. IMPORTAR O TOAST
import { toast } from 'react-toastify';

function RedefinirSenha() {
    const { token } = useParams()
    const navigate = useNavigate()

    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    // const [erro, setErro] = useState('') // Não precisamos mais exibir erro em texto feio na tela!

    const validarSenhaForte = (senha) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(senha);
    }

    const salvarNovaSenha = async (e) => {
        e.preventDefault()
        // setErro('')

        if (novaSenha !== confirmarSenha) {
            // 2. SUBSTITUINDO ALERT/ERRO
            toast.warn("As senhas não conferem!"); // Warn = Amarelo (Aviso)
            return
        }

        if (!validarSenhaForte(novaSenha)) {
            toast.error("Senha fraca! Use maiúscula, número e símbolo."); // Error = Vermelho
            return
        }

        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const baseURL = isLocal ? "http://127.0.0.1:5000" : "https://icontas.onrender.com";

        try {
            await axios.post(`${baseURL}/resetar-senha-token`,
                { nova_senha: novaSenha },
                { headers: { Authorization: 'Bearer ' + token } }
            )

            // 3. SUCESSO = Verde
            toast.success("Senha alterada com sucesso! Faça login.");
            navigate('/login')
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.erro || 'Link inválido ou expirado.'
            toast.error(msg);
        }
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <h2 style={{ textAlign: 'center', color: '#820AD1' }}>Criar Nova Senha</h2>

            <form onSubmit={salvarNovaSenha}>
                {/* Campos de input iguais... */}
                <label style={{ fontWeight: 'bold' }}>Nova Senha:</label>
                <input
                    type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    required placeholder="Ex: SenhaForte1!" style={{ width: '100%', padding: 10, marginBottom: '10px', borderRadius: 5, border: '1px solid #ccc' }}
                />

                <label style={{ fontWeight: 'bold' }}>Confirme a Nova Senha:</label>
                <input
                    type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                    required placeholder="Repita a senha" style={{ width: '100%', padding: 10, marginBottom: '20px', borderRadius: 5, border: '1px solid #ccc' }}
                />

                {/* Removi o <p>{erro}</p> pois o toast já avisa */}

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