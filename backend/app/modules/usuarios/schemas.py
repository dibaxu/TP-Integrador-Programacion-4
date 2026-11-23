from datetime import datetime
from typing import Literal

from pydantic import EmailStr
from app.core.schemas import Schema


class UserPublic(Schema):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: Literal['user', 'admin']
    disabled: bool
    created_at: datetime
