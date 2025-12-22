import { useState, useEffect } from 'react'
import api from '../api' // <--- USAR O NOSSO API
import { Link } from 'react-router-dom'
import { PiTrashBold, PiArrowUpBold, PiArrowDownBold } from "react-icons/pi"; // Ícones opcionais se tiver instalado

function Extrato() {
    const [transacoes, setTransacoes] = useState([])
    const [loading, setLoading] = useState(true)

    // Função que carrega os dados
    const carregarExtrato = async () => {
        try {
            // URL curta e limpa
            const resposta = await api.get('/extrato')
            setTransacoes(resposta.data)
        } catch (error) {
            console.error("Erro ao carregar extrato:", error)
            // Não redirecionamos mais aqui! O api.js faz isso se precisar.
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarExtrato()
    }, [])

    const deletarItem = async (id) => {
        if (!confirm("Tem certeza que deseja apagar?")) return;

        try {
            await api.delete(`/transacoes/${id}`)
            alert("Item apagado!")
            carregarExtrato() // Recarrega a lista
        } catch (error) {
            console.error(error)
            alert("Erro ao apagar item.")
        }
    }

    if (loading) return <div style={{ textAlign: 'center', marginTop: 20 }}>Carregando extrato...</div>

    return (
        <div style={{ padding: '0 20px', paddingBottom: '80px' }}>
            <h2 style={{ color: '#820AD1', textAlign: 'center' }}>Seu Extrato</h2>

            {transacoes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>Nenhuma movimentação ainda.</p>
            ) : (
                <div className="lista-transacoes">
                    {transacoes.map((item) => (
                        <div key={item.id} className="card-extrato" style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '15px',
                            marginBottom: '10px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: item.tipo === 'entrada' ? '5px solid #0dc325' : '5px solid #e63946'
                        }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '16px' }}>{item.descricao || "Sem descrição"}</strong>
                                <small style={{ color: '#888' }}>{item.data} • {item.categoria}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: item.tipo === 'entrada' ? '#0dc325' : '#e63946',
                                    fontSize: '16px'
                                }}>
                                    {item.tipo === 'entrada' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                                </div>
                                <button
                                    onClick={() => deletarItem(item.id)}
                                    style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', marginTop: '5px' }}
                                >
                                    <PiTrashBold size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Extrato