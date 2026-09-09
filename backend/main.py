from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Appointment
from schemas import AppointmentCreate, AppointmentResponse


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appointment Board API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Appointment Board API is running!"}


@app.get("/appointments", response_model=list[AppointmentResponse])
def get_appointments(
    date: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)

    # Filter by date
    if date:
        query = query.filter(Appointment.date == date)

    # Filter by status
    if status:
        query = query.filter(Appointment.status == status)

    appointments = query.order_by(
        Appointment.date,
        Appointment.start_time
    ).all()

    return appointments


@app.post("/appointments", response_model=AppointmentResponse)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):
    if appointment.end_time <= appointment.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    existing_appointment = db.query(Appointment).filter(
        Appointment.date == appointment.date,
        Appointment.status != "cancelled",
        Appointment.start_time < appointment.end_time,
        Appointment.end_time > appointment.start_time
    ).first()

    if existing_appointment:
        raise HTTPException(
            status_code=400,
            detail="This time slot overlaps with an existing appointment"
        )

    new_appointment = Appointment(
        title=appointment.title,
        description=appointment.description,
        date=appointment.date,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        status="scheduled"
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment


@app.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):
    existing_appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not existing_appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    if appointment.end_time <= appointment.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    conflicting_appointment = db.query(Appointment).filter(
        Appointment.id != appointment_id,
        Appointment.date == appointment.date,
        Appointment.status != "cancelled",
        Appointment.start_time < appointment.end_time,
        Appointment.end_time > appointment.start_time
    ).first()

    if conflicting_appointment:
        raise HTTPException(
            status_code=400,
            detail="This time slot overlaps with an existing appointment"
        )

    existing_appointment.title = appointment.title
    existing_appointment.description = appointment.description
    existing_appointment.date = appointment.date
    existing_appointment.start_time = appointment.start_time
    existing_appointment.end_time = appointment.end_time

    db.commit()
    db.refresh(existing_appointment)

    return existing_appointment


@app.patch(
    "/appointments/{appointment_id}/complete",
    response_model=AppointmentResponse
)
def complete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    appointment.status = "completed"

    db.commit()
    db.refresh(appointment)

    return appointment


@app.patch(
    "/appointments/{appointment_id}/cancel",
    response_model=AppointmentResponse
)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    appointment.status = "cancelled"

    db.commit()
    db.refresh(appointment)

    return appointment