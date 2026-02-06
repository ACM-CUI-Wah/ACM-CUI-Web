import React, { useEffect } from "react";
import Footer from "../../components/Footer/Footer.jsx";
import Navbar from "../../components/DashboardNavbar/Navbar.jsx";
import RecruitmentHero from "../../components/RecruitmentHero/RecruitmentHero.jsx";
import WhyJoinACM from "../../components/WhyJoinACM/WhyJoinACM.jsx";
import RecruitmentTimeline from "../../components/RecruitmentTimeline/RecruitmentTimeline.jsx";
import RecruitmentCriteria from "../../components/RecruitmentCriteria/RecruitmentCriteria.jsx";
import RecruitmentCTA from "../../components/RecruitmentCTA/RecruitmentCTA.jsx";


import "./RecruitmentPage.css";

const RecruitmentPage = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recruitment-page">
      
  
     <Navbar/>

      {/* Main Content */}
      <main className="recruitment-main">
      <RecruitmentHero/>
      <WhyJoinACM />
      <RecruitmentTimeline />
      <RecruitmentCriteria />
      <RecruitmentCTA />
      </main>
     

     

    </div>
  );
};

export default RecruitmentPage;
