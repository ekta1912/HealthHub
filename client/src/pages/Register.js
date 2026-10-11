import React from "react";
import { Form, Input, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import "../styles/RegisterStyles.css";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/register", values);
      dispatch(hideLoading());

      if (res.data.success) {
        message.success("Register Successfully!");
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong");
    }
  };

  return (
    <div className="form-container">
      <Form layout="vertical" onFinish={onFinishHandler} className="register-form">
        <h3 className="text-center mb-4">Register</h3>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input
            type="text"
            prefix={<i className="fa-solid fa-user text-muted me-2"></i>}
            placeholder="John Doe"
            size="large"
          />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input
            type="email"
            prefix={<i className="fa-solid fa-envelope text-muted me-2"></i>}
            placeholder="example@mail.com"
            size="large"
          />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<i className="fa-solid fa-lock text-muted me-2"></i>}
            placeholder="At least 6 characters"
            size="large"
          />
        </Form.Item>
        <Link to="/login" className="m-2 d-inline-block">
          Already a user? Login here
        </Link>
        <button className="btn btn-primary w-100 mt-2" type="submit">
          Register
        </button>
      </Form>
    </div>
  );
};

export default Register;