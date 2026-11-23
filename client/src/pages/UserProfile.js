import React from "react";
import Layout from "../components/Layout";
import { Form, Input, message, Button, Card, Select, Tag, Row, Col } from "antd";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Form Submit Handle
  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/update-profile",
        { ...values, userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        if (res.data.data) {
          dispatch(setUser(res.data.data));
        } else {
          dispatch(setUser({ ...user, ...values }));
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Something went wrong updating profile");
    }
  };

  const roleBadge = user?.isAdmin ? (
    <Tag color="red">System Administrator</Tag>
  ) : user?.isDoctor ? (
    <Tag color="green">Verified Doctor</Tag>
  ) : (
    <Tag color="blue">Registered Patient</Tag>
  );

  return (
    <Layout>
      <div className="container mt-4 mb-5 d-flex justify-content-center">
        <Card
          className="shadow-sm p-4 border-0"
          style={{ width: "650px", borderRadius: "16px" }}
        >
          <div className="text-center mb-4">
            <div
              className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "80px", height: "80px", fontSize: "35px", fontWeight: "bold" }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3 className="mt-3 mb-1" style={{ color: "#1e293b", fontWeight: "bold" }}>
              {user?.name || "User Profile"}
            </h3>
            <div className="mb-2">{roleBadge}</div>
            <p className="text-muted small">Manage your personal and health record information</p>
          </div>

          {user && (
            <Form
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                name: user?.name,
                email: user?.email,
                phone: user?.phone || "",
                address: user?.address || "",
                bloodGroup: user?.bloodGroup || undefined,
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<span className="fw-semibold">Full Name</span>}
                    name="name"
                    rules={[{ required: true, message: "Please enter your name" }]}
                  >
                    <Input size="large" prefix={<i className="fa-regular fa-user me-2 text-muted"></i>} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={<span className="fw-semibold">Email Address</span>}
                    name="email"
                    rules={[{ required: true, message: "Please enter your email" }]}
                  >
                    <Input size="large" prefix={<i className="fa-regular fa-envelope me-2 text-muted"></i>} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="fw-semibold">Phone Number</span>} name="phone">
                    <Input
                      size="large"
                      placeholder="+91 9876543210"
                      prefix={<i className="fa-solid fa-phone me-2 text-muted"></i>}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label={<span className="fw-semibold">Blood Group</span>} name="bloodGroup">
                    <Select size="large" placeholder="Select Blood Group" allowClear>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <Select.Option key={bg} value={bg}>
                          {bg}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={<span className="fw-semibold">Home / Clinic Address</span>} name="address">
                <Input.TextArea
                  rows={2}
                  placeholder="Street, City, State, Postal Code"
                />
              </Form.Item>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-100 shadow-sm"
                  style={{ borderRadius: "8px", fontWeight: "bold" }}
                >
                  Save Profile Changes <i className="fa-solid fa-floppy-disk ms-2"></i>
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfile;
