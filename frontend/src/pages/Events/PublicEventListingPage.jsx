import React, { useEffect } from "react";
import Navbar from "../../components/DashboardNavbar/Navbar.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import EventHero from "../../components/LandingPage/Events/EventHeroSection.jsx";
import EventListing from "../../components/LandingPage/Events/EventListing.jsx";

const PublicEventsListPage = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="events-page">
            <Navbar/>
            <main className="events-main">
                <EventHero />
                <EventListing />
            </main>
            <Footer />

        </div>
    );
};

export default PublicEventsListPage;
