import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, SkipForward, Trash2, Mail, Phone, RefreshCw, Linkedin, CalendarDays } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const typeIcons = {
  Email: Mail,
  Call: Phone,
  "Follow-up": RefreshCw,
  LinkedIn: Linkedin,
  Meeting: CalendarDays,
};

const statusColors = {
  Pending: { color: "#f59e0b", bg: "#fffbeb" },
  Completed: { color: "#10b981", bg: "#f0fdf4" },
  Skipped: { color: "#6b7280", bg: "#f9fafb" },
};

const SequenceTimeline = ({ sequences, onRefresh }) => {
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/sequences/${id}`, { status });
      toast.success(`Marked as ${status}`);
      onRefresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const deleteStep = async (id) => {
    if (!confirm("Delete this follow-up step?")) return;
    try {
      await api.delete(`/sequences/${id}`);
      toast.success("Step deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!sequences.length) {
    return (
      <div className="empty-state-small">
        <p>No follow-up steps yet. Add one below.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {sequences.map((seq, index) => {
        const Icon = typeIcons[seq.type] || Mail;
        const sc = statusColors[seq.status];
        const isLast = index === sequences.length - 1;

        return (
          <div key={seq._id} className="timeline-item">
            <div className="timeline-connector">
              <div
                className="timeline-dot"
                style={{ background: sc.color }}
              >
                {seq.status === "Completed" ? (
                  <CheckCircle2 size={14} color="#fff" />
                ) : seq.status === "Skipped" ? (
                  <SkipForward size={14} color="#fff" />
                ) : (
                  <Circle size={14} color="#fff" />
                )}
              </div>
              {!isLast && <div className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-type">
                  <Icon size={15} />
                  <span>Step {seq.stepNumber} — {seq.type}</span>
                </div>
                <span
                  className="status-badge-sm"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {seq.status}
                </span>
              </div>

              <p className="timeline-date">
                📅 {format(new Date(seq.scheduledDate), "MMM d, yyyy")}
              </p>

              {seq.message && <p className="timeline-message">"{seq.message}"</p>}
              {seq.outcome && <p className="timeline-outcome">✓ {seq.outcome}</p>}

              {seq.status === "Pending" && (
                <div className="timeline-actions">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={updating === seq._id}
                    onClick={() => updateStatus(seq._id, "Completed")}
                  >
                    ✓ Done
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    disabled={updating === seq._id}
                    onClick={() => updateStatus(seq._id, "Skipped")}
                  >
                    Skip
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteStep(seq._id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SequenceTimeline;
