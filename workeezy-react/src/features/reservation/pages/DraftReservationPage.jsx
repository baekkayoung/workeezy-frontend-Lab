// import AdminReservationSection from "../components/Admin/AdminReservationSection.jsx"
import DraftListSection from "../components/User/DraftListSection.jsx";
import DraftReservationList from "../components/User/DraftReservationList.jsx";
import PageLayout from "../../../layout/PageLayout.jsx";
import SectionHeader from "../../../shared/common/SectionHeader.jsx";

export default function DraftReservationPage() {
  return (
    <PageLayout>
      <DraftListSection>
          <SectionHeader icon="far fa-edit" title="작성 중인 예약"/>
        <DraftReservationList />
      </DraftListSection>
    </PageLayout>
  );
}
