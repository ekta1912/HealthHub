import React from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message } from "antd";
// chatbot import pehle se hai
import Chatbot from "./Chatbot";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // logout function
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out successfully");
    navigate("/login");
  };

  // doctor menu logic
  const doctorMenu = [
    {
      name: "Home",
      path: "/dashboard",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    {
      name: "Profile",
      path: `/doctor/profile/${user?._id}`,
      icon: "fa-solid fa-user-pen",
    },
  ];

  // rendering menu list
  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  return (
    <>
      <div className="main">
        <div className="layout">
          {/* sidebar section */}
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
                    className={`menu-item ${isActive && "active"}`}
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

          {/* main content section */}
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

                <Link to="/profile" className="d-flex align-items-center text-decoration-none">
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
        
        {/* chatbot ko yahan place kiya hai taaki wo layout ke upar float kare */}
        <Chatbot />
      </div>
    </>
  );
};

export default Layout;