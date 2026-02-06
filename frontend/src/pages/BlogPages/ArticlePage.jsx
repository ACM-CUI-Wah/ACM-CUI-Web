import React, { useState } from 'react';
import ArticleEditor from '../../components/Blogs/ArticleEditor.jsx';
import "./articlePage.css";
import Navbar from '../../components/DashboardNavbar/Navbar.jsx';


const ArticlePage = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showActionPanel, setShowActionPanel] = useState(false);

    const handleCloseSidebar = () => setShowSidebar(false);
    const handleShowSidebar = () => setShowSidebar(true);
    const handleCloseActionPanel = () => setShowActionPanel(false);
    const handleShowActionPanel = () => setShowActionPanel(true);

    return (
        <>
        {/* <Navbar/> */}
        <ArticleEditor/>
      
        </>
       
    );
};

export default ArticlePage;