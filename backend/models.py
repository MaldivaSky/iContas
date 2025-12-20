from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import declarative_base

engine = create_engine("sqlite:///financeiro.db")
Base = declarative_base()


# 1. Categoria
class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    principal = Column(String, nullable=False)
    estabelecimento = Column(String)  # Ex: Ifood, Uber (Opcional aqui, pode ser um padrão)


# 2. Entradas
class Entrada(Base):
    __tablename__ = "entradas"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    origem = Column(String)
    descricao = Column(String)
    local = Column(String)  # <--- NOVO CAMPO AQUI
    categoria_id = Column(Integer, ForeignKey("categorias.id"))


# 3. Saídas
class Saida(Base):
    __tablename__ = "saidas"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    origem = Column(String)
    descricao = Column(String)
    local = Column(String)  # <--- NOVO CAMPO AQUI
    categoria_id = Column(Integer, ForeignKey("categorias.id"))


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nome_completo = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    nascimento = Column(Date)
    foto_path = Column(String)
    codigo_reset = Column(String, nullable=True)


Base.metadata.create_all(engine)
print("Banco atualizado: GPS agora fica nas Entradas e Saídas!")
