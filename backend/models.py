from sqlalchemy import Column, Integer, String, Text, Date, Time, DateTime
from datetime import datetime

from database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(20), default="scheduled", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)