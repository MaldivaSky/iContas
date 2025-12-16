import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

// Registra os elementos necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend)

function GraficoPizza({ dadosGrafico }) {

    if (!dadosGrafico || dadosGrafico.data.length === 0) {
        return <p style={{ textAlign: 'center', color: '#f70000ff', font: '16px Arial, sans-serif' }}>Sem dados para o gráfico.</p>
    }

    // Configuração dos dados para o Chart.js
    const data = {
        labels: dadosGrafico.labels, // Ex: ['Alimentação', 'Transporte']
        datasets: [
            {
                data: dadosGrafico.data, // Ex: [150.00, 50.00]
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
                borderWidth: 1,
            },
        ],
    }

    return <Pie data={data} />
}

export default GraficoPizza