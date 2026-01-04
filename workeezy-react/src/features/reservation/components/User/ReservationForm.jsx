import { useEffect, useState } from "react";
import ReservationFields from "./ReservationFields.jsx";
import "./ReservationForm.css";
import axios from "../../../../api/axios.js";
import DraftMenuBar from "./DraftMenuBar.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import ReservationFormActions from "../ReservationFormActions.jsx";
import { toLocalDateTimeString } from "../../../../utils/dateTime";
import Swal from "sweetalert2";
import { fetchDraft } from "../../api/draft.api.js";
import { normalizeDraftToForm } from "../../utils/draftNormalize.js";

export default function ReservationForm({
  initialData, // 프로그램 아이디, 룸id, 체크인-체크아웃
  mode = "create",
}) {
  // 초기 데이터 객체 구조 분해 할당
  const { programId, roomId, checkIn, checkOut } = initialData || {};
  const isEdit = mode === "edit";
  const isResubmit = mode === "resubmit";
  const isCreate = mode === "create";
  const navigate = useNavigate();
  const location = useLocation();
  const { draftKey } = location.state || {};
  // 예약용 프로그램 조회 결과로 얻은 rooms
  const [rooms, setRooms] = useState([]);

  // 인원수
  const [programPeople, setProgramPeople] = useState(null);

  /* =========================
       form 초기 상태
    ========================= */
  const [form, setForm] = useState({
    programId: "",
    programTitle: "",
    programPrice: 0,

    stayId: "",
    stayName: "",

    officeId: "",
    officeName: "",

    roomId: "",
    roomType: "",

    startDate: checkIn ? new Date(checkIn) : null,
    endDate: checkOut ? new Date(checkOut) : null,

    peopleCount: "",

    userName: "",
    company: "",
    email: "",
    phone: "",
  });

  /* =========================
     initialData 기반 form 동기화 (edit + draft)
  ========================= */
  useEffect(() => {
    if (!initialData) return;

    setForm((prev) => ({
      ...prev,
      ...initialData,
      startDate: initialData.startDate ? new Date(initialData.startDate) : null,
      endDate: initialData.endDate ? new Date(initialData.endDate) : null,
    }));
  }, [initialData]);

  /* =========================
       임시저장 관련 useState
    ========================= */
  const [isDraftMenuOpen, setIsDraftMenuOpen] = useState(false);
  const [latestDraftId, setLatestDraftId] = useState(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(null);

  /* =========================
     해당 프로그램 예약시 프로그램 데이터 재조회 (예약 전용)
    ========================= */
  useEffect(() => {
    if (!programId) return;

    const fetchProgramForReservation = async () => {
      Swal.fire({
        title: "예약 정보를 불러오는 중이에요",
        text: "잠시만 기다려주세요",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const res = await axios.get(`/api/programs/${programId}/reservation`);
        const data = res.data;

        console.log("🔥 reservation API raw =", data);
        console.log("🔥 rooms raw =", data.rooms);
        console.log("🔥 rooms[0] =", data.rooms?.[0]);

        // 사용자가 선택한 room 객체
        const selectedRoom = data.rooms.find(
          (r) => r.roomId === Number(roomId)
        );

        // 해당 프로그램의 rooms
        setRooms(data.rooms);
        // 해당 프로그램의 최대 수용인원
        setProgramPeople(data.programPeople);

        console.log("programPeople =", data.programPeople);

        // 사용자에게 보여줄 초기 폼 세팅
        setForm((prev) => ({
          ...prev,
          programId: data.programId,
          programTitle: data.programTitle, // 사용자 ux
          programPrice: data.programPrice, // 사용자 UX

          stayId: data.stayId,
          stayName: data.stayName, // 사용자 UX

          officeId: data.officeId,
          officeName: data.officeName, // 사용자 UX

          roomId: roomId ? String(roomId) : "",
          roomType: selectedRoom?.roomType || prev.roomType, // 사용자 UX

          startDate: checkIn ? new Date(checkIn) : prev.startDate,
          endDate: checkOut ? new Date(checkOut) : prev.endDate,
        }));
        console.log("🧩 rooms:", rooms);
        console.log("🧩 form.roomId:", form.roomId);
        console.log("🧩 form.roomType:", form.roomType);
      } catch (e) {
        console.error("예약용 프로그램 조회 실패", e);
      } finally {
        Swal.close();
      }
    };

    fetchProgramForReservation();
  }, [programId, roomId, checkIn, checkOut]);

  // useEffect(() => {
  //   if (!form.startDate) return;

  //   const start = new Date(form.startDate);

  //   // 이미 15:00이면 더 이상 실행 X
  //   if (start.getHours() === 15 && start.getMinutes() === 0) return;

  //   const fixedStart = new Date(start);
  //   fixedStart.setHours(15, 0, 0, 0);

  //   const fixedEnd = new Date(fixedStart);
  //   fixedEnd.setDate(fixedEnd.getDate() + 2);
  //   fixedEnd.setHours(11, 0, 0, 0);

  //   setForm((prev) => ({
  //     ...prev,
  //     startDate: fixedStart,
  //     endDate: fixedEnd,
  //   }));
  // }, [form.startDate]);

  const [isAvailable, setIsAvailable] = useState(true);
  const [checking, setChecking] = useState(false);

  // 예약 중복 체킹
  useEffect(() => {
    if (!form.roomId || !form.startDate) return;

    const checkAvailability = async () => {
      try {
        setChecking(true);

        const params = new URLSearchParams({
          roomId: form.roomId,
          startDate: form.startDate.toISOString(),
          endDate: form.endDate.toISOString(),
        });
        if ((mode === "edit" || mode === "resubmit") && initialData?.id) {
          params.append("excludeId", initialData.id);
        }

        const res = await fetch(`/api/reservations/availability?${params}`);
        const data = await res.json();

        setIsAvailable(data.available);
      } catch {
        setIsAvailable(false);
      } finally {
        setChecking(false);
      }
    };

    checkAvailability();
  }, [form.roomId, form.startDate, mode, initialData?.id]);

  // 🔥 rooms 로딩 후 roomId 기준으로 roomType 동기화
  useEffect(() => {
    if (!rooms.length || !form.roomId) return;

    const selected = rooms.find(
      (r) => String(r.roomId) === String(form.roomId)
    );

    if (selected) {
      setForm((prev) => ({
        ...prev,
        roomType: selected.roomType,
      }));
    }
  }, [rooms, form.roomId]);

  /* =========================
     유저 정보 자동 채우기
  ========================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/me");

        const userData = res.data;

        setForm((prev) => ({
          ...prev,
          userName: userData.name || prev.userName,
          company: userData.company || prev.company,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
        }));
      } catch (e) {
        console.error("유저 정보 조회 실패", e);
      }
    };

    fetchUser();
  }, []);

  /* =========================
       입력 변경
    ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "peopleCount") {
      setForm((prev) => ({
        ...prev,
        peopleCount: value,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================
     입력 폼 제출
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAvailable) {
      Swal.fire("이미 예약된 날짜입니다.");
      return;
    }

    try {
      if (mode === "edit") {
        await axios.put(`/api/reservations/${initialData.id}`, {
          startDate: toLocalDateTimeString(form.startDate),
          endDate: toLocalDateTimeString(form.endDate),
          roomId: Number(form.roomId),
          peopleCount: form.peopleCount,
        });
      }

      if (mode === "resubmit") {
        await axios.post(`/api/reservations/${initialData.id}/resubmit`, {
          startDate: toLocalDateTimeString(form.startDate),
          endDate: toLocalDateTimeString(form.endDate),
          roomId: Number(form.roomId),
          peopleCount: form.peopleCount,
        });
      }

      if (mode === "create") {
        await axios.post("/api/reservations", {
          ...form,
          startDate: toLocalDateTimeString(form.startDate),
          endDate: toLocalDateTimeString(form.endDate),
          programId: Number(form.programId),
          roomId: Number(form.roomId),
          draftKey,
        });
      }

      await Swal.fire({
        icon: "success",
        title:
          mode === "edit"
            ? "예약 수정 완료"
            : mode === "resubmit"
            ? "재신청 완료"
            : "예약 신청 완료",
      });

      navigate("/reservation/list");
    } catch (err) {
      console.error(err);

      const errorData = err?.response?.data;

      const message = errorData?.message || "예약 신청에 실패했습니다.";
      const detail = errorData?.detail;

      Swal.fire({
        icon: "error",
        title: message,
        text: detail,
      });
    }
  };

  useEffect(() => {
    if (!draftKey) return;

    const loadDraft = async () => {
      try {
        const res = await fetchDraft(draftKey);

        const normalized = normalizeDraftToForm(res.data);

        setForm((prev) => ({
          ...prev,
          ...normalized,
        }));
      } catch (e) {
        console.error("임시저장 불러오기 실패", e);
      }
    };

    loadDraft();
  }, [draftKey]);

  return (
    <div className="form">
      <form className="reservation-form" onSubmit={handleSubmit}>
        <ReservationFields
          {...form}
          rooms={rooms}
          // offices={offices}
          onChange={handleChange}
          isAvailable={isAvailable}
          checking={checking}
          programPeople={programPeople}
        />
        <ReservationFormActions
          mode={mode}
          onOpenDraft={() => setIsDraftMenuOpen((p) => !p)}
        />
      </form>

      {isCreate && isDraftMenuOpen && (
        <DraftMenuBar
          form={form} // 임시저장 데이터
          isOpen={isDraftMenuOpen} // 열림-닫힘 상태
          onClose={() => setIsDraftMenuOpen(false)}
          latestDraftId={latestDraftId} // 최근 임시저장 데이터 식별
          onSaved={setLatestDraftId}
          onSnapshotSaved={setLastSavedSnapshot} // 마지막 스냅샷
          lastSavedSnapshot={lastSavedSnapshot}
        />
      )}
    </div>
  );
}
