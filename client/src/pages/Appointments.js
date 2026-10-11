import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";
import { Table, Tag } from "antd";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLoading(false);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  // Table Columns Definition
  const columns = [
    {
      title: "Doctor Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.doctorInfo?.firstName ? (
            <>Dr. {record.doctorInfo.firstName} {record.doctorInfo.lastName || ""}</>
          ) : (
            <span className="text-muted">Doctor Info Unavailable</span>
          )}
        </span>
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
          rejected: "error",
          cancelled: "default",
        };
        const currentStatus = record.status || "pending";
        return (
          <Tag color={statusColors[currentStatus] || "default"}>
            {currentStatus.toUpperCase()}
          </Tag>
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
          rowKey={(record) => record._id} 
          loading={loading}
          className="shadow-sm"
        />
      </div>
    </Layout>
  );
};

export default Appointments;