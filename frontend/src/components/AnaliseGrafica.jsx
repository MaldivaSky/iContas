import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import MapaGastos from './MapaGastos'
import GraficoPizza from './GraficoPizza'

function AnaliseGrafica() {
    const [dados, setDados] = useState(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/dados-graficos')
            .then(res => {
                setDados(res.data)
                setCarregando(false)
            })
            .catch(erro => {
                console.error(erro)
                setCarregando(false)
            })
    }, [])

    if (carregando) {
        return <div style={{ padding: '20px', textAlign: 'center', color:'#fadcdcff' }}>Carregando inteligência... 🧠</div>
    }

    return (
        <div style={{ fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', marginRight: '15px' }}>⬅</Link>
                <h2 style={{ margin: 0 }}>Análise Gráfica & Geográfica</h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>

                {/* --- BLOCO DO MAPA --- */}
                <div style={{ flex: '2', minWidth: '300px', border: '1px solid #ff0000ff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ textAlign: 'center', color: '#cdbcbcff' }}>🗺️ Mapa de Movimentações</h3>
                    <p style={{ fontSize: '12px', color: '#faf6f6ff', textAlign: 'center' }}>Bolhas Verdes = Ganhos | Bolhas Vermelhas = Gastos (O tamanho indica o valor)</p>
                    {/* Passamos só a parte do mapa para o componente */}
                    <MapaGastos pontos={dados.mapa} />
                </div>

                {/* --- BLOCO DO GRÁFICO --- */}
                <div style={{ flex: '1', minWidth: '300px', border: '1px solid #eee', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ textAlign: 'center', color: '#cbbfbfff' }}>🍕 Gastos por Categoria</h3>
                    <div style={{ padding: '20px' }}>
                        {/* Passamos só a parte do gráfico para o componente */}
                        <GraficoPizza dadosGrafico={dados.grafico} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AnaliseGrafica