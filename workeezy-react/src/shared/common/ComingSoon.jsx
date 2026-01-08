import NoticeLayout from "./NoticeLayout";
import {useNavigate} from "react-router-dom";

export default function ComingSoon() {
    const nav = useNavigate();

    return (
        <NoticeLayout
            title="서비스 준비 중입니다 🙂"
            message="해당 기능은 현재 개발 중이며, 곧 제공될 예정입니다."
        >
            <button className="notice-btn" onClick={() => nav(-1)}>
                이전 페이지로
            </button>
        </NoticeLayout>
    );
}