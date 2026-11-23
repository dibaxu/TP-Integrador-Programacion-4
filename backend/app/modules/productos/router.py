from fastapi import APIRouter, Depends, HTTPException, Query, Response
from app.core.deps import require_role
from app.core.errors import DomainError
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductoStockUpdate, ProductoUpdate, ProductosPaginados,
)
from app.modules.productos.service import ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix='/productos', tags=['Productos'])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get('', response_model=ProductosPaginados)
def listar(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
           search: str | None = None, categoria_id: int | None = Query(None, ge=1),
           disponible: bool | None = None, service: ProductoService = Depends(get_producto_service)):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get('/{id}', response_model=ProductoRead)
def obtener(id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(id)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.post('', response_model=ProductoRead, status_code=201,
             dependencies=[Depends(require_role(['admin']))])
def crear(data: ProductoCreate, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.crear(data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.put('/{id}', response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def actualizar(id: int, data: ProductoUpdate, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.actualizar(id, data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.patch('/{id}/stock', response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def stock(id: int, data: ProductoStockUpdate, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.actualizar(id, data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.delete('/{id}', status_code=204, dependencies=[Depends(require_role(['admin']))])
def eliminar(id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        service.eliminar(id)
        return Response(status_code=204)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error
