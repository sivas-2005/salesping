import { useState } from "react";
import { X } from "lucide-react";

const LeadForm = ({ initialData = {}, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    company: initialData.company || "",
    phone: initialData.phone || "",
    status: initialData.status || "New",
    source: initialData.source || "Other",
    priority: initialData.priority || "Medium",
    notes: initialData.notes || "",
    nextFollowUp: initialData.nextFollowUp
      ? new Date(initialData.nextFollowUp).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData._id ? "Edit Lead" : "Add New Lead"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {["New", "Contacted", "Replied", "Not Interested", "Converted"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <select name="source" value={form.source} onChange={handleChange}>
                {["LinkedIn", "Cold Email", "Referral", "Website", "Event", "Other"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                {["Low", "Medium", "High"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Next Follow-up</label>
              <input name="nextFollowUp" type="date" value={form.nextFollowUp} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any notes about this lead..." />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : initialData._id ? "Update Lead" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
