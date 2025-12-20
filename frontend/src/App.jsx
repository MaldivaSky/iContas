import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/NavBar'
import Home from './components/Home'
import Login from './components/Login'
import Cadastro from './components/Cadastro'
import FormularioCategoria from './components/FormCategoria'
import FormularioTransacao from './components/FormTransacao'
import Extrato from './components/Extrato'
import AnaliseGrafica from './components/AnaliseGrafica'
import Calculadora from './components/Calculadora'
import AutoLogout from './components/AutoLogout'
import Perfil from './components/Perfil'
import EsqueciSenha from './components/EsqueciSenha'
import RedefinirSenha from './components/RedefinirSenha'
import Footer from './components/Footer' // <--- 1. Certifique-se que importou aqui

// Importe o Segurança
import RotaProtegida from './components/RotaProtegida'

function App() {
  return (
    <BrowserRouter>
      {/* 2. Criei essa div PAIMENT que segura tudo com minHeight 100vh */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <AutoLogout />
        <Navbar />

        {/* 3. Adicionei 'flex: 1' aqui. Isso faz essa área crescer e empurrar o footer */}
        <div style={{ padding: '20px', flex: 1 }}>
          <Routes>
            {/* --- ROTAS PÚBLICAS --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* --- ROTAS PROTEGIDAS --- */}
            <Route path="/" element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            } />

            <Route path="/categorias" element={
              <RotaProtegida>
                <FormularioCategoria />
              </RotaProtegida>
            } />

            <Route path="/transacoes" element={
              <RotaProtegida>
                <FormularioTransacao />
              </RotaProtegida>
            } />

            <Route path="/extrato" element={
              <RotaProtegida>
                <Extrato />
              </RotaProtegida>
            } />

            <Route path="/analise" element={
              <RotaProtegida>
                <AnaliseGrafica />
              </RotaProtegida>
            } />

            <Route path="/calculadora" element={
              <RotaProtegida>
                <Calculadora />
              </RotaProtegida>
            } />

            <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />

            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />

          </Routes>
        </div>

        {/* 4. O Footer entra aqui, fora da div de conteúdo, mas dentro da div Pai */}
        <Footer />

      </div>
    </BrowserRouter>
  )
}

export default App