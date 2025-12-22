import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Home.css';

// --- IMPORTANDO ÍCONES MODERNOS (Phosphor Icons) ---
import {
    PiCurrencyDollarSimpleBold, // Para Registrar (Dinheiro)
    PiReceiptBold,              // Para Extrato (Recibo)
    PiChartPieSliceBold,        // Para Gráficos
    PiTagBold,                  // Para Categorias
    PiCalculatorBold            // Para Calculadora
} from "react-icons/pi";

function Home() {
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState({ nome: 'Visitante', foto: null });

    useEffect(() => {
        async function carregarTudo() {
            try {
                const respUsuario = await api.get('/meus-dados');
                await api.get('/dados-graficos');

                setUsuario({
                    nome: respUsuario.data.nome_completo.split(' ')[0],
                    foto: respUsuario.data.foto
                });
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                const nomeLocal = localStorage.getItem('usuario_nome');
                if (nomeLocal) setUsuario(prev => ({ ...prev, nome: nomeLocal }));
            } finally {
                setLoading(false);
            }
        }
        carregarTudo();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <div className="loading-text">Conectando ao servidor seguro...</div>
            </div>
        );
    }

    // Estilo padrão para os ícones (Roxo do App)
    const iconStyle = { color: '#6d0582ff', marginBottom: '8px' };

    return (
        <div style={{ paddingBottom: '40px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>

            {/* CABEÇALHO */}
            <div style={{
                backgroundColor: '#820AD1',
                padding: '40px 20px 30px 20px',
                color: 'white',
                borderBottomLeftRadius: '30px',
                borderBottomRightRadius: '30px',
                marginBottom: '25px',
                boxShadow: '0 4px 15px rgba(130, 10, 209, 0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <img
                    src={usuario.foto || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                    alt="Perfil"
                    style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        marginBottom: '10px',
                        backgroundColor: 'white'
                    }}
                />
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                    Olá, {usuario.nome}! 👋
                </h1>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px' }}>Controle Financeiro iContas</p>
            </div>

            {/* MENU COM ÍCONES NOVOS */}
            <div style={{ padding: '0 20px' }}>
                <h3 style={{ color: '#820AD1', marginBottom: '20px', textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Menu Principal
                </h3>

                <div className="menu-grid" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>

                    <Link to="/transacoes" className="card-menu">
                        {/* Ícone de Dinheiro */}
                        <PiCurrencyDollarSimpleBold size={40} style={iconStyle} />
                        <strong>Registrar</strong>
                    </Link>

                    <Link to="/extrato" className="card-menu">
                        {/* Ícone de Recibo */}
                        <PiReceiptBold size={40} style={iconStyle} />
                        <strong>Extrato</strong>
                    </Link>

                    <Link to="/analise" className="card-menu">
                        {/* Ícone de Pizza/Gráfico */}
                        <PiChartPieSliceBold size={40} style={iconStyle} />
                        <strong>Gráficos</strong>
                    </Link>

                    <Link to="/categorias" className="card-menu">
                        {/* Ícone de Etiqueta */}
                        <PiTagBold size={40} style={iconStyle} />
                        <strong>Categorias</strong>
                    </Link>

                    <Link to="/calculadora" className="card-menu">
                        {/* Ícone de Calculadora */}
                        <PiCalculatorBold size={40} style={iconStyle} />
                        <strong>Calculadora</strong>
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default Home;