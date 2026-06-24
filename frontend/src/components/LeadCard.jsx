import { useNavigate } from "react-router-dom";
import { Building2, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  New: "#3b82f6",
  Contacted: "#f59e0b",
  Replied: "#8b5cf6",
  "Not Interested": "#ef4444",
  Converted: "#10b981",
};

const priorityBadge = {
  High: { bg: "#fef2f2", color: "#dc2626" },
  Medium: { bg: "#fffbeb", color: "#d97706" },
  Low: { bg: "#f0fdf4", color: "#16a34a" },
};

const LeadCard = ({ lead, onStatusChange }) => {
  const navigate = useNavigate();
  const statusColor = statusColors[lead.status] || "#6b7280";
  const priority = priorityBadge[lead.priority] || priorityBadge.Medium;

  return (
    <div className="lead-card" onClick={() => navigate(`/leads/${lead._id}`)}>
      <div className="lead-card-header">
        <div>
          <h3 className="lead-name">{lead.name}</h3>
          {lead.company && (
            <div className="lead-meta">
              <Building2 size={13} />
              <span>{lead.company}</span>
            </div>
          )}
        </div>
        <span
          className="status-badge"
          style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44` }}
        >
          {lead.status}
        </span>
      </div>

      <div className="lead-card-body">
        <div className="lead-meta">
          <Mail size={13} />
          <span>{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="lead-meta">
            <Phone size={13} />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.nextFollowUp && (
          <div className="lead-meta">
            <Calendar size={13} />
            <span>Follow-up: {format(new Date(lead.nextFollowUp), "MMM d, yyyy")}</span>
          </div>
        )}
      </div>

      <div className="lead-card-footer">
        <span
          className="priority-badge"
          style={{ background: priority.bg, color: priority.color }}
        >
          {lead.priority}
        </span>
        <span className="source-tag">{lead.source}</span>
        <select
          className="status-select"
          value={lead.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(lead._id, e.target.value)}
        >
          {["New", "Contacted", "Replied", "Not Interested", "Converted"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LeadCard;
