import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate()

    const nomeUsuario = localStorage.getItem('usuario_nome')
    const fotoUsuario = localStorage.getItem('usuario_foto')

    const sair = () => {
        if (confirm("Deseja realmente sair?")) {
            localStorage.clear()
            navigate('/login')
        }
    }

    if (!nomeUsuario) return null;

    const primeiroNome = nomeUsuario.split(' ')[0]

    return (
        <nav style={styles.container}>

            {/* --- LADO ESQUERDO: LOGO --- */}
            <Link to="/" style={styles.logoLink}>
                <img
                    src="/logo2.png"
                    alt="Logo iContas"
                    style={{ width: '180px', height: '120px' }}
                />
            </Link>

            {/* --- LADO DIREITO --- */}
            <div style={styles.rightArea}>

                {/* AGORA SIM: O Link envolve o Texto E a Foto.
            Clicou em qualquer lugar aqui -> Vai pro Perfil 
        */}
                <Link to="/perfil" style={styles.profileLink} title="Ver meu perfil">

                    <div style={styles.greetingBox}>
                        <span style={styles.greetingText}>Olá,</span>
                        <span style={styles.userName}>{primeiroNome}</span>
                    </div>

                    {fotoUsuario && fotoUsuario !== 'null' ? (
                        <img src={fotoUsuario} alt="Perfil" style={styles.avatarImg} />
                    ) : (
                        <div style={styles.avatarPlaceholder}>
                            {primeiroNome.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>

                {/* Divisória vertical sutil */}
                <div style={styles.divider}></div>

                {/* Botão Sair */}
                <button onClick={sair} style={styles.logoutBtn} title="Sair do sistema">
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
        backgroundColor: '#820AD1', // Roxo Nubank
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
    logoLink: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#fff'
    },
    logoIcon: { fontSize: '24px' },
    logoText: { fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' },

    rightArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px' // Espaço entre o perfil e o botão sair
    },

    // ESTILO DO LINK DO PERFIL (NOME + FOTO)
    profileLink: {
        textDecoration: 'none',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        padding: '5px 10px',
        borderRadius: '8px',
        transition: 'background 0.2s',
    },
    // Efeito Hover (opcional, simulação simples)
    // ':hover': { backgroundColor: 'rgba(255,255,255,0.1)' } <--- Em CSS puro seria assim

    greetingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        lineHeight: '1.2',
    },
    greetingText: { fontSize: '12px', opacity: 0.8 },
    userName: { fontWeight: '600', fontSize: '16px' },

    avatarImg: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(255,255,255,0.8)'
    },
    avatarPlaceholder: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '18px',
        border: '2px solid rgba(255,255,255,0.5)'
    },

    divider: {
        width: '1px',
        height: '30px',
        backgroundColor: 'rgba(255,255,255,0.2)'
    },

    logoutBtn: {
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.7)',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s'
    }
}

export default Navbar