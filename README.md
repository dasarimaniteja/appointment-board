# Appointment Board

A simple full-stack Appointment Board application built as part of the Full Stack Developer Intern technical assignment.

The application allows a small team to create, view, edit, complete, cancel, and filter appointments while preventing overlapping time slots.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy

### Database
- SQLite

SQLite is used for the local assignment/demo setup because it requires no separate database server or configuration.

## Features

- View all appointments
- Add new appointments
- Edit existing appointments
- Mark appointments as completed
- Cancel appointments
- Cancelled appointments remain visible
- Filter appointments by date
- Filter appointments by status
- Prevent overlapping appointment time slots
- Validate required fields
- Validate that end time is after start time
- Display success and error messages
- Includes sample appointments for demonstration

## Project Structure

```text
ASSIGNMENT/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md