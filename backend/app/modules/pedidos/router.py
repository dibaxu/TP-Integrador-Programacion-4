from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_current_active_user, require_role
from app.core.errors import DomainError
from app.modules.pedidos.schemas import (
    CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos,
)
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix='/pedidos', tags=['Pedidos'])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post('', response_model=PedidoRead, status_code=201)
def crear(data: PedidoCreate, user: UserPublic = Depends(get_current_active_user),
          service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.crear(data, user.id)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.get('', response_model=PedidosPaginados)
def listar(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
           estado: EstadoPedido | None = None, user: UserPublic = Depends(get_current_active_user),
           service: PedidoService = Depends(get_pedido_service)):
    return service.listar(user, skip, limit, estado)


@router.get('/resumen', response_model=ResumenPedidos, dependencies=[Depends(require_role(['admin']))])
def resumen(service: PedidoService = Depends(get_pedido_service)):
    return service.resumen()


@router.get('/{id}', response_model=PedidoRead)
def obtener(id: int, user: UserPublic = Depends(get_current_active_user),
            service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.obtener(id, user)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.patch('/{id}/estado', response_model=PedidoRead)
def estado(id: int, data: CambioEstado, admin: UserPublic = Depends(require_role(['admin'])),
           service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.cambiar_estado(id, data.estado, admin)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.patch('/{id}/cancelar', response_model=PedidoRead)
def cancelar(id: int, user: UserPublic = Depends(get_current_active_user),
             service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.cambiar_estado(id, 'CANCELADO', user, solo_dueno=True)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error
