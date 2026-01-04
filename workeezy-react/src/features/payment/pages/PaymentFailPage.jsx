import "../components/Result.css";
import {useNavigate, useSearchParams} from "react-router-dom";
import PageLayout from "../../../layout/PageLayout.jsx";

export default function PaymentFailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <PageLayout>
            <div className="result-wrapper">
                <div className="result-box fail">
                    <h2 className="result-title">결제에 실패했어요</h2>

                    <p className="result-desc">
                        결제가 정상적으로 처리되지 않았습니다.
                    </p>

                    <div className="result-error">
                        <p><strong>에러 코드</strong></p>
                        <p>{searchParams.get("code") ?? "UNKNOWN_ERROR"}</p>

                        <p style={{marginTop: 12}}><strong>실패 사유</strong></p>
                        <p>{searchParams.get("message") ?? "알 수 없는 오류가 발생했습니다."}</p>
                    </div>

                    <button className="btn secondary"
                            onClick={() => navigate("/reservation/list", {replace: true})}
                    >예약 목록으로 이동
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}