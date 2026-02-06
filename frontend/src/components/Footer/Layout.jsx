import React from "react";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <main className="app-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
