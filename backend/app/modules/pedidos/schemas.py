from datetime import datetime
from typing import Literal
from sqlmodel import Field
from app.core.schemas import Schema

EstadoPedido = Literal['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']


class ItemPedidoCreate(Schema):
    producto_id: int = Field(ge=1)
    cantidad: int = Field(ge=1)


class PedidoCreate(Schema):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: Literal['EFECTIVO', 'TRANSFERENCIA']
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None


class DetallePedidoRead(Schema):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(Schema):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: Literal['EFECTIVO', 'TRANSFERENCIA']
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(Schema):
    total: int
    items: list[PedidoRead]


class CambioEstado(Schema):
    estado: EstadoPedido


class ResumenPedidos(Schema):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
