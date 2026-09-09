from datetime import date, time
from pydantic import BaseModel, ConfigDict


class AppointmentBase(BaseModel):
    title: str
    description: str | None = None
    date: date
    start_time: time
    end_time: time


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentResponse(AppointmentBase):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)