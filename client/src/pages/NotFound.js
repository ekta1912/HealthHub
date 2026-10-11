import React from "react";
import { Link } from "react-router-dom";
import { Button, Result } from "antd";

const NotFound = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "20px" }}
    >
      <Result
        status="404"
        title={<h1 style={{ fontWeight: 700, color: "#2c3e50" }}>404</h1>}
        subTitle={
          <span style={{ fontSize: "16px", color: "#6c757d" }}>
            Oops! The page you are looking for does not exist or has been moved.
          </span>
        }
        extra={
          <Link to="/dashboard">
            <Button type="primary" size="large" style={{ borderRadius: "6px" }}>
              <i className="fa-solid fa-house me-2"></i> Back to Dashboard
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
