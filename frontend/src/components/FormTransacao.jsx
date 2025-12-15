import { useState, useEffect } from 'react'
import axios from 'axios'

function FormularioTransacao() {
    const [tipo, setTipo] = useState('saida')
    const [valor, setValor] = useState('')
    const [data, setData] = useState('')
    const [descricao, setDescricao] = useState('')
    const [origem, setOrigem] = useState('')
    const [categoriaId, setCategoriaId] = useState('')
    const [listaCategorias, setListaCategorias] = useState([])

    // Busca categorias ao carregar
    useEffect(() => {
        axios.get('http://127.0.0.1:5000/categorias')
            .then(resposta => {
                setListaCategorias(resposta.data)
                if (resposta.data.length > 0) {
                    setCategoriaId(resposta.data[0].id)
                }
            })
            .catch(erro => console.error("Erro ao buscar categorias:", erro))
    }, [])

    const salvarTransacao = (e) => {
        e.preventDefault()

        const dados = {
            valor: parseFloat(valor),
            data: data,
            descricao: descricao,
            origem: origem,
            categoria_id: categoriaId
        }

        const url = tipo === 'entrada'
            ? 'http://127.0.0.1:5000/entradas'
            : 'http://127.0.0.1:5000/saidas'

        axios.post(url, dados)
            .then(() => {
                alert(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} salva com sucesso!`)
                setValor('')
                setDescricao('')
                setOrigem('')
            })
            .catch(erro => {
                // CORREÇÃO AQUI: Agora usamos a variável 'erro' no console
                console.error("Detalhes do erro:", erro)
                alert("Erro ao salvar! Verifique se preencheu tudo.")
            })
    }

    return (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h2>Lançar Movimentação</h2>
            <form onSubmit={salvarTransacao}>

                <div style={{ marginBottom: '15px', display: 'flex', gap: '20px' }}>
                    <label>
                        <input
                            type="radio"
                            name="tipo"
                            value="entrada"
                            checked={tipo === 'entrada'}
                            onChange={() => setTipo('entrada')}
                        /> Entrada
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="tipo"
                            value="saida"
                            checked={tipo === 'saida'}
                            onChange={() => setTipo('saida')}
                        /> Saída
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="number"
                        placeholder="R$ Valor"
                        value={valor}
                        onChange={e => setValor(e.target.value)}
                        required
                        style={{ flex: 1, padding: '8px' }}
                    />
                    <input
                        type="date"
                        value={data}
                        onChange={e => setData(e.target.value)}
                        required
                        style={{ flex: 1, padding: '8px' }}
                    />
                </div>

                <input
                    type="text"
                    placeholder="Descrição (ex: Almoço)"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />

                <input
                    type="text"
                    placeholder="Origem (ex: Nubank)"
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />

                <label>Categoria:</label>
                <select
                    value={categoriaId}
                    onChange={e => setCategoriaId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
                >
                    {listaCategorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.principal} - {cat.estabelecimento}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: tipo === 'entrada' ? '#007bff' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                    Salvar
                </button>

            </form>
        </div>
    )
}

export default FormularioTransacao