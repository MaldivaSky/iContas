import './Footer.css'
// Importando os ícones: LinkedIn, GitHub e Envelope (Email)
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">

                {/* Logo */}
                <img src="/logo1.png" alt="iContas Logo" className="footer-logo" />

                {/* Info Dev */}
                <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>Desenvolvido por Rafael Maldivas</h4>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#ccc' }}>
                        Full Stack Developer
                    </p>
                </div>

                {/* --- ÍCONES SOCIAIS --- */}
                <div className="footer-links">

                    <a
                        href="https://www.linkedin.com/in/SEU-LINKEDIN"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin size={24} /> {/* size muda o tamanho */}
                    </a>

                    <a
                        href="https://github.com/SEU-GITHUB"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        aria-label="GitHub"
                    >
                        <FaGithub size={24} />
                    </a>

                    <a
                        href="mailto:seuemail@exemplo.com"
                        className="footer-link"
                        aria-label="Email"
                    >
                        <FaEnvelope size={24} />
                    </a>

                </div>

                {/* Copyright */}
                <div className="footer-copy">
                    &copy; {new Date().getFullYear()} iContas. Todos os direitos reservados.
                </div>

            </div>
        </footer>
    )
}

export default Footer