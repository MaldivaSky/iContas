import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

function MapaGastos({ pontos }) {
       
    if (pontos.length === 0) {
        return <div style={{ height: '400px', background: '#0c0c0cff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem dados de GPS para exibir no mapa.</div>
    }

    // Tenta centralizar o mapa no primeiro ponto encontrado
    const centroInicial = [pontos[0].lat, pontos[0].lng]

    return (
        <MapContainer center={centroInicial} zoom={10} style={{ height: '400px', width: '90%', borderRadius: '12px' }}>
            {/* O "papel de parede" do mapa (OpenStreetMap) */}
            <TileLayer
                attribution='&copy; OpenStreetMap contributors - iContas_app'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Desenha as bolhas */}
            {pontos.map((ponto, index) => (
                <CircleMarker
                    key={index}
                    center={[ponto.lat, ponto.lng]}
                    pathOptions={{
                        color: ponto.tipo === 'entrada' ? 'green' : 'red',
                        fillColor: ponto.tipo === 'entrada' ? '#28a745' : '#dc3545',
                        fillOpacity: 0.6
                    }}
                    // O raio depende do valor. Ajuste o divisor (50) se as bolhas ficarem muito grandes/pequenas
                    radius={Math.sqrt(ponto.valor) * 2}
                >
                    <Popup>
                        <strong>{ponto.descricao}</strong><br />
                        R$ {ponto.valor.toFixed(2)} ({ponto.tipo})
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    )
}

export default MapaGastos