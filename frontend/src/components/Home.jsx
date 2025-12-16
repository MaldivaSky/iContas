import { Link } from 'react-router-dom'

function Home() {
    return (
        <div style={{ paddingBottom: '40px' }}>

            {/* Cabeçalho Estilo App */}
            <div style={{ backgroundColor: '#9c05b3ff', padding: '30px 20px', color: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,123,255,0.3)' }}>
                <h1 style={{ margin: 0, fontSize: '24px', textAlign: 'center' }}>Olá, Rafael! 👋</h1>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9 , textAlign: 'center'}}>Controle Financeiro iContas</p>
            </div>

            <div style={{ padding: '0 20px' }}>
                <h3 style={{ color: '#f69cf7ff', marginBottom: '15px', textAlign: 'center' }}>O que vamos fazer?</h3>

                {/* Usando a classe do CSS novo para responsividade */}
                <div className="menu-grid">

                    <Link to="/transacoes" style={estiloCard}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>💸</div>
                        <strong>Registrar Transação</strong>
                    </Link>

                    <Link to="/extrato" style={estiloCard}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📊</div>
                        <strong>Ver Extrato</strong>
                    </Link>

                    <Link to="/analise" style={estiloCard}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📈</div>
                        <strong>Gráficos e Mapa</strong>
                    </Link>

                    <Link to="/categorias" style={estiloCard}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📂</div>
                        <strong>Cadastro Categorias</strong>
                    </Link>

                    <Link to="/calculadora" style={estiloCard}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🧮</div>
                        <strong>Calculadora</strong>
                    </Link>

                </div>
            </div>

        </div>
    )
}

const estiloCard = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    textDecoration: 'none',
    color: '#333',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #eee'
}

export default Home