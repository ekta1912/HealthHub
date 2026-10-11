import React from "react";
import { Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RegisterStyles.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // form submit handler
  const onFinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/login", values);
      dispatch(hideLoading());
      
      if (res.data.success) {
        // save token to local storage
        localStorage.setItem("token", res.data.token);
        
        message.success("login successful");
        
        // redirect to dashboard instead of home
        navigate("/dashboard");
        
        // reload page to update state
        window.location.reload();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("something went wrong");
    }
  };

  return (
    <div className="form-container">
      <Form layout="vertical" onFinish={onFinishHandler} className="register-form">
        <h3 className="text-center mb-4">Login</h3>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input
            prefix={<i className="fa-solid fa-envelope text-muted me-2"></i>}
            placeholder="example@mail.com"
            size="large"
          />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password
            prefix={<i className="fa-solid fa-lock text-muted me-2"></i>}
            placeholder="Enter password"
            size="large"
          />
        </Form.Item>
        <Link to="/register" className="m-2 d-inline-block">
          Not a user? Register here
        </Link>
        <button className="btn btn-primary w-100 mt-2" type="submit">
          Login
        </button>
      </Form>
    </div>
  );
};

export default Login;