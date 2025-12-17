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

// Importe o Segurança
import RotaProtegida from './components/RotaProtegida'

function App() {
  return (
    <BrowserRouter>
      <AutoLogout />
      <Navbar />

      <div style={{ padding: '20px' }}>
        <Routes>
          {/* --- ROTAS PÚBLICAS (Qualquer um entra) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* --- ROTAS PROTEGIDAS (Só com Token) --- */}
          {/* Note como envolvemos o componente dentro da RotaProtegida */}

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
          {/* Rota pública para pedir o link */}
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />

          {/* Rota pública que recebe o token (O :token significa que é variável) */}
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />  

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App