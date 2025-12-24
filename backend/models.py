from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)

    # Login Básico
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha_hash = Column(String, nullable=False)

    # Dados de Perfil (Agora Opcionais no início)
    nome_completo = Column(String, nullable=True)
    nascimento = Column(Date, nullable=True)
    telefone = Column(String, nullable=True)  # <--- NOVO CAMPO
    foto_path = Column(String, nullable=True)


class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    principal = Column(String, nullable=False)
    estabelecimento = Column(String)
    # Vínculo com Usuário
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)


class Entrada(Base):
    __tablename__ = "entradas"
    id = Column(Integer, primary_key=True)
    valor = Column(Float, nullable=False)
    descricao = Column(String)
    data = Column(Date, nullable=False)
    local = Column(String)  # GPS
    origem = Column(String)  # Ex: Pix, Dinheiro

    # Chaves Estrangeiras
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)


class Saida(Base):
    __tablename__ = "saidas"
    id = Column(Integer, primary_key=True)
    valor = Column(Float, nullable=False)
    descricao = Column(String)
    data = Column(Date, nullable=False)
    local = Column(String)  # GPS
    origem = Column(String)  # Ex: Cartão, Boleto

    # Chaves Estrangeiras
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
