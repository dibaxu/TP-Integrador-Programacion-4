from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, max_length=100)
    full_name: str = Field(max_length=150)
    email: str = Field(unique=True, max_length=254)
    hashed_password: str
    role: str = 'user'
    disabled: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc),
                                 sa_type=DateTime(timezone=True))
    pedidos: list['Pedido'] = Relationship(back_populates='usuario')
