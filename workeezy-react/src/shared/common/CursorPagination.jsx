import "../common/CursorPagination.css";

export default function CursorPagination({ hasPrev, hasNext, onPrev, onNext }) {
  return (
    <div className="cursor-pagination">
      <button className="cursor-btn prev" disabled={!hasPrev} onClick={onPrev}>
        ← 이전
      </button>

      <button className="cursor-btn next" disabled={!hasNext} onClick={onNext}>
        다음 →
      </button>
    </div>
  );
}
