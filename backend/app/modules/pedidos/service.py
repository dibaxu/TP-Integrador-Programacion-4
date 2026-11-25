from app.core.errors import DomainError
from app.modules.pedidos.models import DetallePedido, Pedido, utcnow
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoService
from app.modules.usuarios.schemas import UserPublic


class PedidoNoEncontrado(DomainError):
    status_code = 404


class PedidoAjeno(DomainError):
    status_code = 403


class StockInsuficiente(DomainError):
    pass


class ProductoNoDisponible(DomainError):
    pass


class ProductoRepetido(DomainError):
    pass


class TransicionInvalida(DomainError):
    pass


TRANSICIONES = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(),
    'CANCELADO': set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _get(uow, identifier: int, user: UserPublic, lock: bool = False) -> Pedido:
        order = uow.pedidos.get_by_id(identifier, lock=lock)
        if order is None:
            raise PedidoNoEncontrado('Pedido no encontrado')
        if user.role != 'admin' and order.usuario_id != user.id:
            raise PedidoAjeno('El pedido pertenece a otro usuario')
        return order

    def listar(self, user: UserPublic, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            total, items = uow.pedidos.list_by_usuario(
                None if user.role == 'admin' else user.id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, identifier: int, user: UserPublic) -> PedidoRead:
        with self.uow as uow:
            return PedidoRead.model_validate(self._get(uow, identifier, user))

    def crear(self, data: PedidoCreate, user_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido('Un producto no puede repetirse en el pedido')
            order = uow.pedidos.add(Pedido(usuario_id=user_id, forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega, notas=data.notas))            
            for item in sorted(data.items, key=lambda item: item.producto_id):
                product = ProductoService.active(uow, item.producto_id, True)
                if not product.disponible:
                    raise ProductoNoDisponible(f'{product.nombre} no está disponible')
                if product.stock < item.cantidad:
                    raise StockInsuficiente(f'Stock insuficiente para {product.nombre}')
                product.stock -= item.cantidad
                subtotal = product.precio_base * item.cantidad
                order.items.append(DetallePedido(producto_id=product.id, cantidad=item.cantidad,
                    nombre_producto=product.nombre, precio_unitario=product.precio_base, subtotal=subtotal))
                order.total += subtotal
            uow.session.flush()
            return PedidoRead.model_validate(order)

    def cambiar_estado(self, identifier: int, estado: str, user: UserPublic,
                       solo_dueno: bool = False) -> PedidoRead:
        with self.uow as uow:
            order = self._get(uow, identifier, user, True)
            if solo_dueno:
                if order.usuario_id != user.id:
                    raise PedidoAjeno('El pedido pertenece a otro usuario')
                if order.estado != 'PENDIENTE':
                    raise TransicionInvalida('Solo podés cancelar pedidos pendientes')
            if estado not in TRANSICIONES[order.estado]:
                raise TransicionInvalida('Transición de estado inválida')
            if estado == 'CANCELADO':
                for item in sorted(order.items, key=lambda item: item.producto_id):                    
                    product = uow.productos.get_by_id(item.producto_id, lock=True)
                    product.stock += item.cantidad
            order.estado = estado
            order.updated_at = utcnow()
            return PedidoRead.model_validate(order)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            counts, today, income = uow.pedidos.resumen()
            return ResumenPedidos(pendientes=counts.get('PENDIENTE', 0),
                en_preparacion=counts.get('EN_PREPARACION', 0), entregados=counts.get('ENTREGADO', 0),
                cancelados=counts.get('CANCELADO', 0), pedidos_hoy=today, ingresos_entregados=income)
