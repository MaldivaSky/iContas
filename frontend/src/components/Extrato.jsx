import { useState, useEffect } from 'react'
import api from '../api'
// NavBar já está no App.jsx global
import {
    PiTrashBold,
    PiPencilSimpleBold,
    PiMicrosoftExcelLogoFill,
    PiCheckBold,
    PiXBold,
    PiFunnelBold,      // Ícone para o filtro
    PiCalendarBlankBold // Ícone para data
} from "react-icons/pi";

import { toast } from 'react-toastify';

function Extrato() {
    const [transacoes, setTransacoes] = useState([])
    const [loading, setLoading] = useState(true)

    // --- NOVOS ESTADOS PARA OS FILTROS ---
    const [filtroTipo, setFiltroTipo] = useState('todos') // 'todos', 'entrada' ou 'saida'
    const [filtroMes, setFiltroMes] = useState('') // Formato 'YYYY-MM' (vazio = todas as datas)

    // Estados para Edição
    const [editandoId, setEditandoId] = useState(null)
    const [editandoTipo, setEditandoTipo] = useState(null)
    const [editDados, setEditDados] = useState({})

    const carregarExtrato = async () => {
        try {
            const resposta = await api.get('/extrato')
            setTransacoes(resposta.data)
        } catch (error) {
            console.error("Erro ao carregar extrato:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarExtrato()
    }, [])

    // --- LÓGICA DE FILTRAGEM ---
    // Criamos uma lista nova baseada nas escolhas do usuário
    const transacoesFiltradas = transacoes.filter((item) => {
        // 1. Filtro por Tipo
        if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) {
            return false;
        }
        // 2. Filtro por Mês (A data vem como YYYY-MM-DD, pegamos só os 7 primeiros chars)
        if (filtroMes && !item.data.startsWith(filtroMes)) {
            return false;
        }
        return true;
    });

    // --- CÁLCULOS (Agora baseados na lista FILTRADA) ---
    const totalEntradas = transacoesFiltradas
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, curr) => acc + curr.valor, 0);

    const totalSaidas = transacoesFiltradas
        .filter(t => t.tipo === 'saida')
        .reduce((acc, curr) => acc + curr.valor, 0);

    const saldoAtual = totalEntradas - totalSaidas;

    // --- AÇÕES ---
    const deletarItem = async (id, tipo) => {
        if (!confirm("Tem certeza que deseja apagar?")) return;
        try {
            await api.delete(`/transacoes/${tipo}/${id}`)
            toast.success("Item apagado!")
            carregarExtrato()
        } catch (error) {
            console.error(error);
            toast("Erro ao apagar item.")
        }
    }

    const exportarExcel = async () => {
        try {
            const response = await api.get('/exportar', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'relatorio_financeiro.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao exportar.")
        }
    }

    // --- EDIÇÃO ---
    const iniciarEdicao = (item) => {
        setEditandoId(item.id)
        setEditandoTipo(item.tipo)
        setEditDados({
            descricao: item.descricao,
            valor: item.valor,
            data: item.data
        })
    }

    const cancelarEdicao = () => {
        setEditandoId(null)
        setEditandoTipo(null)
        setEditDados({})
    }

    const salvarEdicao = async () => {
        try {
            await api.put(`/transacoes/${editandoTipo}/${editandoId}`, editDados)
            toast.success("Atualizado com sucesso!")
            cancelarEdicao()
            carregarExtrato()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar edição.")
        }
    }

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50, color: '#820AD1' }}>Carregando extrato...</div>

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '80px' }}>

            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ color: '#820AD1', textAlign: 'center', marginBottom: '20px' }}>Extrato Detalhado</h2>

                {/* --- ÁREA DE FILTROS (NOVO) --- */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '15px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                        <PiFunnelBold size={18} color="#820AD1" /> FILTRAR POR:
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>

                        {/* Botões de Tipo */}
                        <div style={{ display: 'flex', gap: '5px', background: '#f0f0f0', padding: '5px', borderRadius: '10px' }}>
                            <button
                                onClick={() => setFiltroTipo('todos')}
                                style={filtroTipo === 'todos' ? btnFiltroAtivo : btnFiltroInativo}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltroTipo('entrada')}
                                style={filtroTipo === 'entrada' ? btnFiltroAtivo : btnFiltroInativo}
                            >
                                Entradas
                            </button>
                            <button
                                onClick={() => setFiltroTipo('saida')}
                                style={filtroTipo === 'saida' ? btnFiltroAtivo : btnFiltroInativo}
                            >
                                Saídas
                            </button>
                        </div>

                        {/* Seletor de Mês */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <PiCalendarBlankBold size={24} color="#820AD1" />
                            <input
                                type="month"
                                value={filtroMes}
                                onChange={(e) => setFiltroMes(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    color: '#333',
                                    fontFamily: 'inherit'
                                }}
                            />
                            {/* Botão limpar data */}
                            {filtroMes && (
                                <button
                                    onClick={() => setFiltroMes('')}
                                    style={{ border: 'none', background: 'transparent', color: '#e63946', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                >
                                    Limpar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAINEL DE RESUMO (Agora obedece aos filtros!) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, background: '#d4edda', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #c3e6cb' }}>
                        <small style={{ color: '#155724' }}>Entradas</small>
                        <h3 style={{ color: '#155724', margin: 0 }}>R$ {totalEntradas.toFixed(2)}</h3>
                    </div>
                    <div style={{ flex: 1, background: '#f8d7da', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #f5c6cb' }}>
                        <small style={{ color: '#721c24' }}>Saídas</small>
                        <h3 style={{ color: '#721c24', margin: 0 }}>R$ {totalSaidas.toFixed(2)}</h3>
                    </div>
                    <div style={{ flex: 1, background: 'black', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #000' }}>
                        <small style={{ color: '#ccc' }}>Saldo</small>
                        <h3 style={{ color: saldoAtual >= 0 ? '#0dc325' : '#e63946', margin: 0 }}>R$ {saldoAtual.toFixed(2)}</h3>
                    </div>
                </div>

                {/* BOTÃO EXPORTAR */}
                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <button
                        onClick={exportarExcel}
                        style={{
                            backgroundColor: '#217346',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        <PiMicrosoftExcelLogoFill size={20} /> Exportar Excel
                    </button>
                </div>

                {/* LISTA DE TRANSAÇÕES (FILTRADA) */}
                {transacoesFiltradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <p>Nenhuma transação encontrada com estes filtros.</p>
                        <button onClick={() => { setFiltroTipo('todos'); setFiltroMes(''); }} style={{ marginTop: '10px', color: '#820AD1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <div className="lista-transacoes">
                        {transacoesFiltradas.map((item) => (
                            <div
                                key={`${item.tipo}-${item.id}`}
                                className="card-extrato"
                                style={{
                                    backgroundColor: 'white',
                                    padding: '15px',
                                    borderRadius: '15px',
                                    marginBottom: '10px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    borderLeft: item.tipo === 'entrada' ? '5px solid #0dc325' : '5px solid #e63946'
                                }}>

                                {editandoId === item.id && editandoTipo === item.tipo ? (
                                    // MODO EDIÇÃO
                                    <div style={{ width: '100%' }}>
                                        <input type="text" value={editDados.descricao} onChange={e => setEditDados({ ...editDados, descricao: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 5 }} />
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <input type="number" value={editDados.valor} onChange={e => setEditDados({ ...editDados, valor: e.target.value })} style={{ flex: 1, padding: 8 }} />
                                            <input type="date" value={editDados.data} onChange={e => setEditDados({ ...editDados, data: e.target.value })} style={{ padding: 8 }} />
                                        </div>
                                        <div style={{ marginTop: 10, textAlign: 'right' }}>
                                            <button onClick={salvarEdicao} style={{ background: '#0dc325', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, marginRight: 5 }}>Salvar</button>
                                            <button onClick={cancelarEdicao} style={{ background: '#ccc', border: 'none', padding: '5px 10px', borderRadius: 5 }}>Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    // MODO VISUALIZAÇÃO
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '16px' }}>{item.descricao}</strong>
                                            <small style={{ color: '#888' }}>{item.data} • {item.categoria}</small>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: item.tipo === 'entrada' ? '#0dc325' : '#e63946', fontSize: '16px' }}>
                                                {item.tipo === 'entrada' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                                            </div>
                                            <div style={{ marginTop: '5px' }}>
                                                <button onClick={() => iniciarEdicao(item)} style={{ background: 'none', border: 'none', color: '#820AD1', cursor: 'pointer', marginRight: 10 }}><PiPencilSimpleBold size={20} /></button>
                                                <button onClick={() => deletarItem(item.id, item.tipo)} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer' }}><PiTrashBold size={20} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- ESTILOS DOS BOTÕES DE FILTRO ---
const btnFiltroAtivo = {
    backgroundColor: '#820AD1',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.2s'
}

const btnFiltroInativo = {
    backgroundColor: 'transparent',
    color: '#555',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.2s'
}

export default Extrato