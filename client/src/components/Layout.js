import React from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu, doctorMenu } from "../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message } from "antd";
import Chatbot from "./Chatbot";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out successfully");
    navigate("/login");
  };

  // Select Sidebar menu based on role
  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  const profilePath = user?.isDoctor && user?._id ? `/doctor/profile/${user._id}` : "/profile";

  return (
    <>
      <div className="main">
        <div className="layout">
          {/* Sidebar Section */}
          <div className="sidebar">
            <div className="logo">
              <h6>HEALTH HUB</h6>
              <hr />
            </div>
            <div className="menu">
              {SidebarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                return (
                  <div
                    key={menu.name}
                    className={`menu-item ${isActive ? "active" : ""}`}
                  >
                    <i className={menu.icon}></i>
                    <Link to={menu.path}>{menu.name}</Link>
                  </div>
                );
              })}
              <div className="menu-item" onClick={handleLogout} style={{ cursor: "pointer" }}>
                <i className="fa-solid fa-right-from-bracket"></i>
                <span className="ms-3">Logout</span>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="content">
            <div className="header">
              <div className="header-content" style={{ cursor: "pointer" }}>
                <Badge
                  count={user && user.notification ? user.notification.length : 0}
                  onClick={() => {
                    navigate("/notification");
                  }}
                >
                  <i className="fa-solid fa-bell"></i>
                </Badge>

                <Link to={profilePath} className="d-flex align-items-center text-decoration-none">
                  <span
                    className="avatar-badge me-2 bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px", fontSize: "14px", fontWeight: "bold" }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="fw-semibold text-dark">{user?.name || "User"}</span>
                </Link>
              </div>
            </div>
            <div className="body">{children}</div>
          </div>
        </div>

        {/* Floating Quick-Access Chatbot Assistant */}
        <Chatbot />
      </div>
    </>
  );
};

export default Layout;
