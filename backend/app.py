from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Categoria, Entrada, Saida
from datetime import datetime

app = Flask(__name__)
CORS(app)

engine = create_engine("sqlite:///financeiro.db")
Session = sessionmaker(bind=engine)


@app.route("/")
def home():
    return "API iContas Atualizada (GPS nas Transações) 🚀"


# --- CATEGORIAS (Simplificada) ---
@app.route("/categorias", methods=["POST"])
def criar_categoria():
    session = Session()
    d = request.json
    # Não salvamos mais 'local' aqui
    nova = Categoria(principal=d["principal"], estabelecimento=d.get("estabelecimento"))
    session.add(nova)
    session.commit()
    session.close()
    return jsonify({"msg": "Categoria criada!"}), 201


@app.route("/categorias", methods=["GET"])
def listar_categorias():
    session = Session()
    lista = session.query(Categoria).all()
    res = [
        {"id": i.id, "principal": i.principal, "estabelecimento": i.estabelecimento}
        for i in lista
    ]
    session.close()
    return jsonify(res)


# --- ENTRADAS (Com Local) ---
@app.route("/entradas", methods=["POST"])
def criar_entrada():
    session = Session()
    d = request.json
    nova = Entrada(
        data=datetime.strptime(d["data"], "%Y-%m-%d").date(),
        valor=d["valor"],
        origem=d.get("origem"),
        descricao=d.get("descricao"),
        categoria_id=d.get("categoria_id"),
        local=d.get("local"),  # <--- Recebendo GPS
    )
    session.add(nova)
    session.commit()
    session.close()
    return jsonify({"msg": "Entrada salva com local!"}), 201


# --- SAÍDAS (Com Local) ---
@app.route("/saidas", methods=["POST"])
def criar_saida():
    session = Session()
    d = request.json
    nova = Saida(
        data=datetime.strptime(d["data"], "%Y-%m-%d").date(),
        valor=d["valor"],
        origem=d.get("origem"),
        descricao=d.get("descricao"),
        categoria_id=d.get("categoria_id"),
        local=d.get("local"),  # <--- Recebendo GPS
    )
    session.add(nova)
    session.commit()
    session.close()
    return jsonify({"msg": "Saída salva com local!"}), 201

# ... (código anterior das rotas de POST e GET categorias)


# --- ROTA: ATUALIZAR CATEGORIA (PUT) ---
@app.route("/categorias/<int:id>", methods=["PUT"])
def atualizar_categoria(id):
    session = Session()
    dados = request.json

    # Busca a categoria pelo ID
    categoria = session.query(Categoria).get(id)

    if categoria:
        categoria.principal = dados["principal"]
        categoria.estabelecimento = dados.get("estabelecimento")
        session.commit()
        session.close()
        return jsonify({"mensagem": "Categoria atualizada!"})
    else:
        session.close()
        return jsonify({"erro": "Categoria não encontrada"}), 404


# --- ROTA: DELETAR CATEGORIA (DELETE) ---
@app.route("/categorias/<int:id>", methods=["DELETE"])
def deletar_categoria(id):
    session = Session()

    # Busca e deleta
    categoria = session.query(Categoria).get(id)

    if categoria:
        session.delete(categoria)
        session.commit()
        session.close()
        return jsonify({"mensagem": "Categoria excluída com sucesso!"})
    else:
        session.close()
        return jsonify({"erro": "Categoria não encontrada"}), 404


# --- ROTA: EXTRATO COMBINADO (O Cérebro do Dashboard) ---
@app.route("/extrato", methods=["GET"])
def obter_extrato():
    session = Session()

    # 1. Buscar tudo
    entradas = session.query(Entrada).all()
    saidas = session.query(Saida).all()

    # 2. Buscar nomes das categorias (para não mostrar só números IDs)
    # Cria um dicionário: { 1: "Alimentação", 2: "Transporte" }
    cats = session.query(Categoria).all()
    nome_categorias = {c.id: c.principal for c in cats}

    lista_combinada = []

    # 3. Processar Entradas (Adiciona o rótulo 'tipo': 'entrada')
    for e in entradas:
        lista_combinada.append(
            {
                "id": e.id,
                "data": str(e.data),
                "valor": e.valor,
                "descricao": e.descricao,
                "origem": e.origem,
                "categoria": nome_categorias.get(e.categoria_id, "Desconhecida"),
                "tipo": "entrada",  # Importante para saber pintar de verde
                "local": e.local,
            }
        )

    # 4. Processar Saídas (Adiciona o rótulo 'tipo': 'saida')
    for s in saidas:
        lista_combinada.append(
            {
                "id": s.id,
                "data": str(s.data),
                "valor": s.valor,
                "descricao": s.descricao,
                "origem": s.origem,
                "categoria": nome_categorias.get(s.categoria_id, "Desconhecida"),
                "tipo": "saida",  # Importante para saber pintar de vermelho
                "local": s.local,
            }
        )

    # 5. Ordenar tudo por DATA (Do mais novo para o mais antigo)
    # A função lambda pega o campo 'data' de cada item para comparar
    lista_combinada.sort(key=lambda x: x["data"], reverse=True)

    session.close()
    return jsonify(lista_combinada)


# --- ROTA: DADOS PARA DASHBOARD (Mapas e Gráficos) ---
@app.route("/dados-graficos", methods=["GET"])
def dados_graficos():
    session = Session()

    entradas = session.query(Entrada).all()
    saidas = session.query(Saida).all()
    cats = session.query(Categoria).all()
    nome_cats = {c.id: c.principal for c in cats}  # Dicionário {id: "Nome"}

    # --- PREPARAÇÃO 1: DADOS DO MAPA (Pontos com GPS) ---
    pontos_mapa = []

    # Função auxiliar para processar a string "lat,long"
    def processar_gps(item, tipo):
        if item.local and "," in item.local:
            try:
                lat_str, long_str = item.local.split(",")
                return {
                    "lat": float(lat_str.strip()),
                    "lng": float(long_str.strip()),
                    "valor": item.valor,
                    "descricao": item.descricao,
                    "tipo": tipo,  # 'entrada' ou 'saida' para a cor
                }
            except:
                return None  # Ignora se o GPS estiver bugado
        return None

    for e in entradas:
        ponto = processar_gps(e, "entrada")
        if ponto:
            pontos_mapa.append(ponto)

    for s in saidas:
        ponto = processar_gps(s, "saida")
        if ponto:
            pontos_mapa.append(ponto)

    # --- PREPARAÇÃO 2: DADOS DO GRÁFICO DE PIZZA (Soma por Categoria) ---
    # Ex: {'Alimentação': 150.00, 'Transporte': 50.00}
    soma_por_categoria = {}

    all_transacoes = entradas + saidas
    for t in all_transacoes:
        if t.categoria_id:
            nome = nome_cats.get(t.categoria_id, "Outros")
            # Se já existe, soma. Se não, começa com 0 e soma.
            soma_por_categoria[nome] = soma_por_categoria.get(nome, 0) + t.valor

    # Formata para o Chart.js (duas listas separadas)
    labels_grafico = list(soma_por_categoria.keys())
    valores_grafico = list(soma_por_categoria.values())

    session.close()

    # Retorna tudo num pacotão JSON
    return jsonify(
        {
            "mapa": pontos_mapa,
            "grafico": {"labels": labels_grafico, "data": valores_grafico},
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
