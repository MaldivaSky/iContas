import { useState } from 'react'
import { Link } from 'react-router-dom'

function Calculadora() {
    const [visor, setVisor] = useState('')
    const [resultado, setResultado] = useState('')

    // Função que adiciona números ou operadores no visor
    const handleClick = (valor) => {
        // Evita operadores repetidos ou no começo errado
        const operadores = ['/', '*', '-', '+', '.']
        if (
            (operadores.includes(valor) && visor === '') ||
            (operadores.includes(valor) && operadores.includes(visor.slice(-1)))
        ) {
            return;
        }
        setVisor(visor + valor)
    }

    // Função que faz a conta (o cérebro da calculadora)
    const calcular = () => {
        try {
            // Sanitiza o conteúdo do visor para permitir apenas caracteres
            // numéricos, operadores básicos, parênteses, ponto e espaços.
            const sanitized = (visor || '').replace(/[^0-9+\-*/(). ]+/g, '')
            if (!sanitized || /[+\-*/.]$/.test(sanitized.trim())) {
                throw new Error('Expressão inválida')
            }
            // Avaliador simples e restrito usando Function (mais seguro que eval cru).
            const total = Function(`"use strict"; return (${sanitized})`)()
            const totalStr = String(total)
            setResultado(totalStr)
            setVisor(totalStr)
        } catch (e) {
            console.error(e)
            setResultado('Erro')
        }
    }

    // Função para limpar (C)
    const limpar = () => {
        setVisor('')
        setResultado('')
    }

    // Função para apagar o último dígito (DEL)
    const apagarUltimo = () => {
        setVisor(visor.slice(0, -1))
    }

    // Função "Copiar" para facilitar a vida do usuário
    const copiarValor = () => {
        navigator.clipboard.writeText(resultado || visor)
        alert("Valor copiado! Agora você pode colar na tela de transação.")
    }

    return (
        <div className="card-responsivo" style={{ maxWidth: '400px', padding: '20px' }}>

            {/* Cabeçalho com Voltar */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', marginRight: '15px' }}>⬅</Link>
                <h2 style={{ margin: 0 }}>Calculadora Rápida</h2>
            </div>

            {/* Visor */}
            <div style={{
                backgroundColor: '#222',
                color: '#fff',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'right',
                fontSize: '32px',
                marginBottom: '20px',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                wordBreak: 'break-all'
            }}>
                <div style={{ fontSize: '16px', color: '#888', minHeight: '20px' }}>
                    {resultado ? 'Resultado:' : ''}
                </div>
                {visor || '0'}
            </div>

            {/* Teclado (Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>

                {/* Linha 1 */}
                <button onClick={limpar} style={{ backgroundColor: '#ff6b6b', color: 'white' }}>C</button>
                <button onClick={apagarUltimo} style={{ backgroundColor: '#f0ad4e', color: 'white' }}>⌫</button>
                <button onClick={() => handleClick('/')} style={estiloOperador}>÷</button>
                <button onClick={() => handleClick('*')} style={estiloOperador}>×</button>

                {/* Linha 2 */}
                <button onClick={() => handleClick('7')}>7</button>
                <button onClick={() => handleClick('8')}>8</button>
                <button onClick={() => handleClick('9')}>9</button>
                <button onClick={() => handleClick('-')} style={estiloOperador}>-</button>

                {/* Linha 3 */}
                <button onClick={() => handleClick('4')}>4</button>
                <button onClick={() => handleClick('5')}>5</button>
                <button onClick={() => handleClick('6')}>6</button>
                <button onClick={() => handleClick('+')} style={estiloOperador}>+</button>

                {/* Linha 4 */}
                <button onClick={() => handleClick('1')}>1</button>
                <button onClick={() => handleClick('2')}>2</button>
                <button onClick={() => handleClick('3')}>3</button>
                <button onClick={calcular} style={{ gridRow: 'span 2', backgroundColor: '#28a745', color: 'white', fontSize: '24px' }}>=</button>

                {/* Linha 5 (Zero e Ponto) */}
                <button onClick={() => handleClick('0')} style={{ gridColumn: 'span 2' }}>0</button>
                <button onClick={() => handleClick('.')}>.</button>
            </div>

            {/* Botão Extra: Copiar */}
            <button
                onClick={copiarValor}
                style={{
                    marginTop: '20px',
                    width: '100%',
                    backgroundColor: '#007bff',
                    color: 'white'
                }}>
                📋 Copiar Resultado
            </button>

        </div>
    )
}

const estiloOperador = {
    backgroundColor: '#e9ecef',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '20px'
}

export default Calculadora