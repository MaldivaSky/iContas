import { useState, useEffect } from 'react'
import api from '../api'
import { Link, useNavigate } from 'react-router-dom'

function Perfil() {
    const navigate = useNavigate()

    // ESTADOS (Variáveis da tela)
    const [dados, setDados] = useState(null)
    const [loading, setLoading] = useState(true)       // Carregamento da página
    const [loadingFoto, setLoadingFoto] = useState(false) // Carregamento do upload da foto

    // 1. FUNÇÃO DE BUSCAR DADOS
    // (Definida antes do useEffect para evitar erro de ordem)
    const carregarDados = () => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        api.get('/meus-dados')
            .then(res => {
                setDados(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                // Se o token for inválido, limpa e sai
                if (err.response && (err.response.status === 401 || err.response.status === 422)) {
                    localStorage.clear()
                    window.location.href = '/login'
                }
                setLoading(false)
            })
    }

    // 2. USE EFFECT (Roda ao abrir a tela)
    useEffect(() => {
        carregarDados()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 3. FUNÇÃO DE TROCAR A FOTO
    const handleTrocarFoto = (e) => {
        const arquivo = e.target.files[0]
        if (!arquivo) return

        setLoadingFoto(true) // Ativa o "Carregando..." da foto

        const formData = new FormData()
        formData.append('foto', arquivo)

        api.post('/atualizar-foto', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                // Salva a nova foto no navegador
                localStorage.setItem('usuario_foto', res.data.nova_foto)
                alert('Foto atualizada!')
                window.location.reload() // Recarrega para atualizar a Navbar
            })
            .catch(erro => {
                console.error(erro)
                alert('Erro ao enviar foto.')
                setLoadingFoto(false) // Desativa o carregando se der erro
            })
    }

  

    // Se a página ainda estiver carregando os dados iniciais
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando...</div>
    }

    // Proteção extra caso dados venha nulo
    if (!dados) return null;

    return (
        <div className="card-responsivo" style={{ maxWidth: '500px', margin: '30px auto' }}>

            {/* CABEÇALHO */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', marginRight: '15px', color: '#ffffffff' }}>⬅</Link>
                <h2 style={{ margin: 0, color: '#000000ff' }}>Editar Perfil</h2>
            </div>

            {/* FOTO E UPLOAD */}
            <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>

                    {/* AQUI ESTÁ O USO DO loadingFoto: Mudamos a opacidade se estiver carregando */}
                    <img
                        src={dados.foto || "https://via.placeholder.com/150"}
                        alt="Perfil"
                        style={{
                            width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                            border: '4px solid #820AD1',
                            opacity: loadingFoto ? 0.5 : 1, // <--- USO DA VARIÁVEL AQUI
                            transition: 'opacity 0.3s'
                        }}
                    />

                    {/* ÍCONE DA CÂMERA / LOADING */}
                    <label style={{
                        position: 'absolute', bottom: '0', right: '0', backgroundColor: '#820AD1',
                        width: '40px', height: '40px', borderRadius: '50%',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: loadingFoto ? 'wait' : 'pointer',
                        border: '3px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#fff'
                    }}>
                        {/* Se loadingFoto for true, mostra ampulheta, senão mostra câmera */}
                        <span style={{ fontSize: '20px' }}>
                            {loadingFoto ? '⏳' : '📷'}
                        </span>

                        <input
                            type="file"
                            onChange={handleTrocarFoto}
                            accept="image/*"
                            disabled={loadingFoto} // Bloqueia input enquanto carrega
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <h3 style={{ marginTop: '15px', marginBottom: '5px' }}>{dados.nome_completo}</h3>
                <p style={{ color: '#ffffffff', margin: 0 }}>@{dados.username}</p>
            </div>

            {/* DADOS DO USUÁRIO */}
            <div style={{ backgroundColor: '#f0f0f5', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>📧 Email:</strong> {dados.email}</p>
                <p style={{ margin: 0 }}><strong>🎂 Nascimento:</strong> {dados.nascimento ? dados.nascimento.split('-').reverse().join('/') : '-'}</p>
            </div>

          
            
        </div>
    )
}

export default Perfil