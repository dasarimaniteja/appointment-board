from database import Base, engine, SessionLocal
from models import Appointment
from datetime import date, time

# Make sure database tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Add sample appointments
samples = [
    Appointment(
        title="Team Standup",
        description="Daily team synchronization meeting",
        date=date(2026, 9, 10),
        start_time=time(10, 0),
        end_time=time(10, 30),
        status="scheduled"
    ),
    Appointment(
        title="Client Discussion",
        description="Discuss project requirements with the client",
        date=date(2026, 9, 10),
        start_time=time(14, 0),
        end_time=time(15, 0),
        status="scheduled"
    ),
    Appointment(
        title="Project Review",
        description="Review current sprint progress and tasks",
        date=date(2026, 9, 11),
        start_time=time(11, 0),
        end_time=time(12, 0),
        status="completed"
    ),
    Appointment(
        title="Product Demo",
        description="Product demonstration meeting",
        date=date(2026, 9, 12),
        start_time=time(15, 0),
        end_time=time(16, 0),
        status="cancelled"
    )
]

db.add_all(samples)
db.commit()
db.close()

print("Sample appointments added successfully!")