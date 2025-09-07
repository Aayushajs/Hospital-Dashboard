import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../api";
import { Context } from "../../main";

const emptyMedicine = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  type: "",
});

const Prescriptions = () => {
  const { isDoctorAuthenticated } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    appointmentId: "",
    diagnosis: "",
    icdCode: "",
    symptomsText: "", // comma-separated helper
    symptoms: [],
    medicines: [emptyMedicine()],
    testsPrescribed: [],
    testText: "",
    vitalSigns: {
      bloodPressure: "",
      pulse: "",
      temperature: "",
      respiratoryRate: "",
      height: "",
      weight: "",
      bmi: "",
    },
    clinicalNotes: "",
    followUpInstructions: "",
    nextVisit: "",
    fee: { consultationFee: "", medicationFee: "" },
    isEmergency: false,
  });

  // Appointments for dropdown (only accepted ones)
  const [appointments, setAppointments] = useState([]);
  const [showApptDropdown, setShowApptDropdown] = useState(false);
  const [apptSearch, setApptSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const apptRef = useRef();
  const apptInputRef = useRef();

  const getPatientName = (a) => {
    if (!a) return "";
    // direct patientName
    if (a.patientName) return String(a.patientName).trim();
    // top-level first/last
    if (a.firstName || a.lastName)
      return `${a.firstName || ""} ${a.lastName || ""}`.trim();
    // nested patient object
    const p = a.patient || {};
    if (p.firstName || p.lastName)
      return `${p.firstName || ""} ${p.lastName || ""}`.trim();
    if (p.name) return String(p.name).trim();
    if (a.name) return String(a.name).trim();
    return "";
  };

  useEffect(() => {
    // Fetch doctor's appointments (accepted) when component mounts
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/appointment/getMyAppointments`,
          { withCredentials: true }
        );
        const data = res.data?.appointments || [];
        const accepted = data.filter(
          (a) => a.status && a.status.toLowerCase() === "accepted"
        );
        // Sort by date descending
        accepted.sort(
          (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
        );
        setAppointments(accepted);
      } catch (err) {
        console.error(
          "Failed to load appointments for prescriptions dropdown",
          err
        );
      }
    };
    fetchAppointments();
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        showApptDropdown &&
        apptRef.current &&
        !apptRef.current.contains(e.target)
      ) {
        setShowApptDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showApptDropdown]);

  // prevent page scroll when appt dropdown open
  useEffect(() => {
    const prev =
      typeof document !== "undefined" ? document.body.style.overflow : "";
    if (showApptDropdown && typeof document !== "undefined")
      document.body.style.overflow = "hidden";
    if (!showApptDropdown && typeof document !== "undefined")
      document.body.style.overflow = prev || "";
    return () => {
      if (typeof document !== "undefined")
        document.body.style.overflow = prev || "";
    };
  }, [showApptDropdown]);

  if (!isDoctorAuthenticated) {
    navigate("/doctor/login");
    return null;
  }

  const setField = (path, value) => {
    setForm((prev) => {
      const copy = { ...prev };
      const parts = path.split(".");
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]] = { ...cur[parts[i]] };
      }
      cur[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const addMedicine = () =>
    setForm((f) => ({ ...f, medicines: [...f.medicines, emptyMedicine()] }));
  const removeMedicine = (idx) =>
    setForm((f) => ({
      ...f,
      medicines: f.medicines.filter((_, i) => i !== idx),
    }));
  const updateMedicine = (idx, key, value) =>
    setForm((f) => {
      const meds = f.medicines.map((m, i) =>
        i === idx ? { ...m, [key]: value } : m
      );
      return { ...f, medicines: meds };
    });

  const addTest = () => {
    if (!form.testText.trim()) return;
    setForm((f) => ({
      ...f,
      testsPrescribed: [
        ...f.testsPrescribed,
        { name: f.testText.trim(), instructions: "" },
      ],
      testText: "",
    }));
  };

  const addSymptomsFromText = () => {
    const arr = form.symptomsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, symptoms: arr }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        appointmentId: form.appointmentId,
        diagnosis: form.diagnosis,
        icdCode: form.icdCode,
        symptoms: form.symptoms,
        medicines: form.medicines.filter((m) => m.name),
        testsPrescribed: form.testsPrescribed,
        vitalSigns: form.vitalSigns,
        clinicalNotes: form.clinicalNotes,
        followUpInstructions: form.followUpInstructions,
        nextVisit: form.nextVisit || null,
        fee: {
          consultationFee: Number(form.fee.consultationFee) || 0,
          medicationFee: Number(form.fee.medicationFee) || 0,
        },
        isEmergency: !!form.isEmergency,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/descriptions`,
        payload,
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Prescription added");
      navigate(`/doctor/appointment/${form.appointmentId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add prescription");
    }
    setLoading(false);
  };

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-inner">
        <h1 className="page-title">Add Prescription</h1>
        <form onSubmit={submit} className="prescriptions-form">
          <label>Appointment</label>
          <div
            className="appt-select"
            ref={apptRef}
            onClick={(e) => {
              setShowApptDropdown(true);
            }}
          >
            <input
              placeholder="Search appointment by patient name..."
              ref={apptInputRef}
              value={apptSearch}
              onChange={(e) => {
                setApptSearch(e.target.value);
                setShowApptDropdown(true);
              }}
              onFocus={() => {
                setShowApptDropdown(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setApptSearch("");
                setShowApptDropdown(true);
              }}
            />
            <input
              type="hidden"
              name="appointmentId"
              value={form.appointmentId}
            />
            <div className={`appt-dropdown ${showApptDropdown ? "open" : ""}`}>
              {appointments.length === 0 && (
                <div className="appt-empty">No accepted appointments found</div>
              )}
              {appointments
                .filter((a) => {
                  const q = apptSearch.trim().toLowerCase();
                  if (!q) return true;
                  const name = getPatientName(a).toLowerCase();
                  return name.includes(q);
                })
                .map((a) => (
                  <div
                    key={a._id || a.id}
                    className="appt-item"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent parent from re-opening the dropdown
                      const id = a._id || a.id || "";
                      const name =
                        getPatientName(a) ||
                        (a.firstName || "") + " " + (a.lastName || "");
                      setField("appointmentId", id);
                      setSelectedAppointment(a);
                      // fill the input with patient name only so selection shows patient
                      setApptSearch(name || "");
                      // close dropdown and do not refocus (avoids reopening)
                      setShowApptDropdown(false);
                    }}
                  >
                    <div className="appt-item-left">
                      <div className="appt-patient">
                        {a.firstName || "Unknown"} {a.lastName || ""}
                      </div>
                      <div className="appt-meta">
                        {(() => {
                          const dt = new Date(a.appointment_date);
                          return (
                            dt.toLocaleDateString() +
                            " " +
                            dt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          );
                        })()}{" "}
                        • {String(a._id || a.id).slice(0, 8)}
                      </div>
                    </div>
                    <div className="appt-status">{a.status}</div>
                  </div>
                ))}
            </div>
          </div>

          <label>Diagnosis</label>
          <input
            value={form.diagnosis}
            onChange={(e) => setField("diagnosis", e.target.value)}
          />

          <label>ICD Code</label>
          <input
            value={form.icdCode}
            onChange={(e) => setField("icdCode", e.target.value)}
          />

          <label>Symptoms (comma separated)</label>
          <input
            value={form.symptomsText}
            onChange={(e) => setField("symptomsText", e.target.value)}
            onBlur={addSymptomsFromText}
            placeholder="e.g. fever, cough"
          />

          <label>Medicines</label>
          {form.medicines.map((m, idx) => (
            <div key={idx} className="medicine-row">
              <input
                placeholder="Name"
                value={m.name}
                onChange={(e) => updateMedicine(idx, "name", e.target.value)}
              />
              <input
                placeholder="Dosage"
                value={m.dosage}
                onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
              />
              <input
                placeholder="Frequency"
                value={m.frequency}
                onChange={(e) =>
                  updateMedicine(idx, "frequency", e.target.value)
                }
              />
              <input
                placeholder="Duration"
                value={m.duration}
                onChange={(e) =>
                  updateMedicine(idx, "duration", e.target.value)
                }
              />
              <input
                placeholder="Type"
                value={m.type}
                onChange={(e) => updateMedicine(idx, "type", e.target.value)}
              />
              <button
                type="button"
                className="btn-small"
                onClick={() => removeMedicine(idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addMedicine}>
            Add Medicine
          </button>

          <label>Tests Prescribed</label>
          <div className="test-row">
            <input
              placeholder="Test name"
              value={form.testText}
              onChange={(e) => setField("testText", e.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={addTest}>
              Add Test
            </button>
          </div>
          <div className="tests-list">
            {form.testsPrescribed.map((t, i) => (
              <div key={i} className="test-item">
                {t.name}
              </div>
            ))}
          </div>

          <label>Vital Signs</label>
          <div className="vitals-grid">
            <input
              placeholder="Blood Pressure"
              value={form.vitalSigns.bloodPressure}
              onChange={(e) =>
                setField("vitalSigns.bloodPressure", e.target.value)
              }
            />
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              placeholder="e.g. 72"
              value={form.vitalSigns.pulse}
              onChange={(e) => setField("vitalSigns.pulse", e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="e.g. 36.6"
              value={form.vitalSigns.temperature}
              onChange={(e) =>
                setField("vitalSigns.temperature", e.target.value)
              }
            />
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              placeholder="e.g. 16"
              value={form.vitalSigns.respiratoryRate}
              onChange={(e) =>
                setField("vitalSigns.respiratoryRate", e.target.value)
              }
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="e.g. 170"
              value={form.vitalSigns.height}
              onChange={(e) => setField("vitalSigns.height", e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="e.g. 65.5"
              value={form.vitalSigns.weight}
              onChange={(e) => setField("vitalSigns.weight", e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="e.g. 22.5"
              value={form.vitalSigns.bmi}
              onChange={(e) => setField("vitalSigns.bmi", e.target.value)}
            />
          </div>

          <label>Clinical Notes</label>
          <textarea
            value={form.clinicalNotes}
            onChange={(e) => setField("clinicalNotes", e.target.value)}
          />

          <label>Follow Up Instructions</label>
          <input
            value={form.followUpInstructions}
            onChange={(e) => setField("followUpInstructions", e.target.value)}
          />

          <label>Next Visit</label>
          <input
            type="date"
            value={form.nextVisit}
            onChange={(e) => setField("nextVisit", e.target.value)}
          />

          <label>Fees</label>
          <div className="fee-row">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="e.g. 500"
              value={form.fee.consultationFee}
              onChange={(e) => setField("fee.consultationFee", e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="e.g. 150"
              value={form.fee.medicationFee}
              onChange={(e) => setField("fee.medicationFee", e.target.value)}
            />
          </div>

          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={form.isEmergency}
              onChange={(e) => setField("isEmergency", e.target.checked)}
            />{" "}
            Mark as emergency
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </form>
        {/* Selected appointment patient detail */}
        {selectedAppointment && (
          <div className="patient-card">
            <div className="patient-row">
              <strong>Patient:</strong> {selectedAppointment.firstName || "—"}{" "}
              {selectedAppointment.lastName || "—"}
            </div>
            <div className="patient-row">
              <strong>Phone:</strong>{" "}
              {selectedAppointment.patient?.phone ||
                selectedAppointment.phone ||
                "—"}
            </div>
            <div className="patient-row">
              <strong>Age/Gender:</strong>{" "}
              {selectedAppointment.gender
                ? `${selectedAppointment.age} / ${
                    selectedAppointment.gender || "—"
                  }`
                : "—"}
            </div>
            <div className="patient-row">
              <strong>Appointment Date:</strong>{" "}
              {new Date(selectedAppointment.appointment_date).toLocaleString()}
            </div>
            <div className="patient-row">
              <strong>Status:</strong> {selectedAppointment.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;

/* Inline styles (moved from Prescriptions.css) to keep single-file component per request */
const _styles = `
.prescriptions-page{padding:1.5rem 2rem; margin-left:var(--sidebar-shift,0); transition:margin-left .32s cubic-bezier(.4,0,.2,1);}
.prescriptions-inner{max-width:1100px;margin-left:auto;margin-right:auto;}
.page-title{font-size:1.5rem;color:#e6f0ff;margin:0 0 1rem 0;font-weight:700}
.prescriptions-form{display:flex;flex-direction:column;gap:0.75rem;} 
.prescriptions-form input,.prescriptions-form textarea{background:rgba(10,18,36,0.45);border:1px solid rgba(58,74,107,0.35);padding:0.65rem;border-radius:8px;color:#e9eef8;transition:none;} 
/* Remove colored border/focus rings for a clean professional look */
.prescriptions-form input:focus, .prescriptions-form textarea:focus { outline: none; box-shadow: none; border-color: rgba(58,74,107,0.35); }
.medicine-row{display:flex;gap:0.5rem;align-items:center;} 
.medicine-row input{flex:1;} 
.btn-small{background:transparent;border:1px solid rgba(148,163,184,0.06);color:#cbd5e1;padding:0.35rem 0.5rem;border-radius:6px;cursor:pointer;} 
.btn-secondary{background:transparent;border:1px solid rgba(148,163,184,0.06);color:#9fb0ff;padding:0.45rem 0.7rem;border-radius:8px;cursor:pointer;} 
.btn-primary{background:linear-gradient(90deg,#2563eb,#4f46e5);color:#fff;padding:0.6rem 0.9rem;border-radius:8px;border:none;cursor:pointer;} 
.form-actions{display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.6rem;} 
.vitals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;} 
.test-row{display:flex;gap:0.5rem;} 
.tests-list{display:flex;gap:0.5rem;flex-wrap:wrap;} 
.test-item{background:rgba(77,124,254,0.04);padding:0.35rem 0.6rem;border-radius:8px;color:#cfe1ff;border:1px solid rgba(77,124,254,0.04);} 
.fee-row{display:flex;gap:0.5rem;} 
.checkbox-inline{display:flex;align-items:center;gap:0.5rem;color:#cbd5e1;} 
@media(max-width:992px){.vitals-grid{grid-template-columns:repeat(2,1fr);} .medicine-row{flex-direction:column;align-items:stretch;}}
/* Appointment dropdown & patient card */
.appt-select{position:relative;overflow:visible;box-sizing:border-box;} /* allow dropdown to escape if needed */
.appt-select input{width:100%;box-sizing:border-box}
.appt-dropdown{position:absolute;left:0;right:0;width:100%;top:calc(100% + 6px);background:rgba(8,14,26,0.95);border:1px solid rgba(58,74,107,0.35);max-height:30vh;overflow:auto;border-radius:8px;padding:6px;margin-top:0;display:none;z-index:9999;box-shadow:0 8px 24px rgba(2,6,23,0.6);box-sizing:border-box}
.appt-dropdown.open{display:block}
.appt-item{display:flex;justify-content:space-between;gap:0.5rem;padding:0.6rem;border-bottom:1px solid rgba(58,74,107,0.04);cursor:pointer}
.appt-item:hover{background:rgba(255,255,255,0.02)}
.appt-patient{font-weight:600;color:#e6f0ff}
.appt-meta{font-size:0.85rem;color:#9fb0ff}
.appt-status{font-size:0.85rem;color:#93c5fd;align-self:center}
.appt-empty{padding:0.6rem;color:#98a2b3}
.patient-card{background:rgba(12,20,36,0.45);border:1px solid rgba(58,74,107,0.2);padding:0.75rem;border-radius:8px;margin-top:0.6rem;color:#e9eef8}
.patient-row{font-size:0.95rem;margin-bottom:0.25rem}
`;

if (typeof document !== "undefined") {
  const s = document.createElement("style");
  s.setAttribute("data-generated", "prescriptions-inline");
  s.innerHTML = _styles;
  document.head.appendChild(s);
}
