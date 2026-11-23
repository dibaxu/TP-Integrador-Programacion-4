from typing import Generic, TypeVar

from sqlmodel import SQLModel, Session, select

T = TypeVar('T', bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, identifier: int, *, lock: bool = False) -> T | None:
        statement = select(self.model).where(self.model.id == identifier)
        if lock:
            statement = statement.with_for_update()
        return self.session.exec(statement).one_or_none()

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model).order_by(self.model.id)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
