import "./ReservationCard.css";
import ReservationStatusButton from "../ReservationStatusButton.jsx";
import { formatLocalDateTime } from "../../../../utils/dateTime";
import ReservationCardActions from "./../ReservationCardActions";
import useImagePath from "../../../../hooks/useImagePath.js";
import ReviewModal from "../../../review/components/ReviewModal.jsx";
import { useReservationPolicy } from "../../hooks/useReservationPolicy.js";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const REVIEWED_KEY = "reviewedReservationIds";

function addReviewedReservationId(reservationId) {
    try {
        const raw = localStorage.getItem(REVIEWED_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        const base = Array.isArray(arr) ? arr : [];
        const next = Array.from(new Set([...base, reservationId]));
        localStorage.setItem(REVIEWED_KEY, JSON.stringify(next));
    } catch {
        // localStorage 실패해도 UX는 유지
    }
}

export default function ReservationCard({ data, isSelected, onSelect }) {
    const navigate = useNavigate();
    const [reviewOpen, setReviewOpen] = useState(false);
    const policy = useReservationPolicy(data);

    const {
        programTitle,
        stayName,
        roomType,
        status,
        startDate,
        endDate,
        totalPrice,
        peopleCount,
        reservationNo,
        officeName,
        placePhoto1,
        placePhoto2,
        placePhoto3,
    } = data;

    const { fixPath } = useImagePath();

    const images = [placePhoto1, placePhoto2, placePhoto3]
        .filter(Boolean)
        .map(fixPath);

    const toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    return (
        <>
            <div
                className={`reservation-card ${isSelected ? "selected" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.();
                }}
            >
                {/* 이미지 영역 */}
                {isSelected ? (
                    <div className="image-grid">
                        {images.map((src, i) => (
                            <img key={i} src={src} alt="" />
                        ))}
                    </div>
                ) : (
                    <img className="thumbnail" src={images[0]} alt="" />
                )}

                {/* 정보 섹션 */}
                <div className="info">
                    <ReservationStatusButton status={status} isExpired={policy.isExpired} />
                    <div className="title">{programTitle}</div>

                    <dl className="details">
                        <div>
                            <dt>예약번호</dt>
                            <dd>{reservationNo}</dd>
                        </div>
                        <div>
                            <dt>기간</dt>
                            <dd>
                                {formatLocalDateTime(startDate)} ~ {formatLocalDateTime(endDate)}
                            </dd>
                        </div>
                        <div>
                            <dt>숙소</dt>
                            <dd>{stayName}</dd>
                        </div>
                        <div>
                            <dt>오피스</dt>
                            <dd>{officeName}</dd>
                        </div>
                        <div>
                            <dt>총 금액</dt>
                            <dd>{totalPrice?.toLocaleString()}원</dd>
                        </div>
                    </dl>

                    {isSelected && (
                        <dl className="detail-extra">
                            <h4 className="detail-title">예약 상세</h4>
                            <div>
                                <dt>룸타입</dt>
                                <dd>{roomType}</dd>
                            </div>
                            <div>
                                <dt>인원</dt>
                                <dd>{peopleCount}명</dd>
                            </div>
                        </dl>
                    )}
                </div>

                {/* 버튼 */}
                {isSelected && (
                    <div className="buttons">
                        <ReservationCardActions
                            reservation={data}
                            onOpenReview={() => setReviewOpen(true)}
                        />
                    </div>
                )}
            </div>

            {/* 모달 */}
            <ReviewModal
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
                programId={data.programId}
                onSubmitted={() => {
                    // ✅ 0) 리뷰작성 완료 저장 (새로고침 대비)
                    addReviewedReservationId(data.id);

                    // ✅ 1) 모달 닫기
                    setReviewOpen(false);

                    // ✅ 2) 토스트
                    toast.fire({
                        icon: "success",
                        title: "리뷰 등록 완료! 😊",
                    });

                    // ✅ 3) 이동
                    navigate("/reviews");
                }}
            />
        </>
    );
}
