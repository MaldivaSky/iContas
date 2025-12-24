import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' // Removi o useNavigate daqui
import api from '../api'

function Navbar() {
    // Removi a linha: const navigate = useNavigate()

    const [dadosUser, setDadosUser] = useState({ nome: '', foto: null })

    useEffect(() => {
        async function carregarDados() {
            try {
                const res = await api.get('/meus-dados')
                const nomeCompleto = res.data.nome_completo || res.data.username;
                const primeiroNome = nomeCompleto.split(' ')[0];

                setDadosUser({
                    nome: primeiroNome,
                    foto: res.data.foto
                })
            } catch (error) {
                console.error("Erro ao carregar topo:", error)
            }
        }
        carregarDados()
    }, [])

    const sair = () => {
        if (confirm("Deseja realmente sair?")) {
            localStorage.clear()
            // Mantemos o window.location.href pois ele garante que limpa a memória do app
            window.location.href = '/login'
        }
    }

    if (!dadosUser.nome) return null;

    return (
        <nav style={styles.container}>
            <Link to="/" style={styles.logoLink}>
                <img src="/logo2.png" alt="Logo" style={{ width: '120px', height: 'auto' }} />
            </Link>

            <div style={styles.rightArea}>
                <Link to="/perfil" style={styles.profileLink} title="Ver meu perfil">
                    <div style={styles.greetingBox}>
                        <span style={styles.greetingText}>Olá,</span>
                        <span style={styles.userName}>{dadosUser.nome}</span>
                    </div>

                    {dadosUser.foto ? (
                        <img src={dadosUser.foto} alt="Perfil" style={styles.avatarImg} />
                    ) : (
                        <div style={styles.avatarPlaceholder}>
                            {dadosUser.nome.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>

                <div style={styles.divider}></div>

                <button onClick={sair} style={styles.logoutBtn} title="Sair">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </nav>
    )
}

const styles = {
    container: {
        backgroundColor: '#820AD1',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        color: '#fff'
    },
    logoLink: { display: 'flex', alignItems: 'center' },
    rightArea: { display: 'flex', alignItems: 'center', gap: '15px' },
    profileLink: { textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    greetingBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' },
    greetingText: { fontSize: '12px', opacity: 0.8 },
    userName: { fontWeight: '600', fontSize: '16px', textTransform: 'capitalize' },
    avatarImg: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', backgroundColor: 'white' },
    avatarPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px', border: '2px solid rgba(255,255,255,0.5)' },
    divider: { width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.2)' },
    logoutBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }
}

export default Navbar