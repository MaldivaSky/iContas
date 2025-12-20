import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function Extrato() {
    const [lista, setLista] = useState([])
    const [filtro, setFiltro] = useState('todos') // 'todos', 'entrada', 'saida'

    useEffect(() => {
        axios.get('https://icontas.onrender.com/extrato')
            .then(res => setLista(res.data))
            .catch(erro => console.error(erro))
    }, [])

    // CÁLCULOS DO DASHBOARD (Feitos na hora pelo React)
    const totalEntradas = lista
        .filter(item => item.tipo === 'entrada')
        .reduce((acc, item) => acc + item.valor, 0)

    const totalSaidas = lista
        .filter(item => item.tipo === 'saida')
        .reduce((acc, item) => acc + item.valor, 0)

    const saldo = totalEntradas - totalSaidas

    // Lógica do Filtro visual
    const listaFiltrada = lista.filter(item => {
        if (filtro === 'todos') return true
        return item.tipo === filtro
    })

    return (
        <div style={{ fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto', padding: '10px' }}>

            {/* CABEÇALHO COM BOTÃO VOLTAR */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', marginRight: '15px' }}>⬅</Link>
                <h2 style={{ margin: 0 }}>Extrato Financeiro</h2>
            </div>

            {/* --- DASHBOARD (RESUMO) --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ flex: 1, backgroundColor: '#080808ff', padding: '15px', borderRadius: '8px' }}>
                    <span style={{ color: '#0cea3fff' }}>Entradas</span>
                    <h3>R$ {totalEntradas.toFixed(2)}</h3>
                </div>
                <div style={{ flex: 1, backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
                    <span style={{ color: '#721c24' }}>Saídas</span>
                    <h3 style={{ color: '#fd0820ff' }}>R$ {totalSaidas.toFixed(2)}</h3>
                </div>
                <div style={{ flex: 1, backgroundColor: '#cce5ff', padding: '15px', borderRadius: '8px' }}>
                    <span style={{ color: '#004085' }}>Saldo</span>
                    <h3 style={{ color: saldo >= 0 ? 'green' : 'red' }}>
                        R$ {saldo.toFixed(2)}
                    </h3>
                </div>
            </div>

            {/* --- BOTÕES DE FILTRO --- */}
            <div style={{ marginBottom: '20px' }}>
                {['todos', 'entrada', 'saida'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        style={{
                            padding: '8px 16px',
                            marginRight: '10px',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            backgroundColor: filtro === f ? '#333' : '#eee',
                            color: filtro === f ? 'white' : 'black',
                            textTransform: 'capitalize'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* --- LISTA DE TRANSAÇÕES --- */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {listaFiltrada.map(item => (
                    <li key={item.id + item.tipo} style={{
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #eee',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>

                        {/* LADO ESQUERDO: Data e Descrição */}
                        <div>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                                {item.data.split('-').reverse().join('/')} • {item.categoria}
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                {item.descricao || "Sem descrição"}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                                {item.origem} {item.local ? `• 📍 ${item.local}` : ''}
                            </div>
                        </div>

                        {/* LADO DIREITO: Valor */}
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '18px',
                            color: item.tipo === 'entrada' ? 'green' : '#dc3545'
                        }}>
                            {item.tipo === 'entrada' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                        </div>

                    </li>
                ))}

                {listaFiltrada.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', marginTop: '30px' }}>
                        Nenhuma movimentação encontrada.
                    </p>
                )}
            </ul>
        </div>
    )
}

export default Extrato