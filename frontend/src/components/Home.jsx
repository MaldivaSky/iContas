import { Link } from 'react-router-dom'

function Home() {
    return (
        <div style={{ fontFamily: 'Arial', textAlign: 'center', padding: '20px' }}>
            <h1 style={{ color: '#e1dadaff' }}>iContas Financeiro 💰</h1>
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

                {/* Botão 3: Ir para Extrato */}
                <Link to="/extrato" style={estiloBotao}>
                    📊 Ver Extrato
                </Link>  

                <Link to="/analise" style={{...estiloBotao, backgroundColor: '#6f42c1'}}> {/* Cor roxa para destacar */}
                    📈 Análise Gráfica
                </Link>
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