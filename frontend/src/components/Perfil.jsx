import { useState, useEffect } from 'react'
import api from '../api'
// NavBar removido para não duplicar com o App.jsx
import { PiFloppyDiskBold, PiCameraBold } from "react-icons/pi";
import { toast } from 'react-toastify';

function Perfil() {
    const [dados, setDados] = useState({
        nome_completo: '',
        telefone: '',
        nascimento: '',
        email: '',
        username: ''
    })
    const [fotoPreview, setFotoPreview] = useState(null)
    const [loading, setLoading] = useState(true)

    // Carrega dados ao abrir a tela
    useEffect(() => {
        api.get('/meus-dados')
            .then(res => {
                setDados(res.data)
                setFotoPreview(res.data.foto)
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false))
    }, [])

    const handleSalvar = async (e) => {
        e.preventDefault()
        try {
            // 1. Salva os textos
            await api.put('/atualizar-perfil', {
                nome_completo: dados.nome_completo,
                telefone: dados.telefone,
                nascimento: dados.nascimento
            })

            // Atualiza o cache local para a NavBar saber o nome novo
            localStorage.setItem('usuario_nome', dados.nome_completo)

            toast.success("Perfil atualizado com sucesso!")
            window.location.reload() // Recarrega a página para atualizar a NavBar lá em cima
        } catch (error) {
            console.error(error)
            toast.error("Erro ao atualizar perfil.")
        }
    }

    // Função de Upload de Foto
    const handleFotoChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return;

        const formData = new FormData()
        formData.append('foto', file)

        try {
            const res = await api.post('/atualizar-foto', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            setFotoPreview(res.data.nova_foto)

            // --- REMOVIDO: localStorage.setItem('usuario_foto', ...) ---
            // Não salvamos mais no cache para não dar erro.

            toast.success("Foto atualizada!")
            window.location.reload()

        } catch (error) {
            console.error(error)
            toast.error("Erro ao enviar foto.")
        }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#820AD1' }}>Carregando perfil...</div>

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '40px' }}>

            {/* NavBar removida daqui (já vem do App.jsx) */}

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>

                    <h2 style={{ textAlign: 'center', color: '#820AD1', marginBottom: '30px' }}>Meu Perfil</h2>

                    {/* ÁREA DA FOTO */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <img
                                src={fotoPreview || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                                alt="Perfil"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f0f0f0' }}
                            />
                            <label style={{
                                position: 'absolute', bottom: 0, right: 0,
                                background: '#820AD1', color: 'white',
                                padding: '8px', borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}>
                                <PiCameraBold size={20} />
                                <input type="file" onChange={handleFotoChange} style={{ display: 'none' }} accept="image/*" />
                            </label>
                        </div>
                        <p style={{ marginTop: '10px', color: '#888', fontSize: '14px', fontWeight: 'bold' }}>@{dados.username}</p>
                    </div>

                    {/* FORMULÁRIO */}
                    <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div>
                            <label style={labelStyle}>Nome Completo</label>
                            <input
                                type="text"
                                value={dados.nome_completo || ''}
                                onChange={e => setDados({ ...dados, nome_completo: e.target.value })}
                                style={inputStyle}
                                placeholder="Como você quer ser chamado?"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '140px' }}>
                                <label style={labelStyle}>Telefone / Celular</label>
                                <input
                                    type="text"
                                    value={dados.telefone || ''}
                                    onChange={e => setDados({ ...dados, telefone: e.target.value })}
                                    style={inputStyle}
                                    placeholder="(XX) 9XXXX-XXXX"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '140px' }}>
                                <label style={labelStyle}>Data de Nascimento</label>
                                <input
                                    type="date"
                                    value={dados.nascimento || ''}
                                    onChange={e => setDados({ ...dados, nascimento: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>E-mail (Não editável)</label>
                            <input
                                type="text"
                                value={dados.email}
                                disabled
                                style={{ ...inputStyle, background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
                            />
                        </div>

                        <button type="submit" style={btnSalvarStyle}>
                            <PiFloppyDiskBold size={22} /> SALVAR ALTERAÇÕES
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

// Estilos
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' }
const btnSalvarStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '15px', backgroundColor: '#0dc325', color: 'white',
    border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
    marginTop: '10px',
    transition: 'background 0.2s'
}

export default Perfil