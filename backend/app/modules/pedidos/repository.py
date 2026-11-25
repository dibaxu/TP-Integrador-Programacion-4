from datetime import datetime, time, timedelta, timezone
from sqlmodel import Session, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(self, usuario_id: int | None, skip: int, limit: int, estado: str | None):
        statement = select(Pedido)
        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)
        if estado:
            statement = statement.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()
        items = self.session.exec(statement.order_by(Pedido.id.desc()).offset(skip).limit(limit)).all()
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        return dict(self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all())

    def resumen(self):        
        start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
        today = self.session.exec(select(func.count()).select_from(Pedido)
            .where(Pedido.created_at >= start, Pedido.created_at < start + timedelta(days=1))).one()
        income = self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0))
                                  .where(Pedido.estado == 'ENTREGADO')).one()
        return self.count_by_estado(), today, income
