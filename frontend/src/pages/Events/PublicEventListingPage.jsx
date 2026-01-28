import React, { useEffect } from "react";
import NavbarComponent from "../../components/LandingPage/Navbar/NavbarComponent.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import EventHero from "../../components/LandingPage/Events/EventHeroSection.jsx";
import EventListing from "../../components/LandingPage/Events/EventListing.jsx";

const PublicEventsListPage = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="events-page">
            <NavbarComponent />
            <main className="events-main">
                <EventHero />
                <EventListing />
            </main>
            <Footer />

        </div>
    );
};

export default PublicEventsListPage;
