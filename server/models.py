from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped
from sqlalchemy.orm import mapped_column
from pydantic import BaseModel

class Base(DeclarativeBase):
    pass

class Pokemon(Base):
    __tablename__ = "pokemon" 
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    sprites: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, index=True)
    number: Mapped[int] = mapped_column(Integer)

class Pokemon_Base(BaseModel):
    name: str
    sprites: str
    description: str
    number: int

