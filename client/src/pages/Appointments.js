import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";
import { Table, Tag, Button, Popconfirm, message } from "antd";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const getAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAppointments();
  }, [getAppointments]);

  // Handle patient cancellation
  const handleCancel = async (record) => {
    try {
      setCancellingId(record._id);
      const res = await axios.post(
        "/api/v1/user/cancel-appointment",
        {
          appointmentId: record._id,
          reason: "Cancelled by patient via portal",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        message.success("Appointment cancelled successfully. Slot freed.");
        getAppointments();
      } else {
        message.error(res.data.message || "Unable to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      message.error(error.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      title: "Doctor Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.doctorInfo?.firstName ? (
            <span className="fw-semibold">
              Dr. {record.doctorInfo.firstName} {record.doctorInfo.lastName || ""}
            </span>
          ) : (
            <span className="text-muted">Doctor Info Unavailable</span>
          )}
        </span>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      render: (text, record) => (
        <span>{record.doctorInfo?.specialization || "General Medicine"}</span>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => {
        if (record.date === "VIDEO CONSULT") {
          return (
            <span>
              <Tag color="cyan">
                <i className="fa-solid fa-video me-1"></i> Video Consult
              </Tag>
              <span className="text-muted">{record.time || "Requested"}</span>
            </span>
          );
        }

        const formattedDate = moment(record.date, "DD-MM-YYYY").isValid()
          ? moment(record.date, "DD-MM-YYYY").format("DD-MM-YYYY")
          : record.date;
        const formattedTime = moment(record.time, "HH:mm").isValid()
          ? moment(record.time, "HH:mm").format("hh:mm A")
          : record.time;

        return (
          <span>
            <i className="fa-regular fa-calendar me-1 text-primary"></i>
            {formattedDate} &nbsp;
            <i className="fa-regular fa-clock me-1 text-secondary"></i>
            {formattedTime}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record) => {
        const statusColors = {
          pending: "gold",
          approved: "success",
          booked: "blue",
          rejected: "error",
          cancelled: "default",
        };
        const currentStatus = record.status || "booked";
        return (
          <Tag color={statusColors[currentStatus] || "default"} style={{ fontWeight: "600" }}>
            {currentStatus.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => {
        const isCancelled = record.status === "cancelled" || record.status === "rejected";
        if (isCancelled) {
          return <span className="text-muted small">No action available</span>;
        }

        return (
          <Popconfirm
            title="Cancel Appointment"
            description="Are you sure you want to cancel this appointment? This will free the slot for other patients."
            onConfirm={() => handleCancel(record)}
            okText="Yes, Cancel"
            cancelText="Keep"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              loading={cancellingId === record._id}
              style={{ borderRadius: "6px" }}
            >
              <i className="fa-solid fa-xmark me-1"></i> Cancel
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-center mb-4" style={{ color: "#2c3e50", fontWeight: "bold" }}>
          <i className="fa-solid fa-list-check me-2 text-primary"></i>
          My Appointments
        </h2>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          className="shadow-sm bg-white rounded-3"
          pagination={{ pageSize: 8 }}
        />
      </div>
    </Layout>
  );
};

export default Appointments;
