import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, TrendingUp, Bell, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  New: "#3b82f6",
  Contacted: "#f59e0b",
  Replied: "#8b5cf6",
  "Not Interested": "#ef4444",
  Converted: "#10b981",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, upcomingRes] = await Promise.all([
          api.get("/leads/stats"),
          api.get("/sequences/upcoming"),
        ]);
        setStats(statsRes.data.stats);
        setUpcoming(upcomingRes.data.sequences);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const pieData = stats?.statusCounts?.map((s) => ({
    name: s._id,
    value: s.count,
  })) || [];

  const barData = stats?.sourceCounts?.map((s) => ({
    name: s._id,
    count: s.count,
  })) || [];

  const convertedCount = stats?.statusCounts?.find((s) => s._id === "Converted")?.count || 0;
  const convRate = stats?.totalLeads ? ((convertedCount / stats.totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">Here's your sales overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={20} /></div>
          <div>
            <p className="stat-label">Total Leads</p>
            <p className="stat-value">{stats?.totalLeads || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={20} /></div>
          <div>
            <p className="stat-label">Converted</p>
            <p className="stat-value">{convertedCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><TrendingUp size={20} /></div>
          <div>
            <p className="stat-label">Conversion Rate</p>
            <p className="stat-value">{convRate}%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Bell size={20} /></div>
          <div>
            <p className="stat-label">Overdue Follow-ups</p>
            <p className="stat-value">{stats?.pendingFollowUps || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title">Leads by Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state-small"><p>No leads yet</p></div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Leads by Source</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state-small"><p>No data yet</p></div>
          )}
        </div>
      </div>

      {/* Two column bottom */}
      <div className="bottom-grid">
        {/* Recent Leads */}
        <div className="card">
          <h3 className="card-title">Recent Leads</h3>
          {stats?.recentLeads?.length > 0 ? (
            <div className="recent-list">
              {stats.recentLeads.map((lead) => (
                <div key={lead._id} className="recent-item" onClick={() => navigate(`/leads/${lead._id}`)}>
                  <div className="recent-avatar">{lead.name[0]}</div>
                  <div className="recent-info">
                    <p className="recent-name">{lead.name}</p>
                    <p className="recent-company">{lead.company || "—"}</p>
                  </div>
                  <span className="status-dot" style={{ background: STATUS_COLORS[lead.status] }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small"><p>No leads yet. <span className="link" onClick={() => navigate("/leads")}>Add your first lead →</span></p></div>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="card">
          <h3 className="card-title">Upcoming Follow-ups</h3>
          {upcoming.length > 0 ? (
            <div className="recent-list">
              {upcoming.map((seq) => (
                <div key={seq._id} className="recent-item" onClick={() => navigate(`/leads/${seq.leadId?._id}`)}>
                  <div className="followup-icon">📅</div>
                  <div className="recent-info">
                    <p className="recent-name">{seq.leadId?.name}</p>
                    <p className="recent-company">{seq.type} · {format(new Date(seq.scheduledDate), "MMM d")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small"><p>No upcoming follow-ups 🎉</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
