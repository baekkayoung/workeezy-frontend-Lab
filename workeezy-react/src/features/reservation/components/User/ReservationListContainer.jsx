import {useEffect, useRef, useState} from "react";
import axios from "../../../../api/axios.js";
import ReservationListView from "./ReservationListView.jsx";
import "./ReservationListContainer.css";

const REVIEWED_KEY = "reviewedReservationIds";

function loadReviewedSet() {
    try {
        const raw = localStorage.getItem(REVIEWED_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

export default function ReservationListContainer({
                                                     selectedId,
                                                     setSelectedId,
                                                 }) {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");

    const [reservations, setReservations] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reviewedSetRef = useRef(loadReviewedSet());
    const loaderRef = useRef(null);

    const fetchMyReservations = async () => {
        if (loading || !hasNext) return;

        setLoading(true);

        try {
            const res = await axios.get("/api/reservations/me", {
                params: {
                    cursorDate: cursor?.createdDate,
                    cursorId: cursor?.id,
                    size: 10,
                    keyword: keyword || null,
                    status: status || null,
                },
            });

            const {content, last} = res.data;

            const enrichedContent = (content ?? []).map((r) => ({
                ...r,
                hasReview: reviewedSetRef.current.has(r.id),
            }));
            setReservations((prev) => {
                if (!cursor) return enrichedContent; // 검색/초기 로딩 시 초기화
                const existing = new Set(prev.map((v) => v.id));
                return [...prev, ...enrichedContent.filter((v) => !existing.has(v.id))];
            });

            if (enrichedContent.length > 0) {
                const lastItem = enrichedContent[enrichedContent.length - 1];
                setCursor({
                    createdDate: lastItem.createdDate,
                    id: lastItem.id,
                });
            }

            setHasNext(!last);
        } catch (e) {
            console.error(e);
            setError("예약 목록 불러오기 실패");
        } finally {
            setLoading(false);
        }
    };

    // 최초 1회 로딩
    useEffect(() => {
        fetchMyReservations();
    }, []);

    // 검색 조건 바뀌면 목록 초기화
    useEffect(() => {
        setReservations([]);
        setCursor(null);
        setHasNext(true);
        fetchMyReservations();
    }, [keyword, status]);

    // IntersectionObserver
    useEffect(() => {
        if (!loaderRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNext && !loading) {
                    fetchMyReservations();
                }
            },
            {
                root: null,
                rootMargin: "100px",
                threshold: 0.1,
            }
        );

        observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, [hasNext, loading]);

    if (error) return <p>{error}</p>;

    return (
        <>
            <ReservationListView
                reservations={reservations}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                keyword={keyword}
                setKeyword={setKeyword}
                status={status}
                setStatus={setStatus}
            />

            {/* 로딩 트리거 */}
            <div ref={loaderRef} className="infinite-loader">
                {loading && <p className="loading-text">불러오는 중...</p>}
                {!hasNext && <p className="end-text">모든 예약을 불러왔어요</p>}
            </div>
        </>
    );
}
