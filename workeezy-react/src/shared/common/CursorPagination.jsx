import "./CursorPagination.css";

export default function CursorPagination({ hasPrev, hasNext, onPrev, onNext }) {
  return (
    <div className="cursor-pagination">
      <button className="prev" disabled={!hasPrev} onClick={onPrev}>
        ← 이전
      </button>

      <button className="next" disabled={!hasNext} onClick={onNext}>
        다음 →
      </button>
    </div>
  );
}
