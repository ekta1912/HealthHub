import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tag } from "antd";
import moment from "moment";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  const formattedTimings =
    doctor.timings && doctor.timings.length >= 2
      ? `${moment(doctor.timings[0]).isValid() ? moment(doctor.timings[0]).format("hh:mm A") : doctor.timings[0]} - ${moment(doctor.timings[1]).isValid() ? moment(doctor.timings[1]).format("hh:mm A") : doctor.timings[1]}`
      : "Available on request";

  return (
    <Card
      className="shadow-sm m-2 doctor-card"
      hoverable
      style={{ width: "100%", borderRadius: "10px", border: "1px solid #e8e8e8" }}
      onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
      title={
        <div className="d-flex align-items-center">
          <i className="fa-solid fa-user-doctor fs-3 me-2 text-primary"></i>
          <span>Dr. {doctor.firstName} {doctor.lastName}</span>
        </div>
      }
    >
      <div className="d-flex flex-column gap-2">
        <p className="mb-0">
          <i className="fa-solid fa-stethoscope me-2 text-secondary"></i>
          <b>Specialization:</b> <Tag color="cyan">{doctor.specialization}</Tag>
        </p>
        
        {doctor.address && (
          <p className="mb-0">
            <i className="fa-solid fa-location-dot me-2 text-danger"></i>
            <b>Address:</b> {doctor.address}
          </p>
        )}

        <p className="mb-0">
          <i className="fa-solid fa-briefcase-medical me-2 text-secondary"></i>
          <b>Experience:</b> {doctor.experience}
        </p>
        <p className="mb-0">
          <i className="fa-solid fa-indian-rupee-sign me-2 text-secondary"></i>
          <b>Fees:</b> ₹{doctor.feesPerCunsultation}
        </p>
        
        <p className="mb-0">
          <i className="fa-solid fa-clock me-2 text-secondary"></i>
          <b>Timings:</b> {formattedTimings}
        </p>

        <div className="mt-2 pt-2 border-top">
          <button className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-calendar-plus me-2"></i> Book Appointment
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DoctorList;