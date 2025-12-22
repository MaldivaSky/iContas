import { useState, useEffect } from 'react'
import api from '../api'

function FormularioCategoria() {
    const [principal, setPrincipal] = useState('')
    const [estabelecimento, setEstabelecimento] = useState('')
    const [lista, setLista] = useState([])
    const [idEditando, setIdEditando] = useState(null)

    // NOVO: Estado para controlar a ordenação ('id' ou 'az')
    const [ordenacao, setOrdenacao] = useState('az')

    // 1. Função definida ANTES de ser usada
    const carregarCategorias = () => {
        api.get('/categorias')
            .then(res => setLista(res.data))
            .catch(erro => console.error("Erro ao ler categorias", erro))
    }

    useEffect(() => {
        carregarCategorias()
    }, [])

    const salvarCategoria = (e) => {
        e.preventDefault()

        const dados = { principal, estabelecimento }

        if (idEditando) {
            // Editar (PUT)
            api.put(`/categorias/${idEditando}`, dados)
                .then(() => {
                    alert('Categoria atualizada!')
                    limparFormulario()
                    carregarCategorias()
                })
                .catch(erro => {
                    console.error(erro)
                    alert('Erro ao atualizar. Veja o console para detalhes.')
                })
        } else {
            // Criar (POST)
            api.post('/categorias', dados)
                .then(() => {
                    alert('Categoria criada!')
                    limparFormulario()
                    carregarCategorias()
                })
                .catch(erro => {
                    console.error(erro)
                    alert('Erro ao criar. Veja o console para detalhes.')
                })
        }
    }

    const excluir = (id) => {
        if (confirm("Tem certeza que deseja excluir esta categoria?")) {
            api.delete(`/categorias/${id}`)
                .then(() => {
                    carregarCategorias()
                })
                .catch(erro => {
                    console.error(erro)
                    alert('Erro ao excluir. Talvez ela esteja em uso.')
                })
        }
    }

    const editar = (cat) => {
        setPrincipal(cat.principal)
        setEstabelecimento(cat.estabelecimento)
        setIdEditando(cat.id)
    }

    const limparFormulario = () => {
        setPrincipal('')
        setEstabelecimento('')
        setIdEditando(null)
    }

    // --- MÁGICA DA ORDENAÇÃO AQUI ---
    // Criamos uma cópia da lista e ordenamos ela antes de mostrar na tela
    const listaOrdenada = [...lista].sort((a, b) => {
        if (ordenacao === 'az') {
            // Compara textos (A-Z)
            return a.principal.localeCompare(b.principal)
        } else {
            // Compara números (ID menor para o maior = Ordem de cadastro)
            return b.id - a.id // (Inverti para mostrar as MAIS NOVAS primeiro)
        }
    })

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

            {/* FORMULÁRIO */}
            <div style={{ border: '1px solid #969393ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2 style={{ color: '#b9b2b2ff', marginTop: 0 }}>
                    {idEditando ? '✏️ Editando Categoria' : '➕ Nova Categoria'}
                </h2>

                <form onSubmit={salvarCategoria}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={principal}
                            onChange={e => setPrincipal(e.target.value)}
                            placeholder="Nome (Ex: Lazer)"
                            required
                            style={{ flex: 1, padding: '10px' }}
                        />
                        <input
                            type="text"
                            value={estabelecimento}
                            onChange={e => setEstabelecimento(e.target.value)}
                            placeholder="Estabelecimento (Opcional)"
                            style={{ flex: 1, padding: '10px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: idEditando ? '#ffc107' : '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                            {idEditando ? 'Salvar Alterações' : 'Cadastrar'}
                        </button>

                        {idEditando && (
                            <button type="button" onClick={limparFormulario} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* --- FILTROS DE ORDENAÇÃO --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#e8e1e1ff' }}>Lista de Categorias</h3>

                <div>
                    <span style={{ marginRight: '10px', fontSize: '14px', color: '#666' }}>Ordenar por:</span>
                    <button
                        onClick={() => setOrdenacao('az')}
                        style={{
                            padding: '5px 10px',
                            marginRight: '5px',
                            backgroundColor: ordenacao === 'az' ? '#007bff' : '#eee', // Fica azul se estiver selecionado
                            color: ordenacao === 'az' ? 'white' : 'black',
                            border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}>
                        A-Z
                    </button>
                    <button
                        onClick={() => setOrdenacao('id')}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: ordenacao === 'id' ? '#007bff' : '#eee',
                            color: ordenacao === 'id' ? 'white' : 'black',
                            border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}>
                        Recentes
                    </button>
                </div>
            </div>

            {/* LISTA (Agora usamos a listaOrdenada) */}
            <ul style={{ listStyle: 'none', padding: 1 }}>
                {listaOrdenada.map(cat => (
                    <li key={cat.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#0a0909ff',
                        color: '#f1e9e9ff',
                        borderRadius: '16px',
                        marginTop:'5px'
                    }}>
                        <div>
                            <strong>{cat.principal}</strong>
                            {cat.estabelecimento && <span style={{ color: '#f8f4f4ff', fontSize: '14px' }}> ({cat.estabelecimento})</span>}
                        </div>
                        <div>
                            <button onClick={() => editar(cat)} style={{ marginRight: '5px', background:'#a39f9fff', border: '1px solid #ccc', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>✏️</button>
                            <button onClick={() => excluir(cat.id)} style={{ background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>🗑️</button>
                        </div>
                    </li>
                ))}

                {/* Aviso se a lista estiver vazia */}
                {lista.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999' }}>Nenhuma categoria cadastrada ainda.</p>
                )}
            </ul>

        </div>
    )
}

export default FormularioCategoria