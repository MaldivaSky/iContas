import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_mail import Mail, Message
import random

# --- FERRAMENTAS DE SEGURANÇA (SENHA E ARQUIVO) ---
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# --- FERRAMENTAS DE TOKEN (JWT) - AQUI ESTAVA O ERRO ---
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

# --- SEUS MODELOS (TABELAS) ---
from models import Base, Categoria, Entrada, Saida, Usuario

app = Flask(__name__)
CORS(app)


engine = create_engine("sqlite:///financeiro.db")
Session = sessionmaker(bind=engine)

app = Flask(__name__)
CORS(app)

# ... Configurações de JWT e Upload (mantenha como estão) ...

# --- CONFIGURAÇÃO DO GMAIL ---
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = "[REDACTED_EMAIL]"  # <--- COLOQUE SEU GMAIL AQUI
app.config["MAIL_PASSWORD"] = (
    "[REDACTED_SMTP_PASSWORD]"  # <--- COLOQUE A SENHA DE APP DE 16 LETRAS AQUI
)
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
mail = Mail(app)  # Inicializa o correio

# --- CONFIGURAÇÃO DO JWT ---
app.config["JWT_SECRET_KEY"] = "[REDACTED_JWT_SECRET]"
# Iniciamos o gerenciador de token (Essa linha resolve o seu erro atual!)
jwt = JWTManager(app)


@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    print("=" * 30)
    print(f"🚨 ERRO DE TOKEN DETECTADO: {error_string}")
    print("=" * 30)
    return jsonify({"msg": error_string}), 422


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("=" * 30)
    print("🚨 ERRO: O TOKEN EXPIROU!")
    print("=" * 30)
    return jsonify({"msg": "Token expired"}), 401


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

# CONFIGURAÇÃO DE UPLOADS
UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# Função para verificar se a imagem é válida
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# --- ROTA DE REGISTRO ATUALIZADA (Com Foto!) ---
@app.route("/registro", methods=["POST"])
def registrar():
    session = Session()

    # Em upload de arquivo, os dados vêm em 'form', não 'json'
    nome_completo = request.form["nome_completo"]
    username = request.form["username"]
    email = request.form["email"]
    senha = request.form["senha"]
    nascimento = request.form["nascimento"]
    foto = request.files.get("foto")  # Pega o arquivo

    # Verifica duplicidade
    if (
        session.query(Usuario)
        .filter((Usuario.email == email) | (Usuario.username == username))
        .first()
    ):
        session.close()
        return jsonify({"erro": "Email ou Usuário já cadastrado!"}), 400

    # Salva a foto (se tiver)
    caminho_foto = None
    if foto and allowed_file(foto.filename):
        filename = secure_filename(
            f"{username}_{foto.filename}"
        )  # Evita nomes duplicados
        foto.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        caminho_foto = filename  # Salva só o nome no banco

    senha_segura = generate_password_hash(senha)

    novo = Usuario(
        nome_completo=nome_completo,
        username=username,
        email=email,
        senha_hash=senha_segura,
        nascimento=datetime.strptime(nascimento, "%Y-%m-%d").date(),
        foto_path=caminho_foto,
    )

    session.add(novo)
    session.commit()
    session.close()
    return jsonify({"mensagem": "Conta criada com sucesso!"}), 201


# --- ROTA DE LOGIN (Retorna a foto) ---
@app.route("/login", methods=["POST"])
def login():
    session = Session()
    dados = request.json

    print(
        f"Tentativa de login: {dados}"
    )  # <--- ADICIONE ISSO para ver no terminal o que chega!

    # AQUI ESTÁ O SEGREDO:
    # O React manda 'login', mas no banco temos que testar se é 'email' OU 'username'
    usuario = (
        session.query(Usuario)
        .filter(
            (Usuario.email == dados["login"]) | (Usuario.username == dados["login"])
        )
        .first()
    )

    session.close()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 401

    if not check_password_hash(usuario.senha_hash, dados["senha"]):
        return jsonify({"erro": "Senha incorreta"}), 401

    # Se chegou aqui, deu tudo certo!
    token = create_access_token(identity=str(usuario.id))

    url_foto = None
    if usuario.foto_path:
        # Garante que a URL esteja completa para o React não se perder
        url_foto = f"https://icontas.onrender.com/static/uploads/{usuario.foto_path}"

    return jsonify(
        {
            "token": token,
            "nome": usuario.nome_completo,
            "username": usuario.username,
            "foto": url_foto,
        }
    )


# --- ROTA 1: PEGAR DADOS DO PERFIL (Para mostrar na tela da foto) ---
@app.route("/meus-dados", methods=["GET"])
@jwt_required()
def meus_dados():
    usuario_id = get_jwt_identity()  # O token diz quem é o usuário
    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    url_foto = None
    if usuario.foto_path:
        url_foto = f"https://icontas.onrender.com/static/uploads/{usuario.foto_path}"

    dados = {
        "nome_completo": usuario.nome_completo,
        "email": usuario.email,
        "username": usuario.username,
        "nascimento": str(usuario.nascimento),
        "foto": url_foto,
    }
    session.close()
    return jsonify(dados)


# --- ROTA 2: ALTERAR SENHA (Usuário LOGADO) ---
@app.route("/alterar-senha", methods=["PUT"])
@jwt_required()
def alterar_senha():
    usuario_id = get_jwt_identity()
    dados = request.json
    nova_senha = dados.get("nova_senha")

    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    usuario.senha_hash = generate_password_hash(nova_senha)
    session.commit()
    session.close()

    return jsonify({"mensagem": "Senha atualizada com sucesso!"})


# --- ROTA 1: ENVIA O EMAIL COM LINK ---
@app.route("/esqueci-senha", methods=["POST"])
def esqueci_senha():
    email = request.json.get("email")
    session = Session()
    usuario = session.query(Usuario).filter_by(email=email).first()

    if not usuario:
        session.close()
        return jsonify({"erro": "E-mail não encontrado"}), 404

    # Gera um token que expira em 15 minutos
    # Usamos o ID do usuário como identidade do token
    expires = timedelta(minutes=15)
    token = create_access_token(identity=str(usuario.id), expires_delta=expires)

    # Cria o Link para o Frontend (React)
    # Note que a porta é 5173 (onde roda o site), não 5000 (onde roda o python)
    link = f"http://localhost:5173/redefinir-senha/{token}"

    # --- ENVIO DE E-MAIL ---
    try:
        msg = Message(
            subject="Redefinição de Senha - iContas",
            sender=app.config["MAIL_USERNAME"],
            recipients=[email],
            body=f"Olá, {usuario.nome_completo}!\n\nPara criar uma nova senha, clique no link abaixo:\n{link}\n\nEste link expira em 15 minutos.",
        )
        mail.send(msg)
        print(f"Link enviado: {link}")  # Debug no terminal caso o email falhe
    except Exception as e:
        print(f"Erro email: {e}")
        return jsonify({"erro": "Erro ao enviar email"}), 500

    session.close()
    return jsonify({"mensagem": "Link de recuperação enviado para seu e-mail!"})


# --- ROTA 2: RECEBE O TOKEN E A NOVA SENHA ---
@app.route("/resetar-senha-token", methods=["POST"])
@jwt_required()  # O token vem no Header ou via validação manual, mas aqui vamos validar o token que veio na URL
def resetar_senha_token():
    usuario_id = get_jwt_identity()  # O Flask extrai o ID de dentro do token do link
    dados = request.json
    nova_senha = dados.get("nova_senha")

    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    if not usuario:
        session.close()
        return jsonify({"erro": "Usuário inválido"}), 404

    # Atualiza a senha
    usuario.senha_hash = generate_password_hash(nova_senha)
    session.commit()

    # --- E-MAIL DE CONFIRMAÇÃO ---
    try:
        # Link para a tela de login do Frontend
        link_login = "http://localhost:5173/login"

        msg = Message(
            subject="Senha Alterada com Sucesso - iContas",
            sender=app.config["MAIL_USERNAME"],
            recipients=[usuario.email],
            body=f"""Olá, {usuario.nome_completo}!

Sua senha foi alterada com sucesso. Agora você já pode acessar sua conta.

Clique aqui para entrar:
{link_login}

Se você não fez essa alteração, entre em contato conosco imediatamente.""",
        )
        mail.send(msg)
    except Exception as e:
        print(f"Erro ao enviar confirmação: {e}")
        # Não retornamos erro aqui para não assustar o usuário, já que a senha FOI trocada.

    session.close()
    return jsonify({"mensagem": "Senha alterada com sucesso!"})


@app.route("/atualizar-foto", methods=["POST"])
@jwt_required()
def atualizar_foto():
    usuario_id = get_jwt_identity()
    arquivo = request.files.get("foto")  # Pega o arquivo enviado

    if not arquivo:
        return jsonify({"erro": "Nenhuma foto enviada"}), 400

    session = Session()
    usuario = session.query(Usuario).filter_by(id=usuario_id).first()

    if arquivo and allowed_file(arquivo.filename):
        # Cria um nome único para não substituir fotos de outros (usa o ID + timestamp)
        extensao = arquivo.filename.rsplit(".", 1)[1].lower()
        novo_nome = f"user_{usuario_id}_{int(datetime.now().timestamp())}.{extensao}"
        filename = secure_filename(novo_nome)

        # Salva na pasta
        arquivo.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        # Atualiza no banco
        usuario.foto_path = filename
        session.commit()

        # Gera a nova URL para devolver ao React
        nova_url = f"https://icontas.onrender.com/static/uploads/{filename}"

        session.close()
        return jsonify({"mensagem": "Foto atualizada!", "nova_foto": nova_url})

    session.close()
    return jsonify({"erro": "Arquivo inválido"}), 400


# --- ROTA PARA ESPIAR OS DADOS ---
@app.route("/admin/ver-usuarios")
def ver_usuarios():
    # Busca TODOS os usuários do banco
    todos = User.query.all()

    # Monta uma lista simples em HTML
    html_resposta = "<h1>Lista de Usuários (Acesso Restrito)</h1>"
    html_resposta += "<ul>"

    for u in todos:
        # Mostra ID, Nome e Email (ajuste os nomes dos campos se for diferente)
        html_resposta += f"<li>ID: {u.id} | Nome: {u.nome} | Email: {u.email}</li>"

    html_resposta += "</ul>"

    return html_resposta


if __name__ == "__main__":
    # host='0.0.0.0' libera o acesso para a rede Wi-Fi
    app.run(debug=True, host="0.0.0.0", port=5000)
