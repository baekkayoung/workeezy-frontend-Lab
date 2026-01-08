import SectionHeader from "../../../shared/common/SectionHeader.jsx";
import LikesList from "../components/LikesList";
import PageLayout from "../../../layout/PageLayout.jsx";

export default function LikesPage() {
    const mockLikes = [
        {id: 1, title: "가평 힐링워케이션", price: "250,000원 / 2박 ~", img: "/public/가평/가평웤2.png"},
        {id: 2, title: "강원 속초 워케이션", price: "68,000원 / 2박 ~", img: "/public/강원속초/강원속초웤2.png"},
        {id: 3, title: "부산 영도 워케이션", price: "78,000원 / 2박 ~", img: "/public/부산동구/부산동구3.png"},
        {id: 4, title: "남해 지족 어촌체험 휴양마을", price: "74,000원 / 2박 ~", img: "/public/남해지족/남해지족3.png"},
        {id: 5, title: "오키나와 워케이션", price: "220,000원 / 2박 ~", img: "/public/오키나와나하/나하웤1.png"},
    ];

    return (
        <PageLayout>
            <SectionHeader icon="far fa-heart" title="찜 목록"/>
            <LikesList items={mockLikes}/>
        </PageLayout>
    );
}