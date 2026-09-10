
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://appointment-board-api.onrender.com";

function App() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  // Load appointments when the page opens
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Get appointments from backend
  const fetchAppointments = async (
    date = filterDate,
    status = filterStatus
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      if (status) {
        params.append("status", status);
      }

      const queryString = params.toString();

      const url =
        API_URL +
        "/appointments" +
        (queryString ? "?" + queryString : "");

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      alert("Unable to load appointments. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Open Add Appointment form
  const handleAddAppointment = () => {
    setEditingId(null);

    setForm({
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
    });

    setShowForm(true);
  };

  // Open Edit Appointment form
  const handleEdit = (appointment) => {
    setEditingId(appointment.id);

    setForm({
      title: appointment.title,
      description: appointment.description || "",
      date: appointment.date,
      start_time: appointment.start_time.slice(0, 5),
      end_time: appointment.end_time.slice(0, 5),
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Add or update appointment
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Frontend validation
    if (!form.title.trim()) {
      alert("Please enter an appointment title.");
      return;
    }

    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    if (!form.start_time || !form.end_time) {
      alert("Please select both start and end time.");
      return;
    }

    if (form.end_time <= form.start_time) {
      alert("End time must be after start time.");
      return;
    }

    try {
      const isEditing = editingId !== null;

      let url = API_URL + "/appointments";
      let method = "POST";

      if (isEditing) {
        url = API_URL + "/appointments/" + editingId;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Something went wrong.");
        return;
      }

      if (isEditing) {
        alert("Appointment updated successfully!");
      } else {
        alert("Appointment created successfully!");
      }

      resetForm();

      await fetchAppointments();
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // Complete appointment
  const handleComplete = async (id) => {
    try {
      const url =
        API_URL +
        "/appointments/" +
        id +
        "/complete";

      const response = await fetch(url, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to complete appointment."
        );
        return;
      }

      alert("Appointment marked as completed!");

      await fetchAppointments();
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const url =
        API_URL +
        "/appointments/" +
        id +
        "/cancel";

      const response = await fetch(url, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to cancel appointment."
        );
        return;
      }

      alert("Appointment cancelled successfully!");

      await fetchAppointments();
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // Date filter
  const handleDateFilter = (event) => {
    const selectedDate = event.target.value;

    setFilterDate(selectedDate);

    fetchAppointments(
      selectedDate,
      filterStatus
    );
  };

  // Status filter
  const handleStatusFilter = (event) => {
    const selectedStatus = event.target.value;

    setFilterStatus(selectedStatus);

    fetchAppointments(
      filterDate,
      selectedStatus
    );
  };

  // Clear filters
  const clearFilters = () => {
    setFilterDate("");
    setFilterStatus("");

    fetchAppointments("", "");
  };

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <div>
          <h1>Appointment Board</h1>

          <p>
            Manage your team's appointments easily
          </p>
        </div>

        <button
          className="add-button"
          onClick={handleAddAppointment}
        >
          + Add Appointment
        </button>

      </header>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (
        <form
          className="appointment-form"
          onSubmit={handleSubmit}
        >

          <h2>
            {editingId !== null
              ? "Edit Appointment"
              : "Add Appointment"}
          </h2>


          {/* Title */}

          <label>
            Title *
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Team Meeting"
            required
          />


          {/* Description */}

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter appointment details"
          />


          {/* Date and time */}

          <div className="form-row">

            <div>
              <label>
                Date *
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>


            <div>
              <label>
                Start Time *
              </label>

              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>


            <div>
              <label>
                End Time *
              </label>

              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>

          </div>


          {/* Form buttons */}

          <div className="form-actions">

            <button
              type="submit"
              className="save-button"
            >
              {editingId !== null
                ? "Update Appointment"
                : "Save Appointment"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
            >
              Cancel
            </button>

          </div>

        </form>
      )}


      {/* =========================
          FILTERS
      ========================= */}

      <section className="filters">

        <div>
          <label>
            Date
          </label>

          <input
            type="date"
            value={filterDate}
            onChange={handleDateFilter}
          />
        </div>


        <div>
          <label>
            Status
          </label>

          <select
            value={filterStatus}
            onChange={handleStatusFilter}
          >

            <option value="">
              All Statuses
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>
        </div>


        <button
          type="button"
          className="clear-filter"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </section>


      {/* =========================
          APPOINTMENT LIST
      ========================= */}

      <main className="appointments">

        <h2>
          Appointments
        </h2>


        {loading ? (

          <p>
            Loading appointments...
          </p>

        ) : appointments.length === 0 ? (

          <p>
            No appointments found.
          </p>

        ) : (

          appointments.map((appointment) => (

            <div
              className={
                "appointment-card " +
                appointment.status
              }
              key={appointment.id}
            >

              {/* Appointment information */}

              <div className="appointment-info">

                <h3>
                  {appointment.title}
                </h3>

                <p>
                  {appointment.description ||
                    "No description provided"}
                </p>


                <div className="appointment-time">

                  <span>
                    📅 {appointment.date}
                  </span>

                  <span>
                    🕐{" "}
                    {appointment.start_time.slice(0, 5)}
                    {" - "}
                    {appointment.end_time.slice(0, 5)}
                  </span>

                </div>

              </div>


              {/* Appointment actions */}

              <div className="appointment-actions">

                {/* Status */}

                <span
                  className={
                    "status " +
                    appointment.status
                  }
                >
                  {appointment.status}
                </span>


                {/* Edit */}

                <button
                  type="button"
                  onClick={() =>
                    handleEdit(appointment)
                  }
                >
                  Edit
                </button>


                {/* Complete and Cancel */}

                {appointment.status ===
                  "scheduled" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleComplete(
                          appointment.id
                        )
                      }
                    >
                      Complete
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCancel(
                          appointment.id
                        )
                      }
                    >
                      Cancel
                    </button>
                  </>
                )}

              </div>

            </div>

          ))

        )}

      </main>

    </div>
  );
}

export default App;

