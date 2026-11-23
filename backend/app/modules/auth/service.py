from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(str(data.email)):
                    raise HTTPException(409, 'El usuario o email ya existe')
                user = uow.usuarios.add(Usuario(**data.model_dump(exclude={'password'}),
                                                hashed_password=hash_password(data.password)))
                return UserPublic.model_validate(user)
        except IntegrityError as error:
            raise HTTPException(409, 'El usuario o email ya existe') from error

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if (user is None or len(password.encode('utf-8')) > 72
                    or not verify_password(password, user.hashed_password)):
                raise HTTPException(401, 'Credenciales incorrectas')
            if user.disabled:
                raise HTTPException(400, 'Cuenta de usuario desactivada')
            return create_access_token(user.id)
