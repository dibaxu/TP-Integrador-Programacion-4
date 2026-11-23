from fastapi import Depends, HTTPException, Request

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(request: Request) -> UserPublic:
    token = request.cookies.get('access_token')
    user_id = decode_access_token(token) if token else None
    with UsuarioUnitOfWork() as uow:
        user = uow.usuarios.get_by_id(user_id) if user_id is not None else None
        if user is None:
            raise HTTPException(401, 'Sesión inválida o expirada')
        return UserPublic.model_validate(user)


def get_current_active_user(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if user.disabled:
        raise HTTPException(400, 'Cuenta de usuario desactivada')
    return user


def require_role(roles: list[str]):
    def dependency(user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(403, 'Acceso denegado')
        return user
    return dependency
