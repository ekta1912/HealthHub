import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Spin,
  Empty,
  Badge,
} from "antd";
import { useSelector } from "react-redux";

const HospitalPage = () => {
  const { user } = useSelector((state) => state.user);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Fetch Hospitals
  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (emergencyOnly) params.emergency = "true";

      const res = await axios.get("/api/v1/hospitals", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        params,
      });

      if (res.data && res.data.success) {
        setHospitals(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
      message.error("Failed to load hospital directory");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, emergencyOnly]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // Handle Add Hospital Submit
  const handleAddHospital = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        name: values.name,
        address: values.address,
        description: values.description || "",
        services: values.services
          ? values.services.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        contact: values.contact || "",
        latitude: values.latitude !== undefined ? values.latitude : null,
        longitude: values.longitude !== undefined ? values.longitude : null,
        emergency: Boolean(values.emergency),
        bedsAvailable: values.bedsAvailable || 0,
      };

      const res = await axios.post("/api/v1/hospitals", payload, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      if (res.data && res.data.success) {
        message.success("Hospital listing added successfully!");
        setIsAddModalOpen(false);
        form.resetFields();
        fetchHospitals();
      } else {
        message.error(res.data.message || "Failed to add hospital");
      }
    } catch (err) {
      console.error("Error creating hospital:", err);
      message.error(err.response?.data?.message || "Error creating hospital listing");
    } finally {
      setSubmitting(false);
    }
  };

  const isPrivileged = user?.isAdmin || user?.isDoctor;

  return (
    <Layout>
      <div className="p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 style={{ color: "#1e293b", fontWeight: "bold", margin: 0 }}>
              <i className="fa-solid fa-hospital text-primary me-2"></i> Hospitals & Healthcare Centers
            </h2>
            <p className="text-muted mb-0">
              Locate verified partner hospitals, emergency trauma units, and specialized medical centers.
            </p>
          </div>
          {isPrivileged && (
            <Button
              type="primary"
              size="large"
              onClick={() => setIsAddModalOpen(true)}
              style={{ borderRadius: "8px", fontWeight: "600" }}
            >
              <i className="fa-solid fa-plus me-2"></i> Add Hospital Listing
            </Button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Input
                size="large"
                placeholder="Search hospitals by name, city, address, or medical service (e.g. Cardiology)..."
                prefix={<i className="fa-solid fa-magnifying-glass text-muted me-2"></i>}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={8} className="d-flex align-items-center justify-content-md-end gap-2">
              <span className="fw-semibold text-secondary">24/7 Emergency Only:</span>
              <Switch
                checked={emergencyOnly}
                onChange={(checked) => setEmergencyOnly(checked)}
                checkedChildren={<i className="fa-solid fa-truck-medical"></i>}
                unCheckedChildren="All"
              />
            </Col>
          </Row>
        </Card>

        {/* Hospital Cards Grid */}
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Spin size="large" />
          </div>
        ) : hospitals.length === 0 ? (
          <Empty
            description={
              <span>
                No healthcare centers found matching your search.
                {isPrivileged && " Click 'Add Hospital Listing' to register a new center."}
              </span>
            }
          />
        ) : (
          <Row gutter={[20, 20]}>
            {hospitals.map((hosp) => {
              const mapQuery = hosp.latitude && hosp.longitude
                ? `${hosp.latitude},${hosp.longitude}`
                : encodeURIComponent(`${hosp.name} ${hosp.address}`);
              const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

              return (
                <Col xs={24} md={12} lg={8} key={hosp._id}>
                  <Card
                    hoverable
                    className="h-100 shadow-sm border-0 d-flex flex-column justify-content-between"
                    style={{ borderRadius: "14px", overflow: "hidden" }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.2rem" }}>
                          {hosp.name}
                        </h4>
                        {hosp.emergency ? (
                          <Badge count="24/7 EMERGENCY" style={{ backgroundColor: "#ef4444", fontWeight: "700" }} />
                        ) : (
                          <Tag color="blue">Partner Clinic</Tag>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-muted small mb-2">
                        <i className="fa-solid fa-location-dot text-danger me-2"></i>
                        {hosp.address}
                      </p>

                      {/* Description */}
                      {hosp.description && (
                        <p className="text-secondary small mb-3" style={{ lineHeight: "1.5" }}>
                          {hosp.description}
                        </p>
                      )}

                      {/* Services Chips */}
                      {hosp.services && hosp.services.length > 0 && (
                        <div className="mb-3">
                          <span className="small fw-semibold text-muted d-block mb-1">Available Services:</span>
                          <div className="d-flex flex-wrap gap-1">
                            {hosp.services.map((svc, idx) => (
                              <Tag color="cyan" key={idx} style={{ borderRadius: "6px" }}>
                                {svc}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact & Beds */}
                      <div className="small text-muted mb-3 d-flex flex-wrap justify-content-between">
                        {hosp.contact && (
                          <span>
                            <i className="fa-solid fa-phone text-success me-1"></i>
                            <a href={`tel:${hosp.contact}`} className="text-decoration-none text-secondary">
                              {hosp.contact}
                            </a>
                          </span>
                        )}
                        {hosp.bedsAvailable > 0 && (
                          <span>
                            <i className="fa-solid fa-bed text-info me-1"></i>
                            {hosp.bedsAvailable} Beds Available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-2 border-top">
                      <Button
                        type="primary"
                        ghost
                        block
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ borderRadius: "8px", fontWeight: "600" }}
                      >
                        <i className="fa-solid fa-diamond-turn-right me-2"></i>
                        Get Directions on Google Maps
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Modal: Add Hospital Listing */}
        <Modal
          title={
            <span>
              <i className="fa-solid fa-hospital-user text-primary me-2"></i> Add Healthcare Center Listing
            </span>
          }
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          destroyOnClose
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleAddHospital}>
            <Form.Item
              label={<span className="fw-semibold">Hospital Name</span>}
              name="name"
              rules={[{ required: true, message: "Please enter hospital name" }]}
            >
              <Input size="large" placeholder="e.g. City General Hospital & Trauma Center" />
            </Form.Item>

            <Form.Item
              label={<span className="fw-semibold">Complete Address</span>}
              name="address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input.TextArea rows={2} placeholder="Full road, landmark, city, and state" />
            </Form.Item>

            <Form.Item label={<span className="fw-semibold">Description</span>} name="description">
              <Input.TextArea rows={2} placeholder="Brief summary of facilities, accreditations, or ICU capacities" />
            </Form.Item>

            <Form.Item
              label={<span className="fw-semibold">Services Offered (comma separated)</span>}
              name="services"
            >
              <Input placeholder="Cardiology, Orthopedics, Pediatrics, Radiology, Pathology" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="fw-semibold">Contact Phone / Hotline</span>} name="contact">
                  <Input placeholder="+91 9876543210 or 011-23456789" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="fw-semibold">Beds Available</span>} name="bedsAvailable">
                  <InputNumber min={0} className="w-100" placeholder="e.g. 50" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="fw-semibold">Latitude (Optional)</span>} name="latitude">
                  <InputNumber step={0.0001} className="w-100" placeholder="e.g. 28.6139" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="fw-semibold">Longitude (Optional)</span>} name="longitude">
                  <InputNumber step={0.0001} className="w-100" placeholder="e.g. 77.2090" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="emergency" valuePropName="checked" className="mb-4">
              <Switch checkedChildren="24/7 Emergency Available" unCheckedChildren="No Emergency Unit" />
              <span className="ms-2 fw-semibold text-secondary">Has 24/7 Emergency & Ambulance Services</span>
            </Form.Item>

            <div className="d-flex justify-content-end gap-2">
              <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Save Hospital Listing
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HospitalPage;
