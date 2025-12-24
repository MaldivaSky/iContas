import { useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify';

function EsqueciSenha() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const enviarLink = (e) => {
        e.preventDefault()
        setLoading(true)

        api.post('/esqueci-senha', { email })
            .then(() => {
                toast('Boa! Verifique seu e-mail (e a caixa de spam). O link dura 15 minutos.')
                setEmail('')
            })
            .catch(() => toast.error('E-mail não encontrado ou erro no envio.'))
            .finally(() => setLoading(false))
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <h2 style={{ textAlign: 'center', color: '#000001ff' }}>Recuperar Senha</h2>
            <p style={{ textAlign: 'center', color: '#ffffffff' }}>Enviaremos um link mágico para você.</p>

            <form onSubmit={enviarLink}>
                <label>Seu E-mail Cadastrado:</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="exemplo@email.com"
                    style={{ width: '100%', marginBottom: '20px', padding: '10px' }}
                />

                <button type="submit" disabled={loading} style={{
                    width: '100%', backgroundColor: '#820AD1', color: 'white',
                    border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', opacity: loading ? 0.7 : 1
                }}>
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>Voltar para Login</Link>
            </div>
        </div>
    )
}

export default EsqueciSenha