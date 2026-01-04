import "../components/Result.css";
import {useEffect, useRef} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import PageLayout from "../../../layout/PageLayout.jsx";

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const orderId = params.get("orderId");
    const paymentKey = params.get("paymentKey");
    const amount = Number(params.get("amount"));

    const calledRef = useRef(false);

    useEffect(() => {

        if (!orderId || !paymentKey || !amount) {
            navigate("/payment/fail?code=INVALID_RESULT_PARAMS", {replace: true});
            return;
        }

        // StrictMode / 재마운트 방지
        if (calledRef.current) return;
        calledRef.current = true;

        async function confirm() {
            try {
                const response = await fetch("/api/payments/confirm", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({orderId, amount, paymentKey}),
                });

                if (!response.ok) {
                    navigate("/payment/result/fail?code=CONFIRM_FAILED", {replace: true});
                    return;
                }

                await response.json();

            } catch {
                navigate("/payment/result/fail?code=NETWORK_ERROR", {replace: true});
            }
        }

        confirm();
    }, [orderId, paymentKey, amount, navigate]);

    return (
        <PageLayout>
            <div className="result-wrapper">
                <div className="result-box success">
                    <div className="success-icon">✓</div>
                    <h2 className="result-title"> 결제가 완료되었어요</h2>

                    <div className="result-info">
                        <p><strong>주문번호</strong></p>
                        <p>{orderId}</p>

                        <p style={{marginTop: 12}}><strong>결제 금액</strong></p>
                        <p>{amount.toLocaleString()}원</p>
                    </div>

                    <button className="btn primary" onClick={() => navigate("/reservation/list")}>
                        예약 현황 조회
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}