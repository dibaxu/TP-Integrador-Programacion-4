from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import get_settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import LoginResponse, UserCreate
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix='/auth', tags=['Autenticación'])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post('/register', response_model=UserPublic, status_code=201)
def registrar(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.registrar(data)


@router.post('/token', response_model=LoginResponse)
def login(response: Response, form: OAuth2PasswordRequestForm = Depends(),
          service: AuthService = Depends(get_auth_service)):
    token = service.autenticar(form.username, form.password)
    settings = get_settings()
    response.set_cookie('access_token', token, httponly=True, samesite='lax', path='/',
                        secure=settings.FRONTEND_ORIGIN.startswith('https://'),
                        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return {'message': 'Login exitoso'}


@router.post('/logout', response_model=LoginResponse)
def logout(response: Response):
    response.delete_cookie('access_token', httponly=True, samesite='lax', path='/',
                           secure=get_settings().FRONTEND_ORIGIN.startswith('https://'))
    return {'message': 'Sesión cerrada'}


@router.get('/me', response_model=UserPublic)
def me(user: UserPublic = Depends(get_current_active_user)):
    return user
