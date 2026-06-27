import React, { useState, useMemo } from "react";
import { FaLinkedin } from "react-icons/fa";
import Navbar from "../../components/DashboardNavbar/Navbar";
import "./CreditsPage.css";

// 1. Import images eagerly
const teamImages = import.meta.glob('../../assets/team/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}', { eager: true });

// 2. Pre-process images into a direct lookup map (O(1) access)
const imagePathMap = Object.keys(teamImages).reduce((acc, path) => {
  const fileName = path.split('/').pop().toLowerCase();
  acc[fileName] = teamImages[path].default;
  return acc;
}, {});

const imageNameMap = {
  "Fakhir Hassan": "fakhirhassan",
  "Ifra Ahmed": "ifra ahmed",
  "Ayaan Ahmed Khan": "ayaan ahmed",
  "Muhammad Shafay": "muhammad shafay",
  "M. Alyan": "alyan khattak",
  "Aqsa Arif": "aqsa arif",
  "Abdul Hafeez": "abdul hafeez",
  "Aryan Afzal": "muhammad aryan",
  "Abdul Wasay": "abdul wasay",
  "Farhad Ali": "farhad ali",
  "Adeel Asghar": "adeelasghar",
  "Aroosa Jabeen": "aroosa jabeen",
  "Muhammad Hamza": "hamza ahmad",
  "Muhammad Junaid Irfan": "junaid irfan",
  "M. Umar": "muhammad umar",
  "Malick Haris Ali": "malik haris",
  "Ramlah Munir": "ramlah munir",
  "Aleesha Yasin": "alesha yasin",
  "Abdul Wahab": "abdul wahab",
};

const getTeamImage = (name) => {
  const mappedName = imageNameMap[name]?.toLowerCase();
  if (!mappedName) return null;

  // Find the file that contains our mapped name string
  const fileKey = Object.keys(imagePathMap).find(file => file.includes(mappedName));
  return fileKey ? imagePathMap[fileKey] : null;
};

const roleDescriptions = {
  "Project Manager": "Led the overall project coordination, timeline management, and team synchronization.",
  "Project Lead": "Directed technical decisions, code reviews, and development workflow.",
  "Technical Lead": "Managed frontend, backend development, and GitHub workflows. Oversaw technical architecture and deployment.",
  "Backend Lead": "Architected server-side systems, APIs, and database structures.",
  "Frontend Lead": "Designed component architecture, UI/UX implementation, and frontend best practices.",
  "Design Lead": "Created visual identity, UI designs, and ensured consistent design language.",
  "Github Manager": "Managed version control, branch strategies, and code deployment pipelines.",
  "Backend Team": "Developed APIs, implemented business logic, and managed data operations.",
  "Frontend Team": "Built interactive UI components and implemented responsive designs.",
  "Design Team": "Created graphics, illustrations, and visual assets for the platform.",
};

const CreditsPage = () => {
  const [activeVersion, setActiveVersion] = useState("v2");

  const v1Team = [
    { name: "Muhammad Hamza", role: "Project Manager", linkedin: "https://www.linkedin.com/in/muhammad-hamza-4799a5281" },
    { name: "Fakhir Hassan", role: "Project Lead", linkedin: "https://www.linkedin.com/in/fakhir-hassan-154788270/" },
    { name: "Malick Haris Ali", role: "Backend Lead", linkedin: "https://www.linkedin.com/in/malik-haris-ali-29257a297" },
    { name: "Aqsa Arif", role: "Frontend Lead", linkedin: "https://www.linkedin.com/in/aqsa-arif-1b66a12b8" },
    { name: "Farhad Ali", role: "Design Lead", linkedin: "https://www.linkedin.com/in/farhad-ali-029857283" },
    { name: "Abdul Hafeez", role: "Github Manager", linkedin: "https://www.linkedin.com/in/contacthhafeez" },
    { name: "Ifra Ahmed", role: "Backend Team", linkedin: "https://www.linkedin.com/in/ifra-ahmed-096423319" },
    { name: "Ramlah Munir", role: "Backend Team", linkedin: "https://www.linkedin.com/in/ramlah-munir/" },
    { name: "Adeel Asghar", role: "Backend Team", linkedin: "https://www.linkedin.com/in/adeelasghar11" },
    { name: "Ayaan Ahmed Khan", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/ayaan-ahmed-khan-448600351" },
    { name: "M. Umar", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/muhammad-umar-a323712b9" },
    { name: "Aryan Afzal", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/muhammadaryanafzal" },
    { name: "Aleesha Yasin", role: "Design Team", linkedin: "https://www.linkedin.com/in/alesha-yasin-3a9255317" },
  ];

  const v2Team = [
    { name: "Fakhir Hassan", role: "Project Manager", linkedin: "https://www.linkedin.com/in/fakhir-hassan-154788270/" },
    { name: "Abdul Hafeez", role: "Technical Lead", linkedin: "https://www.linkedin.com/in/contacthhafeez" },
    { name: "Ifra Ahmed", role: "Project Lead", linkedin: "https://www.linkedin.com/in/ifra-ahmed-096423319" },
    { name: "Malick Haris Ali", role: "Backend Lead", linkedin: "https://www.linkedin.com/in/malik-haris-ali-29257a297" },
    { name: "Ayaan Ahmed Khan", role: "Frontend Lead", linkedin: "https://www.linkedin.com/in/ayaan-ahmed-khan-448600351" },
    { name: "Muhammad Shafay", role: "Design Lead", linkedin: "https://www.linkedin.com/in/shafay-sajid-393bb8375/" },
    { name: "Muhammad Junaid Irfan", role: "Backend Team", linkedin: "https://www.linkedin.com/in/junaid-irfan-1765313ab" },
    { name: "Ramlah Munir", role: "Backend Team", linkedin: "https://www.linkedin.com/in/ramlah-munir/" },
    { name: "M. Alyan", role: "Backend Team", linkedin: "https://www.linkedin.com/in/alyanktk" },
    { name: "Aleesha Yasin", role: "Backend Team", linkedin: "https://www.linkedin.com/in/alesha-yasin-3a9255317" },
    { name: "Aroosa Jabeen", role: "Backend Team", linkedin: "https://www.linkedin.com/in/aroosaa" },
    { name: "Aqsa Arif", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/aqsa-arif-1b66a12b8" },
    { name: "M. Umar", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/muhammad-umar-a323712b9" },
    { name: "Aryan Afzal", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/muhammadaryanafzal" },
    { name: "Abdul Wahab", role: "Frontend Team", linkedin: "https://www.linkedin.com/in/abdul-wahab-428851314/" },
    { name: "Abdul Wasay", role: "Design Team", linkedin: "https://www.linkedin.com/in/abdul-wasay-3664ab289" },
    { name: "Farhad Ali", role: "Design Team", linkedin: "https://www.linkedin.com/in/farhad-ali-029857283" },
  ];

  const currentTeam = useMemo(() => (activeVersion === "v1" ? v1Team : v2Team), [activeVersion]);

  const getRoleClass = (role) => {
    const roleMap = {
      "Manager": "role-manager",
      "Technical Lead": "role-technical-lead",
      "Project Lead": "role-lead",
      "Backend Lead": "role-backend-lead",
      "Frontend Lead": "role-frontend-lead",
      "Design Lead": "role-design-lead",
      "Github": "role-github",
      "Backend": "role-backend",
      "Frontend": "role-frontend",
      "Design": "role-design"
    };
    for (const key in roleMap) {
      if (role.includes(key)) return roleMap[key];
    }
    return "role-default";
  };

  const getInitials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="credits-page-wrapper">
      <Navbar />
      <div className="credits-page">
        <div className="credits-container">
          <div className="credits-header">
            <h1 className="credits-title">Meet the Team</h1>
            <p className="credits-subtitle">The talented individuals who built and maintain this platform</p>
          </div>

          <div className="version-tabs">
            <button className={`version-tab ${activeVersion === "v1" ? "active" : ""}`} onClick={() => setActiveVersion("v1")}>Version 1.0</button>
            <button className={`version-tab ${activeVersion === "v2" ? "active" : ""}`} onClick={() => setActiveVersion("v2")}>Version 2.0</button>
          </div>

          <div className="team-list">
            {currentTeam.map((member, index) => {
              const image = getTeamImage(member.name);
              const isEven = index % 2 === 0;

              return (
                <div 
                  className={`member-row ${isEven ? 'image-right' : 'image-left'}`} 
                  // FIX: Unique key forces React to re-render correctly when switching versions
                  key={`${activeVersion}-${member.name}`}
                >
                  <div className="member-text">
                    <h2 className="member-name">{member.name}</h2>
                    <span className={`member-role ${getRoleClass(member.role)}`}>{member.role}</span>
                    <p className="member-description">{roleDescriptions[member.role] || "Contributed to the development of this platform."}</p>
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="member-linkedin-btn">
                        <FaLinkedin size={18} />
                        <span>Connect on LinkedIn</span>
                      </a>
                    )}
                  </div>
                  <div className="member-image">
                    {image ? (
                      <img 
                        src={image} 
                        alt={member.name} 
                        loading="eager" // Force priority loading
                      />
                    ) : (
                      <div className="member-initials">{getInitials(member.name)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="credits-footer-note"><p>Built with passion by ACM CUI Wah CodeHub Team</p></div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;