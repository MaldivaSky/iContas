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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
