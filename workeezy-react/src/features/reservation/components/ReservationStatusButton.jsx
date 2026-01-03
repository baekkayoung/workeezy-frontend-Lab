import React from "react";
import "./ReservationStatusButton.css";

export default function ReservationStatusButton({ status, isExpired = false }) {
  let label = "";
  let icon = "";
  let className = "reservation-status-btn";

  if (isExpired) {
    return (
      <div className="reservation-status-btn expired">
        <img
          src="/reservationStatusIcons/expired.svg"
          alt="만료됨"
          className="icon"
        />
        <span className="label">예약만료</span>
      </div>
    );
  }

  switch (status) {
    case "waiting_payment":
      label = "예약신청";
      icon = "/reservationStatusIcons/waiting_payment.svg";
      className += " waiting_payment";
      break;

    case "approved":
      label = "승인완료";
      icon = "/reservationStatusIcons/approved.svg";
      className += " approved";
      break;

    case "confirmed":
      label = "예약확정";
      icon = "/reservationStatusIcons/confirmed.svg";
      className += " confirmed";
      break;

    case "cancel_requested":
      label = "취소요청";
      icon = "/reservationStatusIcons/cancel_requested.svg";
      className += " cancel_requested";
      break;

    case "cancelled":
      label = "취소완료";
      icon = "/reservationStatusIcons/cancelled.svg";
      className += " cancelled";
      break;

    case "rejected":
      label = "승인거절";
      icon = "/reservationStatusIcons/rejected.svg";
      className += " rejected";
      break;

    default:
      label = "알 수 없음";
      className += " unknown";
  }

  return (
    <div className={className}>
      {icon && <img src={icon} alt={label} className="icon" />}
      <span className="label">{label}</span>
    </div>
  );
}
