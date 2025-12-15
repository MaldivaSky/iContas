import { Link } from 'react-router-dom'

function Home() {
    return (
        <div style={{ fontFamily: 'Arial', textAlign: 'center', padding: '20px' }}>
            <h1 style={{ color: '#333' }}>iContas Financeiro 💰</h1>
            <p>O que você deseja fazer hoje?</p>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                maxWidth: '300px',
                margin: '30px auto'
            }}>

                {/* Botão 1: Ir para Categorias */}
                <Link to="/categorias" style={estiloBotao}>
                    📂 Nova Categoria
                </Link>

                {/* Botão 2: Ir para Transações */}
                <Link to="/transacoes" style={estiloBotao}>
                    💸 Lançar Entrada/Saída
                </Link>

                {/* Futuro Botão: Extrato (Deixamos pronto mas desativado visualmente) */}
                <button style={{ ...estiloBotao, backgroundColor: '#ccc', cursor: 'not-allowed' }} disabled>
                    📊 Ver Extrato (Em breve)
                </button>

            </div>
        </div>
    )
}

// Um estilo simples para os botões ficarem bonitos
const estiloBotao = {
    padding: '15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    border: 'none',
    display: 'block'
}

export default Home