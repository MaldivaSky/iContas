import { useEffect } from 'react'
import { toast } from 'react-toastify';

const AutoLogout = () => {
    useEffect(() => {
        let timer

        // Função que "Zera" o cronômetro
        const resetTimer = () => {
            clearTimeout(timer)

            // Define para 30 minutos (30 * 60 * 1000 milissegundos)
            timer = setTimeout(() => {
                toast.error("Sessão expirada por inatividade. Faça login novamente.")
                localStorage.clear()
                window.location.href = '/login'
            }, 30 * 60 * 1000)
        }

        // Lista de ações que mostram que o usuário está vivo
        const eventos = ['mousemove', 'keydown', 'click', 'scroll']

        // Adiciona os ouvidos nas paredes (listeners)
        eventos.forEach(evento => window.addEventListener(evento, resetTimer))

        // Inicia a contagem
        resetTimer()

        // Limpeza quando sair da tela
        return () => {
            clearTimeout(timer)
            eventos.forEach(evento => window.removeEventListener(evento, resetTimer))
        }
    }, [])

    return null // Esse componente é um fantasma, não desenha nada na tela
}

export default AutoLogout