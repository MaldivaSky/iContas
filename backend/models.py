from sqlalchemy import create_engine, Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship  # <--- CORREÇÃO AQUI
from sqlalchemy.sql import func

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True)
    nome_completo = Column(String)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    senha_hash = Column(String)
    nascimento = Column(Date)
    foto_path = Column(String)  # Armazena o Base64 da foto


class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    principal = Column(String)
    estabelecimento = Column(String)
    # Agora a categoria tem dono obrigatório
    usuario_id = Column(Integer, ForeignKey("usuario.id"))
    usuario = relationship("Usuario")


class Entrada(Base):
    __tablename__ = "entradas"
    id = Column(Integer, primary_key=True)
    data = Column(Date)
    valor = Column(Float)
    origem = Column(String)
    descricao = Column(String)
    local = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))
    
    usuario = relationship("Usuario")
    categoria = relationship("Categoria")


class Saida(Base):
    __tablename__ = "saidas"
    id = Column(Integer, primary_key=True)
    data = Column(Date)
    valor = Column(Float)
    origem = Column(String)
    descricao = Column(String)
    local = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))

    usuario = relationship("Usuario")
    categoria = relationship("Categoria")
