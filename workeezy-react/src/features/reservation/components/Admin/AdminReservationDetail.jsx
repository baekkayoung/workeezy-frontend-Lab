import { useEffect, useState } from "react";
import ReservationStatusButton from "../ReservationStatusButton.jsx";
import AdminReservationActions from "./AdminReservationActions.jsx";
import axios from "../../../../api/axios";
import { formatLocalDateTime } from "../../../../utils/dateTime";
import "./AdminReservationDetail.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AdminReservationDetail({ reservationId }) {
    const navigate = useNavigate();
    const [reservation, setReservation] = useState(null);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`/api/admin/reservations/${reservationId}`);
            setReservation(res.data);
        } catch {
            Swal.fire("조회 실패", "예약 정보를 불러올 수 없습니다.", "error");
        }
    };

    useEffect(() => {
        Swal.fire({
            title: "예약 정보를 불러오는 중",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        fetchDetail().finally(() => Swal.close());
    }, [reservationId]);

    if (!reservation) return null;

    return (
        <div className="admin-detail-wrapper">
            <div className="admin-detail-card">
                <ReservationStatusButton status={reservation.status} />

                <div className="detail-section">
                    <h3 className="admin-section-title">예약 정보</h3>
                    <dl className="detail-grid">
                        <dt>예약번호</dt>
                        <dd>{reservation.reservationNo}</dd>

                        <dt>프로그램</dt>
                        <dd>{reservation.programTitle}</dd>

                        <dt>예약 기간</dt>
                        <dd>
                            {formatLocalDateTime(reservation.startDate)} ~{" "}
                            {formatLocalDateTime(reservation.endDate)}
                        </dd>

                        <dt>예약자</dt>
                        <dd>{reservation.userName}</dd>

                        <dt>예약자 번호</dt>
                        <dd>{reservation.phone}</dd>
                    </dl>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">이용 정보</h3>
                    <dl className="detail-grid">
                        <dt>숙소명</dt>
                        <dd>{reservation.stayName}</dd>

                        <dt>룸 타입</dt>
                        <dd>{reservation.roomType}</dd>

                        <dt>오피스명</dt>
                        <dd>{reservation.officeName}</dd>

                        <dt>인원</dt>
                        <dd>{reservation.peopleCount}명</dd>
                    </dl>
                </div>

                <AdminReservationActions
                    reservationId={reservationId}
                    status={reservation.status}
                    onSuccess={fetchDetail}
                />

                {/* 카드 바깥 */}
            </div>
            <div className="detail-footer">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    목록으로
                </button>
            </div>
        </div>
    );
}
