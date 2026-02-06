import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios";
import "./blogowner.css";

const BlogOwner = () => {
  const studentId = localStorage.getItem("student_id");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!studentId) {
          console.error("student_id missing in localStorage");
          setStudent(null);
          return;
        }

        const res = await axiosInstance.get(`/students/${studentId}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Failed to fetch student profile:", err?.response?.data || err.message);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) return <p>Loading blog owner...</p>;
  if (!student) return <p>No profile found</p>;

  const fullName = `${student?.user?.first_name || ""} ${student?.user?.last_name || ""}`.trim();

  return (
    <div className="blog-owner-wrapper">
      <div className="blog-owner-card">
        <div className="owner-info">
          <img
            src={student?.profile_pic || "/default-avatar.png"}
            alt={fullName || "Blog Owner"}
            className="owner-img"
          />
          <div>
            <span className="owner-name">{fullName || "User"}</span>
            <span className="owner-role">{student?.title || "Blogger"}</span>
          </div>
        </div>

        <p className="description-text">
          {student?.profile_desc || "This user hasn’t added a description yet."}
        </p>
      </div>
    </div>
  );
};

export default BlogOwner;
