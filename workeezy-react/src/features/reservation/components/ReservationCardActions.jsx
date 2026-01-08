import {useNavigate} from "react-router-dom";
import {useReservationPolicy} from "../hooks/useReservationPolicy.js";
import {
    cancelReservation,
    cancelRequestReservation,
} from "../api/reservationApi";
import Swal from "sweetalert2";

export default function ReservationCardActions({reservation, onOpenReview}) {
    const navigate = useNavigate();
    const policy = useReservationPolicy(reservation);

    // 예약 취소
    const handleCancel = async (e) => {
        e.stopPropagation();

        // 예약 확정(결제 완료) 상태 차단
        if (reservation.status === "confirmed") {
            await Swal.fire({
                title: "취소할 수 없는 예약입니다",
                text: "결제가 완료된 예약은 관리자에게 문의해주세요.",
                icon: "info",
                confirmButtonText: "확인",
            });
            return;
        }

        const result = await Swal.fire({
            title: "예약을 취소하시겠습니까?",
            text: "취소 후에는 되돌릴 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#aaa",
            confirmButtonText: "취소하기",
            cancelButtonText: "닫기",
        });
        if (!result.isConfirmed) return;

        try {
            await cancelReservation(reservation.id);

            await Swal.fire({
                title: "취소 완료",
                text: "예약이 취소되었습니다.",
                icon: "success",
                confirmButtonText: "확인",
            });

            window.location.reload();
        } catch (err) {
            Swal.fire({
                title: "취소 실패",
                text: "예약 취소 중 오류가 발생했습니다.",
                icon: "error",
            });
        }
    };

    const handleCancelRequest = async (e) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: "예약 날짜가 임박한 예약입니다. \n 취소를 요청하시겠습니까?",
            text: "관리자 승인 후 취소가 처리됩니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#aaa",
            confirmButtonText: "취소하기",
            cancelButtonText: "닫기",
        });
        if (!result.isConfirmed) return;

        try {
            await cancelRequestReservation(reservation.id);

            await Swal.fire({
                title: "취소 신청 완료",
                text: "관리자 검토 후 취소됩니다.",
                icon: "success",
                confirmButtonText: "확인",
            });

            window.location.reload();
        } catch (err) {
            Swal.fire({
                title: "예약 취소 신청 실패",
                text: "예약 취소 신청 중 오류가 발생했습니다.",
                icon: "error",
            });
        }
    };

    // 반려 사유 확인
    const handleShowRejectReason = (e) => {
        e.stopPropagation();

        Swal.fire({
            title: "예약이 반려 되었습니다",
            text: reservation.rejectReason || "반려 사유가 없습니다.",
            icon: "info",
            confirmButtonText: "확인",
        });
    };

    return (
        <>
            {policy.showRejectReason && (
                <button onClick={handleShowRejectReason}>반려 사유 확인</button>
            )}

            {policy.showResubmit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reservation/resubmit/${reservation.id}`);
                    }}
                >
                    재신청
                </button>
            )}

            {policy.showDirectCancel && (
                <button onClick={handleCancel}>예약 취소</button>
            )}
            {policy.showCancelRequest && (
                <button onClick={handleCancelRequest}>예약 취소 요청</button>
            )}

            {policy.showChange && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reservation/edit/${reservation.id}`);
                    }}
                >
                    예약 변경
                </button>
            )}
            {policy.showChangeRequest && <button>예약 변경 신청</button>}

            {policy.showConfirmDoc && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reservation/${reservation.id}/confirmation`);
                    }}
                >
                    예약 확정서
                </button>
            )}

            {policy.showPayment && <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate("/coming-soon");
                }}
            >결제 내역</button>}
            {policy.showPaymentWidget && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payment/${reservation.id}`);
                    }}
                >
                    결제하기
                </button>
            )}

            {/* 리뷰작성 */}
            {policy.showReview && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenReview?.();
                    }}
                >
                    리뷰작성
                </button>
            )}
        </>
    );
}
