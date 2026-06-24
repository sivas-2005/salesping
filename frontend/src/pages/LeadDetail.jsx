import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Plus, Building2, Mail, Phone, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios";
import LeadForm from "../components/LeadForm";
import SequenceTimeline from "../components/SequenceTimeline";

const statusColors = {
  New: "#3b82f6", Contacted: "#f59e0b", Replied: "#8b5cf6",
  "Not Interested": "#ef4444", Converted: "#10b981",
};

const AddFollowUpForm = ({ leadId, onSuccess, onClose }) => {
  const [form, setForm] = useState({ type: "Email", scheduledDate: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduledDate) { toast.error("Scheduled date is required"); return; }
    setLoading(true);
    try {
      await api.post("/sequences", { leadId, ...form });
      toast.success("Follow-up step added!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add step");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Follow-up Step</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                {["Email", "Call", "Follow-up", "LinkedIn", "Meeting"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Scheduled Date *</label>
              <input type="date" value={form.scheduledDate}
                onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Message / Notes</label>
            <textarea rows={3} value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="What will you say or do?" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const fetchLead = async () => {
    try {
      const [leadRes, seqRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/sequences/lead/${id}`),
      ]);
      setLead(leadRes.data.lead);
      setSequences(seqRes.data.sequences);
    } catch {
      toast.error("Lead not found");
      navigate("/leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleUpdate = async (data) => {
    setEditLoading(true);
    try {
      const res = await api.put(`/leads/${id}`, data);
      setLead(res.data.lead);
      setShowEdit(false);
      toast.success("Lead updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${lead.name}? This will also delete all follow-up steps.`)) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success("Lead deleted");
      navigate("/leads");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!lead) return null;

  const sc = statusColors[lead.status] || "#6b7280";

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate("/leads")}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>
            <Edit2 size={15} /> Edit
          </button>
          <button className="btn btn-danger-ghost" onClick={handleDelete}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Lead Info */}
        <div className="card lead-info-card">
          <div className="lead-detail-header">
            <div className="lead-big-avatar">{lead.name[0]}</div>
            <div>
              <h2>{lead.name}</h2>
              {lead.company && <p className="lead-company-lg">{lead.company}</p>}
              <span className="status-badge-lg" style={{ background: sc + "22", color: sc, border: `1px solid ${sc}44` }}>
                {lead.status}
              </span>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item"><Mail size={15} /><span>{lead.email}</span></div>
            {lead.phone && <div className="info-item"><Phone size={15} /><span>{lead.phone}</span></div>}
            <div className="info-item"><Tag size={15} /><span>{lead.source} · {lead.priority} Priority</span></div>
            <div className="info-item"><Calendar size={15} />
              <span>Added {format(new Date(lead.createdAt), "MMM d, yyyy")}</span>
            </div>
            {lead.nextFollowUp && (
              <div className="info-item"><Calendar size={15} />
                <span>Next: {format(new Date(lead.nextFollowUp), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>

          {lead.notes && (
            <div className="notes-section">
              <h4>Notes</h4>
              <p>{lead.notes}</p>
            </div>
          )}

          {/* Quick status update */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>Update Status</label>
            <select
              value={lead.status}
              onChange={async (e) => {
                const res = await api.put(`/leads/${id}`, { status: e.target.value });
                setLead(res.data.lead);
                toast.success(`Status → ${e.target.value}`);
              }}
            >
              {["New", "Contacted", "Replied", "Not Interested", "Converted"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sequence Timeline */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">Follow-up Sequence ({sequences.length} steps)</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowFollowUp(true)}>
              <Plus size={14} /> Add Step
            </button>
          </div>
          <SequenceTimeline sequences={sequences} onRefresh={fetchLead} />
        </div>
      </div>

      {showEdit && (
        <LeadForm
          initialData={lead}
          onSubmit={handleUpdate}
          onClose={() => setShowEdit(false)}
          loading={editLoading}
        />
      )}

      {showFollowUp && (
        <AddFollowUpForm
          leadId={id}
          onSuccess={fetchLead}
          onClose={() => setShowFollowUp(false)}
        />
      )}
    </div>
  );
};

export default LeadDetail;
