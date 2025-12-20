import { useState } from 'react' // <--- Adicionei useState e useEffect
import { Link } from 'react-router-dom'
import './Home.css'


function Home() {
    // CORREÇÃO: Lê o localStorage direto na criação (Lazy Initialization)
    // Isso remove o erro do useEffect e é mais rápido
    const [nomeUsuario] = useState(() => {
        return localStorage.getItem('usuario_nome') || 'Visitante'
    })
    const fotoUsuario = localStorage.getItem('usuario_foto')
    return (
        <div style={{ paddingBottom: '40px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>

            {/* Cabeçalho Estilo App */}
            <div style={{
                backgroundColor: '#820AD1',
                padding: '40px 20px 30px 20px',
                color: 'white',
                borderBottomLeftRadius: '30px',
                borderBottomRightRadius: '30px',
                marginBottom: '25px',
                boxShadow: '0 4px 15px rgba(130, 10, 209, 0.3)',
                textAlign: 'center'
            }}>

                {/* LOGO */}
                
                <img
                    src={fotoUsuario}
                    alt="Perfil"
                    style={{
                        width: '90px',     // Tamanho fixo
                        height: '90px',    // Tamanho fixo
                        borderRadius: '50%', // O SEGREDO: Deixa Redondo
                        objectFit: 'cover',  // Evita que a foto fique "esmagada" se não for quadrada
                        border: '3px solid white', // (Opcional) Fica bonito uma borda branca no fundo roxo
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)' // (Opcional) Uma sombrinha para destacar
                    }}
                />
                
                {/* --- AQUI ESTÁ A CORREÇÃO: Nome Dinâmico --- */}
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                    Olá, {nomeUsuario}! 👋
                </h1>

                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px' }}>Controle Financeiro iContas</p>
            </div>

            <div style={{ padding: '0 20px' }}>
                <h3 style={{ color: '#820AD1', marginBottom: '20px', textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Menu Principal
                </h3>

                {/* Grid do Menu */}
                <div className="menu-grid">

                    <Link to="/transacoes" className="card-menu">
                        <div style={{ fontSize: '35px', marginBottom: '10px' }}>💸</div>
                        <strong>Registrar</strong>
                    </Link>

                    <Link to="/extrato" className="card-menu">
                        <div style={{ fontSize: '35px', marginBottom: '10px' }}>📊</div>
                        <strong>Extrato</strong>
                    </Link>

                    <Link to="/analise" className="card-menu">
                        <div style={{ fontSize: '35px', marginBottom: '10px' }}>📈</div>
                        <strong>Gráficos</strong>
                    </Link>

                    <Link to="/categorias" className="card-menu">
                        <div style={{ fontSize: '35px', marginBottom: '10px' }}>📂</div>
                        <strong>Categorias</strong>
                    </Link>

                    <Link to="/calculadora" className="card-menu">
                        <div style={{ fontSize: '35px', marginBottom: '10px' }}>🧮</div>
                        <strong>Calculadora</strong>
                    </Link>

                </div>
            </div>

        </div>
    )
}

export default Home