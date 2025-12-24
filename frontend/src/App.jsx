import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// --- 1. IMPORTAÇÕES DO TOASTIFY ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // O CSS obrigatório

import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Home from './components/Home';
import FormTransacao from './components/FormTransacao';
import Extrato from './components/Extrato';
import AnaliseGrafica from './components/AnaliseGrafica';
import FormCategoria from './components/FormCategoria';
import Calculadora from './components/Calculadora';
import RotaProtegida from './components/RotaProtegida';
import EsqueciSenha from './components/EsqueciSenha';
import RedefinirSenha from './components/RedefinirSenha';
import Perfil from './components/Perfil';
import MapaGastos from './components/MapaGastos';
import NavBar from './components/NavBar'; // <--- Trazendo de volta
import Footer from './components/Footer'; // <--- Trazendo de volta

// Componente auxiliar para esconder Menu/Footer na tela de Login
function Layout({ children }) {
  const location = useLocation();
  const rotasEscondidas = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'];
  const esconder = rotasEscondidas.some(rota => location.pathname.startsWith(rota));

  return (
    <>
      {!esconder && <NavBar />}
      <div style={{ minHeight: '80vh' }}>
        {children}
      </div>
      {!esconder && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        {/* --- 2. COMPONENTE GLOBAL DE NOTIFICAÇÕES --- */}
        {/* autoClose={4000} significa que somem em 4 segundos */}
        <ToastContainer position="top-right" autoClose={4000} theme="colored" />

        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />

          {/* Rotas Protegidas */}
          <Route path="/" element={<RotaProtegida><Home /></RotaProtegida>} />
          <Route path="/transacoes" element={<RotaProtegida><FormTransacao /></RotaProtegida>} />
          <Route path="/nova-transacao" element={<RotaProtegida><FormTransacao /></RotaProtegida>} />
          <Route path="/extrato" element={<RotaProtegida><Extrato /></RotaProtegida>} />
          <Route path="/analise" element={<RotaProtegida><AnaliseGrafica /></RotaProtegida>} />
          <Route path="/categorias" element={<RotaProtegida><FormCategoria /></RotaProtegida>} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
          <Route path="/mapa" element={<RotaProtegida><MapaGastos /></RotaProtegida>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;