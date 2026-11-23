from pydantic import ConfigDict, EmailStr, field_validator
from sqlmodel import Field

from app.core.schemas import Schema


class UserCreate(Schema):
    model_config = ConfigDict(str_strip_whitespace=False)
    username: str = Field(min_length=1, max_length=100)
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator('username', 'full_name', 'email', mode='before')
    @classmethod
    def strip_profile(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator('password', mode='before')
    @classmethod
    def password_bytes(cls, value: str) -> str:
        if isinstance(value, str) and len(value.encode('utf-8')) > 72:
            raise ValueError('La contraseña admite hasta 72 bytes UTF-8')
        return value


class LoginResponse(Schema):
    message: str
