import { useState, useEffect } from 'react'
import api from '../api' // <--- AQUI ESTÁ A MÁGICA (Mudamos de axios para api)

function FormularioTransacao() {
    const [tipo, setTipo] = useState('saida')
    const [valor, setValor] = useState('')
    const [data, setData] = useState('')
    const [descricao, setDescricao] = useState('')
    const [origem, setOrigem] = useState('')
    const [local, setLocal] = useState('')
    const [categoriaId, setCategoriaId] = useState('')
    const [listaCategorias, setListaCategorias] = useState([])

    useEffect(() => {
        // Agora usamos 'api.get' e não precisamos do link completo
        api.get('/categorias')
            .then(res => {
                setListaCategorias(res.data)
                if (res.data.length > 0) setCategoriaId(res.data[0].id)
            })
            .catch(erro => {
                console.error("Erro ao buscar categorias:", erro)
                alert("Não foi possível carregar as categorias.")
            })
    }, [])

    const pegarGPS = (e) => {
        e.preventDefault()
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocal(`${pos.coords.latitude}, ${pos.coords.longitude}`)
                alert("Localização capturada!")
            }, () => alert("Erro ao pegar GPS"))
        } else {
            alert("Navegador sem suporte a GPS")
        }
    }

    const salvarTransacao = (e) => {
        e.preventDefault()
        // URL curta, o api.js sabe o resto
        const url = tipo === 'entrada' ? '/entradas' : '/saidas'

        api.post(url, {
            valor: parseFloat(valor),
            data,
            descricao,
            origem,
            local,
            categoria_id: categoriaId
        })
            .then(() => {
                alert('Salvo com sucesso!')
                setValor(''); setDescricao(''); setLocal('')
            })
            .catch(erro => {
                console.error(erro)
                alert("Erro ao salvar transação.")
            })
    }

    return (
        <div className="card-responsivo">
            <h2 style={{ marginTop: 0 }}>Lançar Movimentação {tipo === 'entrada' ? 'Entrada' : 'Saída'}</h2>
            <form onSubmit={salvarTransacao}>

                <div style={{ marginBottom: '15px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <label><input type="radio" name="tipo" value="entrada" checked={tipo === 'entrada'} onChange={() => setTipo('entrada')} /> Entrada</label>
                    <label><input type="radio" name="tipo" value="saida" checked={tipo === 'saida'} onChange={() => setTipo('saida')} /> Saída</label>
                </div>

                <input type="number" placeholder="Valor (R$)" value={valor} onChange={e => setValor(e.target.value)} required style={{ width: '90%', padding: '10px', marginBottom: '10px' }} />
                <input type="date" value={data} onChange={e => setData(e.target.value)} required style={{ width: '90%', padding: '10px', marginBottom: '10px' }} />
                <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '10px' }} />
                <input type="text" placeholder="Origem (Banco, Carteira)" value={origem} onChange={e => setOrigem(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '10px' }} />

                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    <input type="text" placeholder="Localização" value={local} onChange={e => setLocal(e.target.value)} style={{ flex: 1, padding: '10px' }} />
                    <button type="button" onClick={pegarGPS} style={{ cursor: 'pointer' }}>📍</button>
                </div>

                <label>Categoria:</label>
                <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '20px', display: 'block', marginTop: '5px' }}>
                    {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.principal}</option>)}
                </select>

                <button type="submit" style={{ width: '90%', padding: '12px', backgroundColor: tipo === 'entrada' ? '#007bff' : '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Confirmar Lançamento
                </button>
            </form>
        </div>
    )
}
export default FormularioTransacao