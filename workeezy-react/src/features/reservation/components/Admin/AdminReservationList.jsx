import React, { useEffect, useState } from "react";
import "./AdminReservationList.css";
// import Pagination from "../../../../shared/common/Pagination";
import ReservationStatusButton from "../ReservationStatusButton.jsx";
import axios from "../../../../api/axios";
import { useNavigate } from "react-router-dom";
import CursorPagination from "../../../../shared/common/CursorPagination.jsx";

export default function AdminReservationList() {
  const [reservations, setReservations] = useState([]); // 예약 목록
  // const [page, setPage] = useState(1); // 현재 페이지 번호
  // const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수

  // 커서기반 페이지네이션

  const [cursor, setCursor] = useState(null); // 현재 기준 커서 (ex: lastId)
  // const [prevCursor, setPrevCursor] = useState(null);
  const [cursorStack, setCursorStack] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    keyword: "",
  });

  const navigate = useNavigate();

  // page/filters 바뀔 때마다 목록 재조회
  // useEffect(() => {
  //   fetchReservations();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [page, filters]);

  useEffect(() => {
    fetchReservations(null); // 항상 첫 페이지
  }, [filters]);

  const fetchReservations = async (cursorValue = null) => {
    try {
      const res = await axios.get("/api/admin/reservations/cursor", {
        params: {
          cursor: cursorValue,
          size: 20,
          status: filters.status || null,
          keyword: filters.keyword || null,
        },
      });

      console.log("admin cursor res =", res.data);

      setReservations(res.data.content);
      setCursor(res.data.nextCursor);
      // setPrevCursor(res.data.prevCursor);
      setHasNext(res.data.hasNext);
    } catch (error) {
      console.error("관리자 예약 조회 실패", error);
    }
  };
  const fetchNext = () => {
    if (!cursor) return;

    setCursorStack((prev) => [...prev, cursor]); // 🔑 현재 커서 저장
    fetchReservations(cursor);
  };

  const fetchPrev = () => {
    setCursorStack((prev) => {
      if (prev.length === 0) return prev;

      const newStack = [...prev];
      const prevCursor = newStack.pop();

      fetchReservations(prevCursor);
      return newStack;
    });
  };

  return (
    <div className="admin-reservation-list">
      <h2 className="list-title">관리자 예약 조회</h2>

      {/* 필터 영역 */}
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">예약 상태</option>
          <option value="waiting_payment">예약 신청</option>
          <option value="approved">승인 완료</option>
          <option value="rejected">승인 거절</option>
          <option value="confirmed">예약 확정</option>
          <option value="cancel_requested">취소 요청</option>
          <option value="cancelled">취소 완료</option>
        </select>

        <input
          type="text"
          placeholder="프로그램명 / 예약자 검색"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
      </div>

      {/* 목록 테이블 */}
      <table className="reservation-table">
        <thead>
          <tr>
            <th>
              <span className="th-label">예약 번호</span>
            </th>
            <th>
              <span className="th-label">프로그램명</span>
            </th>
            <th>
              <span className="th-label">예약자</span>
            </th>
            <th>
              <span className="th-label">예약 신청일</span>
            </th>
            <th>
              <span className="th-label">예약 상태</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id}
              className="clickable-row"
              onClick={() => navigate(`/admin/reservations/${r.id}`)}
            >
              <td>{r.reservationNo}</td>
              <td>{r.programTitle}</td>
              <td>{r.userName}</td>
              <td>
                {new Date(r.createdDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </td>
              <td className="status-td">
                <div className="status-cell">
                  <ReservationStatusButton status={r.status} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      /> */}
      <CursorPagination
        hasPrev={cursorStack.length > 0}
        hasNext={hasNext}
        onPrev={fetchPrev}
        onNext={fetchNext}
      />
    </div>
  );
}
