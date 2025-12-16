import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import FormularioCategoria from './components/FormCategoria'
import FormularioTransacao from './components/FormTransacao'
import Extrato from './components/Extrato'
import AnaliseGrafica from './components/AnaliseGrafica' // Importe no topo

function App() {
  return (
    <BrowserRouter>
      {/* O Routes funciona como um "Switch". Ele escolhe UMA rota por vez. */}
      <Routes>

        {/* Rota Raiz (O Menu Principal) */}
        <Route path="/" element={<Home />} />

        {/* Rotas das Páginas */}
        <Route path="/categorias" element={
          <div>
            <Link to="/" style={{ display: 'block', margin: '10px', textDecoration: 'none' }}>⬅ Voltar ao Menu</Link>
            <FormularioCategoria />
          </div>
        } />

        <Route path="/transacoes" element={
          <div>
            <Link to="/" style={{ display: 'block', margin: '10px', textDecoration: 'none' }}>⬅ Voltar ao Menu</Link>
            <FormularioTransacao />
          </div>
        } />
        {/* Rota pág Extrato */}
        <Route path="/extrato" element={
          <div>
              <Link to="/" style={{ display: 'block', margin: '10px', textDecoration: 'none' }}>⬅ Voltar ao Menu</Link>
              <Extrato /> 
            </div>
        } />
        {/* Rota pág Análise Gráfica */}
      <Route path="/analise" element={
        <div>
          <Link to="/" style={{ display: 'block', margin: '10px', textDecoration: 'none' }}>⬅ Voltar ao Menu</Link>
          <AnaliseGrafica />
        </div>
      } />

      </Routes>
    </BrowserRouter>
  )
}

export default App