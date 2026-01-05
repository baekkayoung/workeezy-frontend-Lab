export function useReservationPolicy(reservation) {
    const { status, startDate, endDate, hasReview, reviewId } = reservation;

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const isExpired = start < today;

    const isWaitingPayment = status === "waiting_payment";
    const isApproved = status === "approved";
    const isConfirmed = status === "confirmed";
    const isRejected = status === "rejected";
    const isCancelled = status === "cancelled";
    const isAfterCheckout = today >= end;

    const isReviewed = Boolean(hasReview ?? reviewId);
    const canWriteReview = !isReviewed && (isConfirmed && isAfterCheckout);

    if (isCancelled) {
        return {
            isExpired: false,
            showRejectReason: false,
            showResubmit: false,
            showReview: false,
        };
    }

    if (isRejected && isExpired) {
        return {
            isExpired: false, // 만료 버튼으로 덮지 않음
            showRejectReason: true,
            showResubmit: false, // 재신청 막기
            showReview: false,
        };
    }

    if (isRejected) {
        return {
            isExpired: false,
            showRejectReason: true,
            showResubmit: true,
            showReview: false,
        };
    }

    if (isExpired) {
        return {
            isExpired: true,
            showRejectReason: false,
            showResubmit: false,
            showReview: !isReviewed,
        };
    }

    const normalize = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    const diffDays = Math.floor(
        (normalize(start) - normalize(today)) / (1000 * 60 * 60 * 24)
    );

    return {
        diffDays,

        /* =====================
           취소 관련
        ===================== */
        showDirectCancel:
            !isRejected &&
            (isWaitingPayment || isApproved || (isConfirmed && diffDays >= 3)),

        showCancelRequest: !isRejected && isConfirmed && diffDays >= 1 && diffDays <= 2,

        /* =====================
           변경 / 신청
        ===================== */
        showChange: isWaitingPayment,
        showChangeRequest: !isRejected && isConfirmed && diffDays >= 1,

        /* =====================
           rejected 전용
        ===================== */
        showRejectReason: isRejected,
        showResubmit: isRejected,

        /* =====================
           확정서 및 결제
        ===================== */
        showConfirmDoc: isConfirmed,
        showPaymentWidget: isApproved,
        showPayment: isConfirmed,

        /* =====================
           리뷰
        ===================== */
        showReview: canWriteReview,
    };
}
