from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import declarative_base

engine = create_engine("sqlite:///financeiro.db")
Base = declarative_base()


# 1. Categoria (Agora mais simples, sem local)
class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    principal = Column(String, nullable=False)
    estabelecimento = Column(
        String
    )  # Ex: Ifood, Uber (Opcional aqui, pode ser um padrão)


# 2. Entradas (Agora COM local)
class Entrada(Base):
    __tablename__ = "entradas"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    origem = Column(String)
    descricao = Column(String)
    local = Column(String)  # <--- NOVO CAMPO AQUI
    categoria_id = Column(Integer, ForeignKey("categorias.id"))


# 3. Saídas (Agora COM local)
class Saida(Base):
    __tablename__ = "saidas"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    origem = Column(String)
    descricao = Column(String)
    local = Column(String)  # <--- NOVO CAMPO AQUI
    categoria_id = Column(Integer, ForeignKey("categorias.id"))


Base.metadata.create_all(engine)
print("Banco atualizado: GPS agora fica nas Entradas e Saídas!")
