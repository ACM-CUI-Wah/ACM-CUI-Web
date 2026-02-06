import React, { useEffect, useMemo, useState } from "react";
import {
  BsPeople,
  BsClock,
  BsCalendarCheck,
  BsCheckCircle,
  BsEye,
  BsX,
  BsDownload

} from "react-icons/bs";
import "./Recruitment.css";
import axiosInstance from "../../axios";

const RecruitmentManagement = () => {
  // session
  const [sessionId, setSessionId] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);

  // data
  const [applications, setApplications] = useState([]);
  const [statusList, setStatusList] = useState([]);


  const [exporting, setExporting] = useState(false);

  // loading + errors
  const [appsLoading, setAppsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // UNDER_REVIEW, ACCEPTED, REJECTED, INTERVIEWS
  const [roleFilter, setRoleFilter] = useState(""); // CODEHUB etc

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // -----------------------------
  // Helpers
  // -----------------------------
  // ✅ handle "Under Review", "UNDER_REVIEW", "Under_Review", "under-review"
  const normalizeStatus = (s) => {
    if (!s) return "";
    return String(s)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"); // spaces or hyphen -> underscore
  };


  const exportExcel = async () => {
  if (!sessionId) {
    setError("No active session found. Can't export.");
    return;
  }

  setExporting(true);
  setError(null);

  try {
    // Build query params based on your current filters
    const params = {
      session_id: sessionId,
    };

    if (roleFilter) params.preferred_role = roleFilter;     // CODEHUB, GRAPHICS, etc
    if (statusFilter) params.status = statusFilter;         // UNDER_REVIEW, ACCEPTED, ...

    // NOTE:
    // If axiosInstance baseURL already includes "/api", then use "/recruitment/export/excel/"
    // If NOT, then use "/api/recruitment/export/excel/"
    const res = await axiosInstance.get("/recruitment/export/excel/", {
      params,
      responseType: "blob",
    });

    // Try to get filename from headers (Content-Disposition)
    let filename = `recruitment_export_session_${sessionId}.xlsx`;
    const cd = res.headers?.["content-disposition"];
    if (cd && cd.includes("filename")) {
      const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      if (match?.[1]) filename = decodeURIComponent(match[1]);
    }

    const contentType =
      res.headers?.["content-type"] ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    const data = err.response?.data;
    const message =
      data?.detail ||
      data?.message ||
      (typeof data === "string" ? data : "Export failed.");
    setError(message);
  } finally {
    setExporting(false);
  }
};

  const uiStatus = (apiStatus) => {
    const normalized = normalizeStatus(apiStatus);
    switch (normalized) {
      case "UNDER_REVIEW":
        return "Under Review";
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "INTERVIEWS":
        return "Interviews";
      default:
        return apiStatus || "Unknown";
    }
  };

  const getStatusClass = (statusLabel) => {
    switch (statusLabel) {
      case "Under Review":
        return "status-under-review";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-rejected";
      case "Interviews":
        return "status-interviews";
      default:
        return "";
    }
  };

  // -----------------------------
  // 1) Active session
  // -----------------------------
  useEffect(() => {
    const fetchActiveSession = async () => {
      setLoadingSession(true);
      setError(null);

      try {
        const res = await axiosInstance.get("/recruitment/active-session/");
        const active = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!active?.id) {
          setSessionId(null);
          setError("No active recruitment session found.");
        } else {
          setSessionId(active.id);
        }
      } catch (err) {
        const data = err.response?.data;
        const message =
          data?.detail ||
          data?.message ||
          (typeof data === "string" ? data : JSON.stringify(data)) ||
          "Failed to load active session.";
        setError(message);
        setSessionId(null);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchActiveSession();
  }, []);

  // -----------------------------
  // 2) Fetch applications
  // -----------------------------
  // ❌ DO NOT use server status filter because backend inconsistent
  const fetchApplications = async () => {
    if (!sessionId) return;

    setAppsLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get("/recruitment/application-review/", {
        params: {
          recruitment_session: sessionId,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setApplications(data);
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.message ||
        (typeof data === "string" ? data : JSON.stringify(data)) ||
        "Failed to load applications.";
      setError(message);
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // -----------------------------
  // 3) Fetch stats (status endpoint)
  // -----------------------------
  const fetchStatuses = async () => {
    if (!sessionId) return;

    setStatsLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get("/recruitment/application-status/");
      const all = Array.isArray(res.data) ? res.data : [];

      const filtered = all.filter((x) => x.recruitment_session === sessionId);
      setStatusList(filtered);
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.message ||
        (typeof data === "string" ? data : JSON.stringify(data)) ||
        "Failed to load stats.";
      setError(message);
      setStatusList([]);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // -----------------------------
  // Stats calculation
  // -----------------------------
  const stats = useMemo(() => {
    const total = statusList.length;

    const underReview = statusList.filter(
      (x) => normalizeStatus(x.status) === "UNDER_REVIEW"
    ).length;

    const interviews = statusList.filter(
      (x) => normalizeStatus(x.status) === "INTERVIEWS"
    ).length;

    const accepted = statusList.filter(
      (x) => normalizeStatus(x.status) === "ACCEPTED"
    ).length;

    return { total, underReview, interviews, accepted };
  }, [statusList]);

  // -----------------------------
  // Role options dropdown
  // -----------------------------
  const roleOptions = useMemo(() => {
    const set = new Set();
    applications.forEach((a) => {
      const role = a?.role_preferences?.preferred_role;
      if (role) set.add(role);
    });
    return Array.from(set);
  }, [applications]);

  // -----------------------------
  // CLIENT SIDE FILTERING
  // -----------------------------
  const filteredApplications = useMemo(() => {
    let list = [...applications];

    // ✅ status filter (client-side)
    if (statusFilter) {
      list = list.filter((a) => normalizeStatus(a?.status) === statusFilter);
    }

    // role filter
    if (roleFilter) {
      list = list.filter(
        (a) => a?.role_preferences?.preferred_role === roleFilter
      );
    }

    // search filter
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((app) => {
      const name = `${app?.personal_info?.first_name || ""} ${
        app?.personal_info?.last_name || ""
      }`
        .toLowerCase()
        .trim();

      const email = (app?.personal_info?.email || "").toLowerCase();
      const reg = (app?.academic_info?.reg_no || "").toLowerCase();
      const role = (app?.role_preferences?.preferred_role || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        reg.includes(q) ||
        role.includes(q)
      );
    });
  }, [applications, roleFilter, statusFilter, search]);

  // -----------------------------
  // Modal open/close
  // -----------------------------
  const openModal = async (id) => {
    setIsModalOpen(true);
    setSelectedId(id);
    setSelectedApp(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const res = await axiosInstance.get(
        `/recruitment/application-review/${id}/`
      );
      setSelectedApp(res.data);
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.message ||
        (typeof data === "string" ? data : JSON.stringify(data)) ||
        "Failed to load application details.";
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setSelectedApp(null);
    setDetailError(null);
    setDetailLoading(false);
    setUpdatingStatus(false);
  };

  // ESC to close modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // -----------------------------
  // Update status
  // -----------------------------
  const updateStatus = async (newStatus) => {
    if (!selectedId) return;

    setUpdatingStatus(true);
    setDetailError(null);

    try {
      await axiosInstance.patch(
        `/recruitment/application-status/${selectedId}/`,
        { status: newStatus }
      );

      // refresh modal details
      const res = await axiosInstance.get(
        `/recruitment/application-review/${selectedId}/`
      );
      setSelectedApp(res.data);

      // refresh list + stats
      await fetchApplications();
      await fetchStatuses();
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.message ||
        (typeof data === "string" ? data : JSON.stringify(data)) ||
        "Failed to update status.";
      setDetailError(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="recruitment-dashboard">
      <div className="dashboard-header">
        <h1>RECRUITMENT MANAGEMENT</h1>
        <p>Track applications and manage the hiring pipeline</p>
        {loadingSession && (
          <p style={{ marginTop: 8 }}>Loading active session...</p>
        )}
      </div>

      {error && (
        <div style={{ margin: "10px 0", color: "crimson" }}>{error}</div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Applications</h3>
            <div className="stat-value">{statsLoading ? "..." : stats.total}</div>
            <div className="stat-sub">Current session</div>
          </div>
          <div className="stat-icon">
            <BsPeople size={18} color="#a0a0a0" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Under Review</h3>
            <div className="stat-value">
              {statsLoading ? "..." : stats.underReview}
            </div>
            <div className="stat-sub">Awaiting review</div>
          </div>
          <div className="stat-icon">
            <BsClock size={18} color="#a0a0a0" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Interviews</h3>
            <div className="stat-value">
              {statsLoading ? "..." : stats.interviews}
            </div>
            <div className="stat-sub">Scheduled</div>
          </div>
          <div className="stat-icon">
            <BsCalendarCheck size={18} color="#a0a0a0" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Accepted</h3>
            <div className="stat-value">
              {statsLoading ? "..." : stats.accepted}
            </div>
            <div className="stat-sub">New members</div>
          </div>
          <div className="stat-icon">
            <BsCheckCircle size={18} color="#a0a0a0" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="recruitment-table-container">
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search by email, name, or registration"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Clubs</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="INTERVIEWS">Interviews</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {appsLoading ? (
          <p style={{ padding: 12 }}>Loading applications...</p>
        ) : (
          <table className="r-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No.</th>
                <th>Email</th>
                <th>Preferred Club</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 14, textAlign: "center" }}>
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const name = `${app?.personal_info?.first_name || ""} ${
                    app?.personal_info?.last_name || ""
                  }`.trim();

                  const rollNo = app?.academic_info?.reg_no || "-";
                  const email = app?.personal_info?.email || "-";
                  const role = app?.role_preferences?.preferred_role || "-";
                  const statusText = uiStatus(app?.status);

                  return (
                    <tr key={app.id}>
                      <td>{name || "-"}</td>
                      <td>{rollNo}</td>
                      <td>{email}</td>
                      <td>{role}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(statusText)}`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => openModal(app.id)}
                          title="View Application"
                        >
                          <BsEye />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
  <div
    className="rm-modal-overlay"
    onMouseDown={(e) => {
      if (e.target.classList.contains("rm-modal-overlay")) closeModal();
    }}
  >
    <div className="rm-modal" role="dialog" aria-modal="true">
      {/* HEADER */}
      <div className="rm-modal-header">
        <div className="rm-modal-head-left">
          <h3 className="rm-modal-title">
            {selectedApp?.personal_info?.first_name || "Applicant"}{" "}
            {selectedApp?.personal_info?.last_name || ""}
          </h3>

          <div className="rm-modal-meta">
            <span className="rm-meta-chip">
              Reg: {selectedApp?.academic_info?.reg_no || "-"}
            </span>

            <span className={`rm-status-pill ${getStatusClass(uiStatus(selectedApp?.status))}`}>
              {uiStatus(selectedApp?.status)}
            </span>
          </div>

          {selectedApp?.personal_info?.email && (
            <p className="rm-modal-subtitle">{selectedApp.personal_info.email}</p>
          )}
        </div>

        <button
          className="rm-modal-close"
          onClick={closeModal}
          aria-label="Close"
        >
          <BsX size={22} />
        </button>
      </div>

      {/* BODY */}
      <div className="rm-modal-body">
        {detailLoading ? (
          <div className="rm-modal-loading">Loading details...</div>
        ) : detailError ? (
          <div className="rm-modal-error">{detailError}</div>
        ) : selectedApp ? (
          <>
            {/* TOP GRID */}
            <div className="rm-grid">
              {/* Personal */}
              <div className="rm-card">
                <div className="rm-card-title">👤 Personal</div>

                <div className="rm-kv">
                  <span>Name</span>
                  <b>
                    {selectedApp.personal_info?.first_name}{" "}
                    {selectedApp.personal_info?.last_name}
                  </b>
                </div>

                <div className="rm-kv">
                  <span>Email</span>
                  <b>{selectedApp.personal_info?.email || "-"}</b>
                </div>

                <div className="rm-kv">
                  <span>Phone</span>
                  <b>{selectedApp.personal_info?.phone_number || "-"}</b>
                </div>
              </div>

              {/* Academic */}
              <div className="rm-card">
                <div className="rm-card-title">🎓 Academic</div>

                <div className="rm-kv">
                  <span>Reg No</span>
                  <b>{selectedApp.academic_info?.reg_no || "-"}</b>
                </div>

                <div className="rm-kv">
                  <span>Program</span>
                  <b>{selectedApp.academic_info?.program || "-"}</b>
                </div>

                <div className="rm-kv">
                  <span>Semester</span>
                  <b>{selectedApp.academic_info?.current_semester ?? "-"}</b>
                </div>
              </div>
            </div>

            {/* Skills + Coursework */}
            <div className="rm-card rm-card-full">
              <div className="rm-card-title"> Skills & Coursework</div>

              <div className="rm-tags-block">
                <div className="rm-tags-title">Skills</div>
                <div className="rm-tags">
                  {(selectedApp.academic_info?.skills || []).length ? (
                    selectedApp.academic_info.skills.map((s, idx) => (
                      <span key={idx} className="rm-tag">{s}</span>
                    ))
                  ) : (
                    <span className="rm-muted">-</span>
                  )}
                </div>
              </div>

              <div className="rm-tags-block">
                <div className="rm-tags-title">Coursework</div>
                <div className="rm-tags">
                  {(selectedApp.academic_info?.relevant_coursework || []).length ? (
                    selectedApp.academic_info.relevant_coursework.map((c, idx) => (
                      <span key={idx} className="rm-tag">{c}</span>
                    ))
                  ) : (
                    <span className="rm-muted">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="rm-card rm-card-full">
              <div className="rm-card-title">Preferences</div>

              <div className="rm-grid-2">
                <div className="rm-kv">
                  <span>Preferred Club</span>
                  <b>{selectedApp.role_preferences?.preferred_role || "-"}</b>
                </div>

                <div className="rm-kv">
                  <span>Secondary Club</span>
                  <b>{selectedApp.role_preferences?.secondary_role || "-"}</b>
                </div>
              </div>

              <div className="rm-divider" />

              {/* Join Purpose */}
              <div className="rm-long-section">
                <div className="rm-long-title">Join Purpose</div>
                <div className="rm-longtext">
                  {selectedApp.role_preferences?.join_purpose || "-"}
                </div>
              </div>

              {/* Experience */}
              <div className="rm-long-section">
                <div className="rm-long-title">Previous Experience</div>
                <div className="rm-longtext">
                  {selectedApp.role_preferences?.previous_experience || "-"}
                </div>
              </div>

              {/* Availability */}
              <div className="rm-long-section">
                <div className="rm-long-title">Weekly Availability</div>
                <div className="rm-longtext">
                  {selectedApp.role_preferences?.weekly_availability || "-"}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="rm-divider" />
              <div className="rm-kv rm-kv-stack">
                <span>LinkedIn</span>

                {selectedApp.role_preferences?.linkedin_profile ? (
                  (() => {
                    const raw = selectedApp.role_preferences.linkedin_profile.trim();
                    const href =
                      raw.startsWith("http://") || raw.startsWith("https://")
                        ? raw
                        : `https://${raw}`;

                    const copyLink = async () => {
                      try {
                        await navigator.clipboard.writeText(href);
                        alert("LinkedIn link copied!");
                      } catch {
                        alert("Copy failed");
                      }
                    };

                    return (
                      <div className="rm-link-row">
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="rm-link"
                        >
                          {raw}
                        </a>

                        <div className="rm-link-actions">
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="rm-mini-btn"
                          >
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={copyLink}
                            className="rm-mini-btn rm-mini-btn-copy"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <b>-</b>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rm-modal-loading">No data</div>
        )}
      </div>

      {/* FOOTER */}
      <div className="rm-modal-footer">
        <div className="rm-actions">
          <button
            type="button"
            className="rm-btn rm-btn-ghost"
            disabled={updatingStatus}
            onClick={() => updateStatus("UNDER_REVIEW")}
          >
            Under Review
          </button>

          <button
            type="button"
            className="rm-btn rm-btn-warn"
            disabled={updatingStatus}
            onClick={() => updateStatus("INTERVIEWS")}
          >
            Interviews
          </button>

          <button
            type="button"
            className="rm-btn rm-btn-success"
            disabled={updatingStatus}
            onClick={() => updateStatus("ACCEPTED")}
          >
            Accept
          </button>

          <button
            type="button"
            className="rm-btn rm-btn-danger"
            disabled={updatingStatus}
            onClick={() => updateStatus("REJECTED")}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
)}

<button
  type="button"
  className="export-fab"
  onClick={exportExcel}
  disabled={exporting || !sessionId}
  title="Export current filtered applications to Excel"
>
  <BsDownload size={18} />
  {exporting ? "Exporting..." : "Export Excel"}
</button>



    </div>

  );
};

export default RecruitmentManagement;
