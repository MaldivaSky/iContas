import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
// NavBar removido daqui para evitar duplicação
import './Home.css';

import {
    PiCurrencyDollarSimpleBold,
    PiReceiptBold,
    PiChartPieSliceBold,
    PiTagBold,
    PiCalculatorBold
} from "react-icons/pi";

function Home() {
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState({ nome: 'Visitante', foto: null });

    useEffect(() => {
        async function carregarTudo() {
            try {
                const respUsuario = await api.get('/meus-dados');
                // Tenta carregar dados gráficos (opcional)
                try { await api.get('/dados-graficos'); } catch (e) { console.error(e); }

                const nomeCompleto = respUsuario.data.nome_completo;
                const foto = respUsuario.data.foto;

                // --- GARANTIA PARA O NAVBAR GLOBAL ---
                // Isso aqui é crucial: alimenta o localStorage para que o NavBar do App.jsx funcione
                localStorage.setItem('usuario_nome', nomeCompleto);
                if (foto) localStorage.setItem('usuario_foto', foto);

                setUsuario({
                    nome: nomeCompleto.split(' ')[0],
                    foto: foto
                });
            } catch (error) {
                console.error("Erro ao carregar dados:", error);

                const dadosLocal = localStorage.getItem('usuario_dados');
                if (dadosLocal) {
                    const userObj = JSON.parse(dadosLocal);
                    localStorage.setItem('usuario_nome', userObj.nome); // Fallback para NavBar

                    setUsuario({
                        nome: userObj.nome ? userObj.nome.split(' ')[0] : 'Visitante',
                        foto: userObj.foto
                    });
                }
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

    const iconStyle = { color: '#6d0582ff', marginBottom: '8px' };

    return (
        <div style={{ paddingBottom: '40px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>

            {/* NavBar removida daqui (ela virá do App.jsx) */}

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

            {/* MENU GRID */}
            <div style={{ padding: '0 20px' }}>
                <h3 style={{ color: '#820AD1', marginBottom: '20px', textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Menu Principal
                </h3>

                <div className="menu-grid" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <Link to="/transacoes" className="card-menu">
                        <PiCurrencyDollarSimpleBold size={40} style={iconStyle} />
                        <strong>Registrar</strong>
                    </Link>

                    <Link to="/extrato" className="card-menu">
                        <PiReceiptBold size={40} style={iconStyle} />
                        <strong>Extrato</strong>
                    </Link>

                    <Link to="/analise" className="card-menu">
                        <PiChartPieSliceBold size={40} style={iconStyle} />
                        <strong>Gráficos</strong>
                    </Link>

                    <Link to="/categorias" className="card-menu">
                        <PiTagBold size={40} style={iconStyle} />
                        <strong>Categorias</strong>
                    </Link>

                    <Link to="/calculadora" className="card-menu">
                        <PiCalculatorBold size={40} style={iconStyle} />
                        <strong>Calculadora</strong>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Home;