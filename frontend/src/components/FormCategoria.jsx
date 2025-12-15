import { useState } from 'react'
import axios from 'axios'

function FormularioCategoria() {
    // Aqui guardamos o que o usuário digita
    const [principal, setPrincipal] = useState('')
    const [estabelecimento, setEstabelecimento] = useState('')
    const [local, setLocal] = useState('')

    // Função para pegar o GPS
    const pegarLocalizacao = (e) => {
        e.preventDefault() // Não deixa a tela recarregar
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((posicao) => {
                const lat = posicao.coords.latitude
                const long = posicao.coords.longitude
                setLocal(`${lat}, ${long}`)
                alert("Localização encontrada!")
            }, () => {
                alert("Não foi possível pegar a localização.")
            })
        } else {
            alert("Seu navegador não suporta GPS.")
        }
    }

    // Função para salvar no Python
    const salvarCategoria = (e) => {
        e.preventDefault()

        const dados = {
            principal: principal,
            estabelecimento: estabelecimento,
            local: local
        }

        axios.post('http://127.0.0.1:5000/categorias', dados)
            .then(() => {
                alert('Categoria salva com sucesso!')
                // Limpa os campos
                setPrincipal('')
                setEstabelecimento('')
                setLocal('')
            })
            .catch(erro => {
                console.error(erro)
                alert('Erro ao salvar.')
            })
    }

    return (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto'}}>
            <h2>Nova Categoria</h2>
            <form onSubmit={salvarCategoria}>

                <div style={{ marginBottom: '10px' }}>
                    <label>Nome Principal:</label><br />
                    <input
                        type="text"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                        placeholder="Ex: Alimentação"
                        required
                        style={{ width: '90%', padding: '8px'}}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Estabelecimento:</label><br />
                    <input
                        type="text"
                        value={estabelecimento}
                        onChange={(e) => setEstabelecimento(e.target.value)}
                        placeholder="Ex: McDonalds"
                        style={{ width: '90%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Localização:</label><br />
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                            type="text"
                            value={local}
                            onChange={(e) => setLocal(e.target.value)}
                            placeholder="Clique no botão ao lado ->"
                            style={{ flex: 1, padding: '8px', width: '90%' }}
                        />
                        <button type="button" onClick={pegarLocalizacao} style={{ cursor: 'pointer' }}>📍 GPS</button>
                    </div>
                </div>

                <button type="submit" style={{ width: '90%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Salvar Categoria
                </button>

            </form>
        </div>
    )
}

export default FormularioCategoria