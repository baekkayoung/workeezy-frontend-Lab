import "./RoomList.css";
import { useProgramDetail } from "../../context/ProgramDetailContext.jsx";
import useImagePath from "../../../../hooks/useImagePath.js";

export default function RoomList() {
    const { rooms, hotel } = useProgramDetail();
    const { fixPath } = useImagePath();

    if (!rooms || rooms.length === 0) return null;

    const photoList = [hotel?.photo2, hotel?.photo3, hotel?.photo4,].map(fixPath);
    console.log("rooms:", rooms);
    console.log("hotel photos:", hotel?.photo2, hotel?.photo3, hotel?.photo4);
    console.log("photoList:", photoList);

    return (
        <div className="pd-rooms">
            <h3>룸 타입</h3>

            {rooms.map((r, index) => {
                const imgSrc = photoList[index] ?? null;

                return (
                    <div key={r.id} className="pd-room-item">
                        {imgSrc && <img src={imgSrc} className="pd-room-img" />}

                        <div className="pd-room-info">
                            <div className="pd-room-type">{r.roomType}</div>

                            <div className="pd-room-items">
                                <i className="fa-solid fa-wifi" />
                                <i className="fa-solid fa-tv" />
                                <i className="fa-solid fa-print" />
                                <i className="fa-solid fa-phone" />
                            </div>

                            <div className="pd-room-desc">{r.roomService}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
