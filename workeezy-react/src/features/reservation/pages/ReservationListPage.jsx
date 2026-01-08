import {useState} from "react";
import PageLayout from "../../../layout/PageLayout.jsx";
import ReservationListContainer from "../components/User/ReservationListContainer.jsx";
import SectionHeader from "../../../shared/common/SectionHeader.jsx";

export default function ReservationListPage() {
    // 유저가 클릭해서 선택한 예약의 id 저장
    const [selectedId, setSelectedId] = useState(null);

    return (
        <PageLayout>
            <div className="reservation-container">
                <SectionHeader icon="far fa-calendar" title="예약 목록"/>
                <ReservationListContainer
                    selectedId={selectedId} // 현재 선택된 예약 id
                    setSelectedId={setSelectedId} // 함수
                />
            </div>
        </PageLayout>
    );
}
