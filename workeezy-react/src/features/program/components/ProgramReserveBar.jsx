import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ProgramReserveBar.css";
import { useProgramDetail } from "../context/ProgramDetailContext.jsx";

export default function ProgramReserveBar() {
  const navigate = useNavigate();
  const { programId, rooms } = useProgramDetail();

  const [roomId, setRoomType] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  // 예약 가능 여부
  const [isAvailable, setIsAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const CHECK_IN_HOUR = 15;
  const CHECK_OUT_HOUR = 11;
  const STAY_DAYS = 2; // 2박 3일

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) return;

    const checkAvailability = async () => {
      const params = new URLSearchParams({
        roomId,
        startDate: checkIn.toISOString(),
        endDate: checkOut.toISOString(),
      });

      try {
        setChecking(true);
        const res = await fetch(`/api/reservations/availability?${params}`);
        const data = await res.json();
        setIsAvailable(Boolean(data.available));
      } catch (e) {
        setIsAvailable(false);
      } finally {
        setChecking(false);
      }
    };

    checkAvailability();
  }, [roomId, checkIn, checkOut]);

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  const [bottomFixed, setBottomFixed] = useState(false);

  useEffect(() => {
    const placeholder = document.getElementById("reserve-bar-placeholder");

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        setBottomFixed(!isVisible);
      },
      { threshold: 0 }
    );

    if (placeholder) observer.observe(placeholder);
    return () => placeholder && observer.unobserve(placeholder);
  }, []);

  const inDay = checkIn ?? now;
  // const inMinTime =
  //   startOfDay(inDay).getTime() === startOfDay(now).getTime()
  //     ? now
  //     : startOfDay(inDay);
  // const inMaxTime = endOfDay(inDay);

  const outDay = checkOut ?? checkIn ?? now;
  const outSameDay =
    !!checkIn &&
    !!outDay &&
    startOfDay(outDay).getTime() === startOfDay(checkIn).getTime();

  // const outMinTime = checkIn && outSameDay ? checkIn : startOfDay(outDay);
  // const outMaxTime = endOfDay(outDay);

  const onReserve = () => {
    if (!roomId || !checkIn || !checkOut) {
      alert("필수 항목을 입력해주세요!");
      return;
    }

    navigate("/reservation/new", {
      state: {
        programId,
        roomId,
        checkIn,
        checkOut,
      },
    });
  };
  //   const canReserve = roomId && checkIn && isAvailable && !checking;
  const canReserve = roomId && checkIn && isAvailable;

  // 체크인 선택시 자동으로 체크아웃 계산
  const handleCheckInChange = (date) => {
    if (!date) return;

    const checkIn = new Date(date);
    checkIn.setHours(CHECK_IN_HOUR, 0, 0, 0);

    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + STAY_DAYS);
    checkOut.setHours(CHECK_OUT_HOUR, 0, 0, 0);

    setCheckIn(checkIn);
    setCheckOut(checkOut);
  };

  return (
    <>
      <div id="reserve-bar-placeholder" style={{ height: "1px" }} />
      <div className={`pd-reserve ${bottomFixed ? "bottom-fixed" : ""}`}>
        <div className="pd-reserve-item">
          <label>룸 타입</label>
          <select value={roomId} onChange={(e) => setRoomType(e.target.value)}>
            <option value="">룸 선택</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomType}
              </option>
            ))}
          </select>
        </div>
        <div className="pd-reserve-item">
          <label>체크인</label>
          <div className="pd-input-wrap">
            <i className="fa-regular fa-calendar calendar-icon" />

            <DatePicker
              className="pd-datepicker"
              selected={checkIn}
              onChange={handleCheckInChange}
              minDate={startOfDay(now)}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="체크인 날짜 선택"
              showTimeSelect={false}
            />
          </div>
        </div>
        <div className="pd-reserve-item">
          <label>체크아웃</label>
          <div className={`pd-input-wrap ${!checkIn ? "disabled" : ""}`}>
            {!checkIn && (
              <span className="fake-placeholder">
                체크인 날짜를 선택해주세요.
              </span>
            )}
            <DatePicker
              selected={checkOut}
              dateFormat="yyyy-MM-dd HH:mm"
              disabled
              className="pd-datepicker"
            />
          </div>
        </div>

        <div className="pd-reserve-actions">
          <div className="availability-status">
            {checking && <span className="checking">확인 중..</span>}
            {!checking && isAvailable === true && (
              <span className="ok">예약이 가능한 날짜입니다.</span>
            )}
            {!checking && isAvailable === false && (
              <span className="fail">예약이 불가한 날짜입니다.</span>
            )}
          </div>

          <button
            className={`pd-reserve-btn ${checking ? "is-checking" : ""}`}
            disabled={!canReserve}
            onClick={onReserve}
          >
            {checking ? "확인 중.." : "예약하기"}
          </button>
        </div>
      </div>
    </>
  );
}
