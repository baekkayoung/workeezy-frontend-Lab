import "./ActivityInfo.css";
import { useProgramDetail } from "../../context/ProgramDetailContext.jsx";
import useImagePath from "../../../../hooks/useImagePath.js";

export default function ActivityInfo() {
    const { attractions } = useProgramDetail();
    const { fixPath } = useImagePath();

    if (!attractions || attractions.length === 0) return null;

    return (
        <section className="pd-section">
            <h3>액티비티 정보</h3>
            <hr style={{ border: 0, borderTop: "1px solid #eeeeee" }} />
            <br />

            {attractions.map((a) => {
                console.log("attraction item:", a);

                // ✅ equipment 키가 다를 수 있어서 다 받아줌
                const address =
                    a?.address ?? a?.placeAddress ?? a?.place_address ?? "";

                // ✅ url 키가 다를 수 있어서 다 받아줌 (여기가 핵심)
                const url =
                    a?.attractionUrl ?? a?.url ?? a?.attractionURL ?? a?.attraction_url ?? "";

                return (
                    <div key={a.id} className="pd-Activity-card">
                        <img
                            src={fixPath(a.photo1) ?? ""}
                            className="pd-Activity-img"
                            alt={a?.name ?? "activity"}
                        />

                        <div className="pd-Activity-info">
                            <div className="pd-Activity-title">
                                <h2>{a.name}</h2>
                            </div>

                            <div className="pd-Activity-time">
                                {String(address).trim() ? address : "주소 정보 없음"}
                            </div>

                            {String(url).trim() && (
                                <a href={url} target="_blank" rel="noreferrer">
                                    지도로 보기
                                </a>
                            )}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
