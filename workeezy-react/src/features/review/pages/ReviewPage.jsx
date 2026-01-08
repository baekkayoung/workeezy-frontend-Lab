import PageLayout from "../../../layout/PageLayout.jsx";
import SearchBar from "../../search/components/SearchBar.jsx";
import CategoryFilter from "../../search/components/CategoryFilter.jsx";
import Pagination from "../../../shared/common/Pagination.jsx";
import FloatingButtons from "../../../shared/common/FloatingButtons.jsx";
import ReviewCard from "../../program/components/details/ReviewCard.jsx";
import SectionHeader from "../../../shared/common/SectionHeader.jsx";

import publicApi from "../../../api/publicApi.js";
import { useEffect, useState } from "react";

export default function ReviewPage() {
    const [search, setSearch] = useState("");
    const [bigRegion, setBigRegion] = useState("전체");
    const [smallRegions, setSmallRegions] = useState([]);
    const [allReviews, setAllReviews] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // ⭐ 리뷰 전체 로드
    useEffect(() => {
        publicApi
            .get("/api/reviews") // 백엔드 실제 경로로 변경 가능
            .then(res => {
                setAllReviews(res.data);
            })
            .catch(err => console.error("리뷰 로드 실패:", err));
    }, []);

    // ⭐ 검색 + 지역 필터 적용
    // ⭐ 검색 + 지역 필터 적용
    const filteredReviews = allReviews.filter((r) => {

        const keyword = search.trim().toLowerCase();

        // 1) 검색어 필터
        if (keyword) {
            const match =
                (r.reviewText && r.reviewText.toLowerCase().includes(keyword)) ||
                (r.programName && r.programName.toLowerCase().includes(keyword)) ||
                (r.region && r.region.toLowerCase().includes(keyword));

            if (!match) return false;
        }

        // 2) 지역 필터 - 전체면 통과
        if (bigRegion === "전체") return true;

        const regionMap = {
            수도권: ["서울", "경기", "인천"],
            영남권: ["부산", "대구", "울산", "경남", "경북"],
            호남권: ["광주", "전남", "전북"],
            충청권: ["대전", "충북", "충남"],
            강원권: ["강원"],
            제주: ["제주"],
            해외: ["해외"],
        };

        const validSmall = regionMap[bigRegion] || [];

        // 작은 지역 선택됨 → 정확히 그 지역만 통과
        if (smallRegions.length > 0) {
            return smallRegions.includes(r.region);
        }

        // 작은 지역 선택 안됨 → 큰 지역만 통과
        return validSmall.includes(r.region);
    });


    // 페이지 계산
    const totalPages = Math.ceil(filteredReviews.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedReviews = filteredReviews.slice(start, start + pageSize);


    return (
        <PageLayout>
            <SectionHeader icon="far fa-comment" title="리뷰" />

            {/* 검색창 */}
            <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={() => setCurrentPage(1)}
            />

            {/* 지역 카테고리 */}
            <CategoryFilter
                bigRegion={bigRegion}
                setBigRegion={(r) => {
                    setBigRegion(r);
                    setSmallRegions([]);   // 큰 지역 바뀌면 작은 지역 초기화
                    setCurrentPage(1);
                }}
                smallRegions={smallRegions}
                setSmallRegions={(list) => {
                    setSmallRegions(list);
                    setCurrentPage(1);
                }}
            />

            {/* 리뷰 목록 */}

            <div className="review-grid">

                {paginatedReviews.map((r) => (
                    <ReviewCard
                        key = {r.reviewId}
                        image={r.image}
                        rating={r.rating}
                        userName={r.userName}
                        programName={r.programName}
                        reviewText={r.reviewText}
                        programId={r.programId}
                        region={r.region}
                    />

                ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

        </PageLayout>
    );
}
