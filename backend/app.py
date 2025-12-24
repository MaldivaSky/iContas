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
"""
Configuração de email e JWT via variáveis de ambiente.

IMPORTANTE:
- Não coloque credenciais diretamente no código.
- Defina as variáveis em `backend/.env` (não comitar) ou no ambiente do servidor.
"""

# Mail settings (lê de variáveis de ambiente, com valores padrão para servidor/porta)
app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", 465))
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
# Use strings "True"/"False" nas variáveis se quiser sobrescrever
app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", "False").lower() in ("true", "1", "yes")
app.config["MAIL_USE_SSL"] = os.environ.get("MAIL_USE_SSL", "True").lower() in ("true", "1", "yes")
mail = Mail(app)

# JWT secret (recomenda-se definir em ambiente de produção)
# Se não definido, gera um secret temporário (apenas para desenvolvimento local)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY") or os.urandom(24).hex()
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
# --- ROTA QUE O DASHBOARD ESTÁ PROCURANDO ---
@app.route("/home", methods=["GET"])
@jwt_required()
def home_data():
    usuario_id = get_jwt_identity()
    session = Session()

    # 1. Busca os valores no banco
    entradas = session.query(Entrada).filter_by(usuario_id=usuario_id).all()
    saidas = session.query(Saida).filter_by(usuario_id=usuario_id).all()

    # 2. Faz a matemática
    total_entrada = sum([e.valor for e in entradas])
    total_saida = sum([s.valor for s in saidas])
    saldo = total_entrada - total_saida

    session.close()

    # 3. Entrega os números para o Frontend
    return (
        jsonify({"entradas": total_entrada, "saidas": total_saida, "saldo": saldo}),
        200,
    )


# ==============================================================================
# 👤 4. ROTAS DE USUÁRIO (REGISTRO, LOGIN, PERFIL)
# ==============================================================================

@app.route("/registro", methods=["POST"])
def registrar():
    session = Session()
    try:
        # Agora recebemos JSON simples, pois não tem upload de foto aqui
        dados = request.json

        username_input = dados.get("username")
        email_input = dados.get("email")
        senha = dados.get("senha")

        if not username_input or not email_input or not senha:
            return jsonify({"erro": "Preencha usuário, email e senha!"}), 400

        username = username_input.lower()
        email = email_input.lower()

        if (
            session.query(Usuario)
            .filter((Usuario.email == email) | (Usuario.username == username))
            .first()
        ):
            return jsonify({"erro": "Usuário ou Email já existe!"}), 400

        # Cria usuário só com o básico. O resto fica NULL por enquanto.
        novo = Usuario(
            username=username,
            email=email,
            senha_hash=generate_password_hash(senha),
            nome_completo=username,  # Usa o user como nome provisório
        )

        session.add(novo)
        session.commit()
        return jsonify({"mensagem": "Conta criada! Faça login."}), 201

    except Exception as e:
        session.rollback()
        print(f"ERRO NO REGISTRO: {e}")
        return jsonify({"erro": str(e)}), 500
    finally:
        session.close()


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


# --- ATUALIZE A ROTA MEUS-DADOS (Para retornar o telefone também) ---
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
        "nascimento": str(usuario.nascimento) if usuario.nascimento else "",
        "telefone": usuario.telefone or "",  # Retorna vazio se for None
        "foto": usuario.foto_path,
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


@app.route("/atualizar-perfil", methods=["PUT"])
@jwt_required()
def atualizar_perfil():
    usuario_id = get_jwt_identity()
    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    dados = request.json

    if "nome_completo" in dados:
        usuario.nome_completo = dados["nome_completo"]

    if "telefone" in dados:
        usuario.telefone = dados["telefone"]

    if "nascimento" in dados and dados["nascimento"]:
        try:
            usuario.nascimento = datetime.strptime(
                dados["nascimento"], "%Y-%m-%d"
            ).date()
        except:
            pass  # Ignora se data vier inválida

    session.commit()
    session.close()
    return jsonify({"mensagem": "Perfil atualizado com sucesso!"})


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


@app.route("/categorias/<int:id>", methods=["PUT"])
@jwt_required()
def editar_categoria(id):
    usuario_id = get_jwt_identity()
    session = Session()
    d = request.json

    # 1. Busca a categoria garantindo que pertence ao usuário logado
    categoria = session.query(Categoria).filter_by(id=id, usuario_id=usuario_id).first()

    if not categoria:
        session.close()
        return (
            jsonify({"erro": "Categoria não encontrada ou você não tem permissão."}),
            404,
        )

    # 2. Atualiza os dados
    if "principal" in d:
        categoria.principal = d["principal"]
    if "estabelecimento" in d:
        categoria.estabelecimento = d["estabelecimento"]

    session.commit()
    session.close()
    return jsonify({"mensagem": "Categoria atualizada com sucesso!"}), 200


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


# --- ADICIONE ESTA NOVA ROTA PARA EDITAR TRANSAÇÕES ---
@app.route("/transacoes/<tipo>/<int:id>", methods=["PUT"])
@jwt_required()
def editar_transacao(tipo, id):
    usuario_id = get_jwt_identity()
    session = Session()
    d = request.json

    item = None
    if tipo == "entrada":
        item = session.query(Entrada).filter_by(id=id, usuario_id=usuario_id).first()
    elif tipo == "saida":
        item = session.query(Saida).filter_by(id=id, usuario_id=usuario_id).first()

    if not item:
        session.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    # Atualiza os campos que vieram no JSON
    if "descricao" in d:
        item.descricao = d["descricao"]
    if "valor" in d:
        item.valor = float(d["valor"])
    if "data" in d:
        item.data = datetime.strptime(d["data"], "%Y-%m-%d").date()
    # Se quiser permitir mudar categoria, adicione aqui também

    session.commit()
    session.close()
    return jsonify({"mensagem": "Transação atualizada!"}), 200


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
    # CORREÇÃO 1: Usar ponto e vírgula (;) para o Excel brasileiro separar as colunas
    writer = csv.writer(output, delimiter=";")

    writer.writerow(["ID", "Data", "Tipo", "Descrição", "Categoria", "Valor", "Local"])

    for e in entradas:
        writer.writerow(
            [
                e.id,
                e.data,
                "Entrada",
                e.descricao,
                nome_cats.get(e.categoria_id, ""),
                str(e.valor).replace(
                    ".", ","
                ),  # Opcional: Trocar ponto por vírgula no preço
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
                str(s.valor * -1).replace(".", ","),
                s.local,
            ]
        )

    output.seek(0)
    session.close()

    mem = io.BytesIO()
    # CORREÇÃO 2: 'utf-8-sig' adiciona uma marca (BOM) que faz o Excel ler os acentos corretamente
    mem.write(output.getvalue().encode("utf-8-sig"))
    mem.seek(0)

    return send_file(
        mem,
        as_attachment=True,
        download_name="relatorio_financeiro.csv",
        mimetype="text/csv",
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
