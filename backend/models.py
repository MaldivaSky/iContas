from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nome_completo = Column(String)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    senha_hash = Column(String)
    nascimento = Column(Date)
    foto_path = Column(String)  # Base64 da foto


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
