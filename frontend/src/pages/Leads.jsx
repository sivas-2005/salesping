import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Filter, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import LeadCard from "../components/LeadCard";
import LeadForm from "../components/LeadForm";

const STATUSES = ["All", "New", "Contacted", "Replied", "Not Interested", "Converted"];
const SOURCES = ["All", "LinkedIn", "Cold Email", "Referral", "Website", "Event", "Other"];
const PRIORITIES = ["All", "High", "Medium", "Low"];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    source: "All",
    priority: "All",
    page: 1,
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.search === "") delete params.search;
      const res = await api.get("/leads", { params });
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await api.post("/leads", data);
      toast.success("Lead added! 🎯");
      setShowForm(false);
      setFilters((p) => ({ ...p, page: 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add lead");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p className="page-subtitle">{pagination.total || 0} total leads</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search leads..."
          />
        </div>

        <div className="filter-group">
          <SlidersHorizontal size={15} />
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
          </select>
          <select value={filters.source} onChange={(e) => setFilter("source", e.target.value)}>
            {SOURCES.map((s) => <option key={s} value={s}>{s === "All" ? "All Sources" : s}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p === "All" ? "All Priority" : p}</option>)}
          </select>
        </div>
      </div>

      {/* Lead Cards Grid */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <p>No leads found.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add your first lead
          </button>
        </div>
      ) : (
        <div className="leads-grid">
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost"
            disabled={filters.page === 1}
            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
          >
            ← Prev
          </button>
          <span>Page {filters.page} of {pagination.pages}</span>
          <button
            className="btn btn-ghost"
            disabled={filters.page === pagination.pages}
            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next →
          </button>
        </div>
      )}

      {showForm && (
        <LeadForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default Leads;
