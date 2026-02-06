import React, { useEffect, useState } from "react";
import "./RecruitmentTimeline.css";

import axiosInstance from "../../axios"// adjust path if needed

import timelineIcon1 from "../../assets/Timeline1.png";
import timelineIcon2 from "../../assets/Timeline2.png";
import timelineIcon3 from "../../assets/Timeline3.png";
import timelineIcon4 from "../../assets/Timeline4.png";

const RecruitmentTimeline = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // helper: format "2026-01-28" => "Jan 28"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  const formatRange = (start, end) => {
    if (!start || !end) return "TBA";
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setApiError(null);

      try {
        const res = await axiosInstance.get("/recruitment/active-session/");
        const active = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!active) {
          setApiError("No active recruitment session found.");
          return;
        }

        const data = [
          {
            title: "Application Period",
            date: formatRange(active.application_start, active.application_end),
            image: timelineIcon1,
          },
          {
            title: "Application Deadline",
            date: formatDate(active.application_end),
            image: timelineIcon2,
          },
          {
            title: "Interview Period",
            date: formatRange(active.interview_start, active.interview_end),
            image: timelineIcon3,
          },
          {
            title: "Results Announced",
            date: formatDate(active.result_date),
            image: timelineIcon4,
          },
        ];

        setTimelineData(data);
      } catch (err) {
        const data = err.response?.data;
        const message =
          data?.detail ||
          data?.message ||
          (typeof data === "string" ? data : JSON.stringify(data)) ||
          "Failed to load recruitment timeline.";

        setApiError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  return (
    <section className="timeline-section">
      <div className="timeline-header">
        <h2 className="timeline-main-title">RECRUITMENT TIMELINE</h2>
        <p className="timeline-subtitle">Important dates for the recruitment process</p>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading timeline...</p>}
      {apiError && (
        <p style={{ textAlign: "center", color: "crimson" }}>{apiError}</p>
      )}

      <div className="timeline-container">
        {timelineData.map((item, index) => (
          <div key={index} className="timeline-row">
            <div className="timeline-icon-box">
              <img
                src={item.image}
                alt={item.title}
                className="timeline-custom-img"
              />
            </div>
            <div className="timeline-info">
              <h4 className="timeline-item-title">{item.title}</h4>
              <p className="timeline-item-date">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecruitmentTimeline;
