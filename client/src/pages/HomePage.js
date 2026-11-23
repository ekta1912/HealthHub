import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Row, Col, Spin, Empty, Card, message, Modal, Form, Input, Button, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  // Real stats for Admin from /api/v1/admin/stats
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    approvedDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    totalHospitals: 0,
  });

  const [isPatientModalVisible, setIsPatientModalVisible] = useState(false);
  const [selectedDoctorForVideo, setSelectedDoctorForVideo] = useState(null);

  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch All Approved Doctors
  const getUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/user/getAllDoctors", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (res.data.success) {
        setDoctors(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Doctor's Appointments
  const getDoctorAppointments = useCallback(async () => {
    try {
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch Admin Stats
  const getAdminData = useCallback(async () => {
    try {
      const res = await axios.get("/api/v1/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data && res.data.success) {
        setAdminStats(res.data.data || {});
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    if (user?.isAdmin) {
      getAdminData();
    } else if (user?.isDoctor) {
      getDoctorAppointments();
    }
  }, [user, getAdminData, getDoctorAppointments]);

  // Calculations for doctor dashboard
  const todayDate = moment().format("DD-MM-YYYY");
  const todaysAppointments = appointments.filter((app) => app.date === todayDate).length;
  const approvedAppointments = appointments.filter((app) => app.status === "approved" || app.status === "booked").length;
  const pendingAppointments = appointments.filter((app) => app.status === "pending").length;
  const totalPatients = appointments.length;

  const handleVideoRequestSubmit = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: selectedDoctorForVideo._id,
          userId: user._id,
          doctorInfo: selectedDoctorForVideo,
          userInfo: { ...user, phone: values.phone, whatsapp: values.whatsapp, email: values.email },
          date: "VIDEO CONSULT",
          time: "Requested",
          type: "video",
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Video Consult Request Sent Successfully");
        setIsPatientModalVisible(false);
      } else {
        message.error(res.data.message || "Failed to send video request");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Error sending video request");
    }
  };

  return (
    <Layout>
      <div className="p-4">
        {/* Admin Dashboard */}
        {user?.isAdmin && (
          <div className="admin-dashboard mb-5">
            <h3 className="mb-4 text-secondary" style={{ fontWeight: "bold" }}>
              <i className="fa-solid fa-gauge-high me-2 text-danger"></i> System Admin Dashboard
            </h3>
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#f3e5f5", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-2" style={{ fontSize: "14px" }}>Total Registered Users</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-users text-purple me-3" style={{ fontSize: "24px", color: "#8e44ad" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{adminStats.totalUsers || 0}</h2>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#e0f7fa", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-2" style={{ fontSize: "14px" }}>Verified Doctors</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-user-check text-info me-3" style={{ fontSize: "24px" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{adminStats.approvedDoctors || 0}</h2>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#fff9c4", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-2" style={{ fontSize: "14px" }}>Pending Doctor Requests</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-hourglass-half text-warning me-3" style={{ fontSize: "24px" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{adminStats.pendingDoctors || 0}</h2>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#e8f5e9", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-2" style={{ fontSize: "14px" }}>Hospitals & Centers</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-hospital text-success me-3" style={{ fontSize: "24px" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{adminStats.totalHospitals || 0}</h2>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24}>
                <Card title="Administrative Quick Actions" className="shadow-sm border-0" style={{ borderRadius: "10px" }}>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-primary" onClick={() => navigate("/admin/doctors")}>
                      <i className="fa-solid fa-user-doctor me-2"></i> Manage Doctors
                    </button>
                    <button className="btn btn-dark" onClick={() => navigate("/admin/users")}>
                      <i className="fa-solid fa-users me-2"></i> Manage Users
                    </button>
                    <button className="btn btn-info text-white" onClick={() => navigate("/hospitals")}>
                      <i className="fa-solid fa-hospital me-2"></i> Manage Hospitals & Centers
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => navigate("/chatbot")}>
                      <i className="fa-solid fa-robot me-2"></i> Test AI Assistant
                    </button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* Doctor Dashboard (Only visible if Doctor and NOT Admin) */}
        {user?.isDoctor && !user?.isAdmin && (
          <div className="doctor-dashboard mb-5">
            <h3 className="mb-4 text-secondary" style={{ fontWeight: "bold" }}>
              <i className="fa-solid fa-chart-pie me-2 text-primary"></i> Doctor Overview Dashboard
            </h3>

            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#eaf3fc", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-3" style={{ fontSize: "14px" }}>Today's Appointments</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-calendar-day text-primary me-3" style={{ fontSize: "24px" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{todaysAppointments}</h2>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#eaf7f0", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-3" style={{ fontSize: "14px" }}>Total Scheduled</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-users text-success me-3" style={{ fontSize: "24px", color: "#2e7d32" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{totalPatients}</h2>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#fdf4e6", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-3" style={{ fontSize: "14px" }}>Confirmed Appointments</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-circle-check text-warning me-3" style={{ fontSize: "24px", color: "#f39c12" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{approvedAppointments}</h2>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm border-0" style={{ backgroundColor: "#fbe8ea", borderRadius: "10px" }}>
                  <div className="d-flex flex-column">
                    <span className="text-muted mb-3" style={{ fontSize: "14px" }}>Pending Requests</span>
                    <div className="d-flex align-items-center">
                      <i className="fa-solid fa-bell text-danger me-3" style={{ fontSize: "24px", color: "#e74c3c" }}></i>
                      <h2 className="m-0" style={{ fontWeight: "600" }}>{pendingAppointments}</h2>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24}>
                <Card title="Quick Practitioner Actions" className="shadow-sm border-0" style={{ borderRadius: "10px" }}>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-primary" onClick={() => navigate("/doctor-appointments")}>
                      <i className="fa-solid fa-list-check me-2"></i> Manage Appointments
                    </button>
                    <button className="btn btn-outline-info" onClick={() => navigate("/hospitals")}>
                      <i className="fa-solid fa-hospital me-2"></i> Hospital Directory
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => navigate(`/doctor/profile/${user?._id}`)}>
                      <i className="fa-solid fa-user-pen me-2"></i> Update Timings & Profile
                    </button>
                    <button className="btn btn-outline-success" onClick={() => navigate("/chatbot")}>
                      <i className="fa-solid fa-robot me-2"></i> Dr. AI Assistant
                    </button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* Patient View */}
        {!user?.isDoctor && !user?.isAdmin && (() => {
          const specializations = Array.from(
            new Set(doctors.map((d) => d.specialization).filter(Boolean))
          );
          const filteredDoctors = doctors.filter((doc) => {
            const fullName = `${doc.firstName || ""} ${doc.lastName || ""}`.toLowerCase();
            const docSpec = (doc.specialization || "").toLowerCase();
            const query = searchTerm.toLowerCase().trim();
            const matchesSearch = fullName.includes(query) || docSpec.includes(query);
            const matchesSpec =
              selectedSpecialization === "all" ||
              docSpec === selectedSpecialization.toLowerCase();
            return matchesSearch && matchesSpec;
          });

          return (
            <div className="patient-view">
              <h2 className="text-center mb-2" style={{ color: "#2c3e50", fontWeight: "bold" }}>
                Find Your Medical Specialist
              </h2>
              <p className="text-center text-muted mb-4">
                Browse verified healthcare practitioners, view availability, and schedule clinic visits or video consults.
              </p>

              {/* Search & Filter Bar */}
              <Row gutter={[16, 16]} className="mb-4 justify-content-center">
                <Col xs={24} md={12} lg={10}>
                  <Input
                    size="large"
                    placeholder="Search by doctor name or specialty..."
                    prefix={<i className="fa-solid fa-magnifying-glass text-muted me-2"></i>}
                    value={searchTerm}
                    allowClear
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col xs={24} md={8} lg={6}>
                  <Select
                    size="large"
                    className="w-100"
                    value={selectedSpecialization}
                    onChange={(val) => setSelectedSpecialization(val)}
                  >
                    <Select.Option value="all">All Specializations</Select.Option>
                    {specializations.map((spec) => (
                      <Select.Option key={spec} value={spec}>
                        {spec}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              {loading ? (
                <div className="d-flex justify-content-center mt-5">
                  <Spin size="large" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <Empty
                  description={
                    doctors.length === 0
                      ? "No Verified Doctors Available Right Now"
                      : "No Doctors Match Your Search"
                  }
                  className="mt-5"
                />
              ) : (
                <Row gutter={[20, 20]}>
                  {filteredDoctors.map((doctor) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={doctor._id}>
                      <Card className="shadow-sm border-0 text-center h-100 d-flex flex-column justify-content-between" style={{ borderRadius: "12px" }}>
                        <div>
                          <div className="avatar-circle mx-auto mb-3 bg-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", fontSize: "24px" }}>
                            <i className="fa-solid fa-user-doctor"></i>
                          </div>
                          <h5 className="text-dark fw-bold mb-1">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h5>
                          <p className="text-muted mb-1 small">{doctor.specialization}</p>
                          <p className="text-secondary mb-2 small">{doctor.hospital || "HealthHub Clinic"}</p>
                          <p className="text-success fw-bold">Fees: ₹{doctor.feesPerCunsultation}</p>
                        </div>

                        <div>
                          <button
                            className="btn btn-primary w-100 mb-2 mt-2"
                            onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
                          >
                            <i className="fa-solid fa-calendar-check me-2"></i> Book Clinic Visit
                          </button>

                          <button
                            className="btn btn-outline-success w-100"
                            onClick={() => {
                              setSelectedDoctorForVideo(doctor);
                              setIsPatientModalVisible(true);
                            }}
                          >
                            <i className="fa-solid fa-video me-2"></i> Video Consult
                          </button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          );
        })()}

        {/* Video Consult Modal */}
        <Modal
          title="Request Virtual Video Consultation"
          open={isPatientModalVisible}
          onCancel={() => setIsPatientModalVisible(false)}
          footer={null}
        >
          <div className="alert alert-info border-0 shadow-sm">
            Send your contact details to Dr. {selectedDoctorForVideo?.firstName}. The practitioner will review your request and connect via video link.
          </div>
          <Form layout="vertical" onFinish={handleVideoRequestSubmit}>
            <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Please enter phone number" }]}>
              <Input size="large" placeholder="9876543210" />
            </Form.Item>
            <Form.Item label="WhatsApp Number (Optional)" name="whatsapp">
              <Input size="large" placeholder="9876543210" />
            </Form.Item>
            <Form.Item label="Email ID" name="email" rules={[{ required: true, message: "Please enter email id" }]}>
              <Input size="large" type="email" placeholder="patient@mail.com" />
            </Form.Item>
            <div className="d-flex justify-content-end mt-4 gap-2">
              <Button size="large" onClick={() => setIsPatientModalVisible(false)}>Cancel</Button>
              <Button size="large" type="primary" htmlType="submit">
                Submit Request
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HomePage;
