import "./ReviewCard.css";
import { useNavigate } from "react-router-dom";
import useImagePath from "../../../../hooks/useImagePath.js";

export default function ReviewCard({ image, rating, programName, reviewText, programId }) {
    const navigate = useNavigate();
    const { fixPath } = useImagePath();

    // ✅ 로컬/public 경로 → S3 경로로 보정
    const fixedImage = fixPath(image);

    const goDetail = () => {
        if (!programId) {
            console.warn("❗ ReviewCard: programId가 없습니다.");
            return;
        }
        navigate(`/programs/${programId}`);
    };

    const safeRating = Math.max(0, Math.min(5, Number(rating ?? 0)));

    return (
        <div className="review-card" onClick={goDetail}>
            {fixedImage ? (
                <img src={fixedImage} alt={programName ?? "review"} />
            ) : (
                <div className="review-card-image-fallback">이미지 없음</div>
            )}

            <div className="review-card-content">
                <div className="review-stars">
                    {"★★★★★☆☆☆☆☆".slice(5 - safeRating, 10 - safeRating)}
                </div>

                <div className="review-program-name">{programName}</div>

                <div className="review-text">{reviewText}</div>
            </div>
        </div>
    );
}
