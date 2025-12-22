import os
import base64
import csv
import io
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_mail import Mail, Message

# --- FERRAMENTAS DE SEGURANÇA ---
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# --- FERRAMENTAS DE TOKEN (JWT) ---
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

# --- SEUS MODELOS ---
# Certifique-se que o models.py tem as colunas usuario_id em tudo!
from models import Base, Categoria, Entrada, Saida, Usuario

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ==============================================================================
# ⚙️ 1. CONFIGURAÇÃO DO BANCO DE DADOS (LOCAL vs NUVEM)
# ==============================================================================
db_url = os.environ.get("DATABASE_URL")

if db_url:
    # NUVEM (Render)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(db_url)
    print("🚀 Conectado ao PostgreSQL na Nuvem (Neon)!")
else:
    # LOCAL (Computador)
    engine = create_engine("sqlite:///financeiro.db")
    print("🏠 Conectado ao SQLite Local.")

Session = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

# ==============================================================================
# 📧 2. CONFIGURAÇÕES DE EMAIL E JWT
# ==============================================================================
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = "rafaelmaldivas@gmail.com"
app.config["MAIL_PASSWORD"] = "ribp qcbf xhqr sgvz"  # Sua senha de app
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
mail = Mail(app)

app.config["JWT_SECRET_KEY"] = "chave-super-secreta-do-rafael"
jwt = JWTManager(app)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

# Configuração de Upload (Usaremos apenas para ler o arquivo temporariamente)
app.config["UPLOAD_FOLDER"] = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


# --- FUNÇÕES ÚTEIS ---
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({"msg": f"Erro de Token: {error_string}"}), 422


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"msg": "Token expirado. Faça login novamente."}), 401


# ==============================================================================
# 🏠 3. ROTA INICIAL
# ==============================================================================
@app.route("/")
def home():
    return "API iContas Blindada 🔒 - Privacidade Total Ativada"


# ==============================================================================
# 👤 4. ROTAS DE USUÁRIO (REGISTRO, LOGIN, PERFIL)
# ==============================================================================


@app.route("/registro", methods=["POST"])
def registrar():
    session = Session()
    # Pega dados do formulário
    nome_completo = request.form["nome_completo"]
    username=username.lower(), # <--- Força minúsculo
    email=email.lower(),
    senha = request.form["senha"]
    nascimento = request.form["nascimento"]
    foto = request.files.get("foto")

    # Verifica duplicidade
    if (
        session.query(Usuario)
        .filter((Usuario.email == email) | (Usuario.username == username))
        .first()
    ):
        session.close()
        return jsonify({"erro": "Email ou Usuário já cadastrado!"}), 400

    # Lógica da Foto (Base64 - Salva no Banco)
    foto_dados = None
    if foto:
        file_content = foto.read()
        encoded_string = base64.b64encode(file_content).decode("utf-8")
        foto_dados = f"data:{foto.mimetype};base64,{encoded_string}"

    novo = Usuario(
        nome_completo=nome_completo,
        username=username.lower(),  # <--- Força minúsculo
        email=email.lower(),  # <--- Força minúsculo
        senha_hash=generate_password_hash(senha),
        nascimento=datetime.strptime(nascimento, "%Y-%m-%d").date(),
        foto_path=foto_dados,  # Salva o código da imagem aqui
    )

    session.add(novo)
    session.commit()
    session.close()
    return jsonify({"mensagem": "Conta criada com sucesso!"}), 201


@app.route("/login", methods=["POST"])
def login():
    session = Session()
    dados = request.json

    login_input = dados["login"].lower()  # <--- Transforma o que a pessoa digitou
    # Busca por email OU username
    usuario = (
        session.query(Usuario)
        .filter(
            (Usuario.email == login_input) | (Usuario.username == login_input)
        )
        .first()
    )
    session.close()

    if not usuario or not check_password_hash(usuario.senha_hash, dados["senha"]):
        return jsonify({"erro": "Credenciais inválidas"}), 401

    token = create_access_token(identity=str(usuario.id))

    # Retorna o token e a foto (que já é o código da imagem)
    return jsonify(
        {
            "token": token,
            "nome": usuario.nome_completo,
            "username": usuario.username,
            "foto": usuario.foto_path,  # Retorna o Base64 direto
        }
    )


@app.route("/meus-dados", methods=["GET"])
@jwt_required()
def meus_dados():
    usuario_id = get_jwt_identity()
    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    dados = {
        "nome_completo": usuario.nome_completo,
        "email": usuario.email,
        "username": usuario.username,
        "nascimento": str(usuario.nascimento),
        "foto": usuario.foto_path,  # Base64
    }
    session.close()
    return jsonify(dados)


@app.route("/atualizar-foto", methods=["POST"])
@jwt_required()
def atualizar_foto():
    usuario_id = get_jwt_identity()
    arquivo = request.files.get("foto")

    if not arquivo:
        return jsonify({"erro": "Nenhuma foto enviada"}), 400

    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    if arquivo:
        # Converte para Base64 (Igual ao Registro)
        file_content = arquivo.read()
        encoded_string = base64.b64encode(file_content).decode("utf-8")
        foto_dados = f"data:{arquivo.mimetype};base64,{encoded_string}"

        usuario.foto_path = foto_dados
        session.commit()
        session.close()
        return jsonify({"mensagem": "Foto atualizada!", "nova_foto": foto_dados})

    session.close()
    return jsonify({"erro": "Erro ao processar arquivo"}), 400


# ==============================================================================
# 🔒 5. ROTAS DE DADOS (BLINDADAS POR USUÁRIO)
# ==============================================================================


# --- CATEGORIAS ---
@app.route("/categorias", methods=["POST"])
@jwt_required()
def criar_categoria():
    usuario_id = get_jwt_identity()
    session = Session()
    d = request.json

    # Cria vinculada ao usuário
    nova = Categoria(
        principal=d["principal"],
        estabelecimento=d.get("estabelecimento"),
        usuario_id=usuario_id,  # <--- IMPORTANTE
    )
    session.add(nova)
    session.commit()
    session.close()
    return jsonify({"msg": "Categoria criada!"}), 201


@app.route("/categorias", methods=["GET"])
@jwt_required()
def listar_categorias():
    usuario_id = get_jwt_identity()
    session = Session()
    # Traz APENAS as categorias deste usuário
    lista = session.query(Categoria).filter_by(usuario_id=usuario_id).all()
    res = [
        {"id": i.id, "principal": i.principal, "estabelecimento": i.estabelecimento}
        for i in lista
    ]
    session.close()
    return jsonify(res)


@app.route("/categorias/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_categoria(id):
    usuario_id = get_jwt_identity()
    session = Session()
    # Garante que só apaga se for DONO da categoria
    categoria = session.query(Categoria).filter_by(id=id, usuario_id=usuario_id).first()

    if categoria:
        session.delete(categoria)
        session.commit()
        session.close()
        return jsonify({"mensagem": "Categoria excluída!"})
    else:
        session.close()
        return jsonify({"erro": "Categoria não encontrada"}), 404


# --- ENTRADAS E SAÍDAS ---
@app.route("/entradas", methods=["POST"])
@jwt_required()
def criar_entrada():
    usuario_id = get_jwt_identity()
    session = Session()
    d = request.json

    nova = Entrada(
        data=datetime.strptime(d["data"], "%Y-%m-%d").date(),
        valor=d["valor"],
        origem=d.get("origem"),
        descricao=d.get("descricao"),
        categoria_id=d.get("categoria_id"),
        local=d.get("local"),
        usuario_id=usuario_id,  # <--- Dono
    )
    session.add(nova)
    session.commit()
    session.close()
    return jsonify({"msg": "Entrada salva!"}), 201


@app.route("/saidas", methods=["POST"])
@jwt_required()
def criar_saida():
    usuario_id = get_jwt_identity()
    session = Session()
    d = request.json

    nova = Saida(
        data=datetime.strptime(d["data"], "%Y-%m-%d").date(),
        valor=d["valor"],
        origem=d.get("origem"),
        descricao=d.get("descricao"),
        categoria_id=d.get("categoria_id"),
        local=d.get("local"),
        usuario_id=usuario_id,  # <--- Dono
    )
    session.add(nova)
    session.commit()
    session.close()
    return jsonify({"msg": "Saída salva!"}), 201


# --- DELETAR TRANSAÇÃO (NOVA ROTA) ---
@app.route("/transacoes/<tipo>/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_transacao(tipo, id):
    usuario_id = get_jwt_identity()
    session = Session()
    item = None

    if tipo == "entrada":
        item = session.query(Entrada).filter_by(id=id, usuario_id=usuario_id).first()
    elif tipo == "saida":
        item = session.query(Saida).filter_by(id=id, usuario_id=usuario_id).first()

    if item:
        session.delete(item)
        session.commit()
        session.close()
        return jsonify({"mensagem": "Item apagado!"}), 200
    else:
        session.close()
        return jsonify({"erro": "Item não encontrado"}), 404


# ==============================================================================
# 📊 6. ROTAS DE ANÁLISE (EXTRATO, GRÁFICOS, EXPORTAR)
# ==============================================================================


@app.route("/extrato", methods=["GET"])
@jwt_required()  # <--- Agora é obrigatório estar logado
def obter_extrato():
    usuario_id = get_jwt_identity()
    session = Session()

    # FILTRO RIGOROSO: Só traz dados deste usuário
    entradas = session.query(Entrada).filter_by(usuario_id=usuario_id).all()
    saidas = session.query(Saida).filter_by(usuario_id=usuario_id).all()

    # Categorias só do usuário para mapear os nomes
    cats = session.query(Categoria).filter_by(usuario_id=usuario_id).all()
    nome_categorias = {c.id: c.principal for c in cats}

    lista_combinada = []

    for e in entradas:
        lista_combinada.append(
            {
                "id": e.id,
                "data": str(e.data),
                "valor": e.valor,
                "descricao": e.descricao,
                "origem": e.origem,
                "categoria": nome_categorias.get(e.categoria_id, "Outros"),
                "tipo": "entrada",
                "local": e.local,
            }
        )

    for s in saidas:
        lista_combinada.append(
            {
                "id": s.id,
                "data": str(s.data),
                "valor": s.valor,
                "descricao": s.descricao,
                "origem": s.origem,
                "categoria": nome_categorias.get(s.categoria_id, "Outros"),
                "tipo": "saida",
                "local": s.local,
            }
        )

    lista_combinada.sort(key=lambda x: x["data"], reverse=True)
    session.close()
    return jsonify(lista_combinada)


@app.route("/dados-graficos", methods=["GET"])
@jwt_required()
def dados_graficos():
    usuario_id = get_jwt_identity()
    session = Session()

    # Filtra tudo pelo usuário
    entradas = session.query(Entrada).filter_by(usuario_id=usuario_id).all()
    saidas = session.query(Saida).filter_by(usuario_id=usuario_id).all()
    cats = session.query(Categoria).filter_by(usuario_id=usuario_id).all()
    nome_cats = {c.id: c.principal for c in cats}

    # Mapa
    pontos_mapa = []

    def processar_gps(item, tipo):
        if item.local and "," in item.local:
            try:
                lat, lng = item.local.split(",")
                return {
                    "lat": float(lat),
                    "lng": float(lng),
                    "valor": item.valor,
                    "descricao": item.descricao,
                    "tipo": tipo,
                }
            except:
                return None

    for e in entradas:
        p = processar_gps(e, "entrada")
        if p:
            pontos_mapa.append(p)
    for s in saidas:
        p = processar_gps(s, "saida")
        if p:
            pontos_mapa.append(p)

    # Gráfico
    soma_por_categoria = {}
    for t in entradas + saidas:
        if t.categoria_id:
            nome = nome_cats.get(t.categoria_id, "Outros")
            soma_por_categoria[nome] = soma_por_categoria.get(nome, 0) + t.valor

    session.close()
    return jsonify(
        {
            "mapa": pontos_mapa,
            "grafico": {
                "labels": list(soma_por_categoria.keys()),
                "data": list(soma_por_categoria.values()),
            },
        }
    )


@app.route("/exportar", methods=["GET"])
@jwt_required()
def exportar_relatorio():
    usuario_id = get_jwt_identity()
    session = Session()

    entradas = session.query(Entrada).filter_by(usuario_id=usuario_id).all()
    saidas = session.query(Saida).filter_by(usuario_id=usuario_id).all()
    categorias = session.query(Categoria).filter_by(usuario_id=usuario_id).all()
    nome_cats = {c.id: c.principal for c in categorias}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Data", "Tipo", "Descrição", "Categoria", "Valor", "Local"])

    for e in entradas:
        writer.writerow(
            [
                e.id,
                e.data,
                "Entrada",
                e.descricao,
                nome_cats.get(e.categoria_id, ""),
                e.valor,
                e.local,
            ]
        )
    for s in saidas:
        writer.writerow(
            [
                s.id,
                s.data,
                "Saída",
                s.descricao,
                nome_cats.get(s.categoria_id, ""),
                f"-{s.valor}",
                s.local,
            ]
        )

    output.seek(0)
    session.close()

    mem = io.BytesIO()
    mem.write(output.getvalue().encode("utf-8"))
    mem.seek(0)

    return send_file(
        mem, as_attachment=True, download_name="relatorio.csv", mimetype="text/csv"
    )


# --- ROTAS DE RECUPERAÇÃO DE SENHA (MANTIDAS) ---
@app.route("/esqueci-senha", methods=["POST"])
def esqueci_senha():
    # ... (Mantenha a lógica de enviar email aqui se desejar, ou copie do seu arquivo anterior)
    # Para economizar espaço, se não estiver usando agora, pode deixar simples:
    return jsonify({"msg": "Funcionalidade em manutenção"}), 503


@app.route("/debug/usuarios", methods=["GET"])
def debug_usuarios():
    session = Session()
    users = session.query(Usuario).all()
    lista = []
    for u in users:
        lista.append(
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "senha_hash_preview": u.senha_hash[:10]
                + "...",  # Só o começo pra confirmar que é hash
            }
        )
    session.close()
    return jsonify(lista)


# Iniciar App
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
