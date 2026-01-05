import "./ProfileForm.css";
import {useEffect, useState} from "react";
import SectionHeader from "../../../shared/common/SectionHeader.jsx";
import {toast} from "../../../shared/alert/workeezyAlert.js";
import useMyInfo from "../hooks/useMyInfo.js";
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../../auth/context/AuthContext.jsx";

export default function ProfileForm() {
    const navigate = useNavigate();
    const {myInfo, loading, error, updatePhone, updatePassword} = useMyInfo();
    const {logout} = useAuthContext();

    const [user, setUser] = useState({
        email: "",
        name: "",
        birth: "",
        phone: "",
        company: "",
        role: "",
    });

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordCheck, setNewPasswordCheck] = useState("");

    const [passwordValidMessage, setPasswordValidMessage] = useState("");
    const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

    // 재인증 실패 시 리다이렉트
    useEffect(() => {
        if (error?.response?.status === 403) {
            toast.fire({
                icon: "warning",
                title: "비밀번호 재확인이 필요합니다.",
            });
            navigate("/profile-check", {replace: true});
        }
    }, [error, navigate]);

    useEffect(() => {
        if (!myInfo) return;

        setUser({
            email: myInfo.email,
            name: myInfo.name,
            birth: myInfo.birth || "",
            phone: myInfo.phone || "",
            company: myInfo.company || "",
            role: myInfo.role,
        });
    }, [myInfo]);

    if (loading || !myInfo) return null;

    const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

    const handleUpdate = async () => {
        const newPhone = user.phone?.trim();

        if (!newPhone) {
            await toast.fire({
                icon: "error",
                title: "연락처 입력 필요",
                text: "휴대폰 번호를 입력해주세요.",
            });
            return;
        }

        if (newPhone === myInfo.phone) {
            await toast.fire({
                icon: "info",
                title: "변경 사항 없음",
                text: "기존 연락처와 동일합니다.",
            });
            return;
        }

        if (!PHONE_REGEX.test(newPhone)) {
            await toast.fire({
                icon: "error",
                title: "연락처 형식 오류",
                text: "010-1234-5678 형식으로 입력해주세요.",
            });
            return;
        }

        try {
            await updatePhone(newPhone);

            await toast.fire({
                icon: "success",
                title: "연락처가 성공적으로 변경되었습니다!",
            });
        } catch (error) {
            if (error.response?.data?.code === "DUPLICATE_PHONE_NUMBER") {
                await toast.fire({
                    icon: "error",
                    title: "중복된 연락처",
                    text: "이미 사용 중인 휴대폰 번호입니다.",
                });
                return;
            }

            await toast.fire({
                icon: "error",
                title: "수정에 실패했습니다.",
                text: "잠시 후 다시 시도해주세요.",
            });
        }
    };

    const validatePasswordRule = (pwd) => {
        if (!pwd) return "";
        if (pwd.length < 8 || pwd.length > 16) return "비밀번호는 8~16자여야 합니다.";
        if (!/[0-9]/.test(pwd)) return "숫자를 포함해야 합니다.";
        if (!/[A-Z]/.test(pwd)) return "대문자를 포함해야 합니다.";
        if (!/[a-z]/.test(pwd)) return "소문자를 포함해야 합니다.";
        if (!/[!@#$%^&*]/.test(pwd)) return "특수문자를 포함해야 합니다.";
        return "사용 가능한 비밀번호입니다.";
    };

    const handleNewPasswordChange = (value) => {
        setNewPassword(value);
        setPasswordValidMessage(validatePasswordRule(value));
    };

    const handleNewPasswordCheckChange = (value) => {
        setNewPasswordCheck(value);
        setPasswordMatchMessage(
            value === newPassword
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."
        );
    };

    const handleChangePassword = async () => {
        if(!currentPassword || !newPassword || !newPasswordCheck) {
            await toast.fire({
                icon: "error",
                title: "입력값 확인",
                text: "모든 비밀번호 칸을 입력해주세요."
            });
            return;
        }

        if(passwordValidMessage !== "사용 가능한 비밀번호입니다.") {
            await toast.fire({
                icon: "error",
                title: "비밀번호 규칙 오류",
                text: passwordValidMessage,
            });
            return;
        }

        if(newPassword !== newPasswordCheck) {
            await toast.fire({
                icon: "error",
                title: "비밀번호 확인 오류",
                text: "새 비밀번호가 일치하지 않습니다.",
            });
            return;
        }

        if(currentPassword === newPassword) {
            await toast.fire({
                icon: "error",
                title: "비밀번호 변경 불가",
                text: "기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.",
            });
            return;
        }

        try {
            await updatePassword(currentPassword, newPassword, newPasswordCheck);
            await toast.fire({
                icon: "success",
                title: "비밀번호 변경 완료! 다시 로그인해주세요.",
            });
            logout();
        } catch (err) {
            await toast.fire({
                icon: "error",
                title: err.response?.data?.message || "비밀번호 변경 실패",
            });
        }
    };

    return (
        <>
            <SectionHeader icon="far fa-user" title="개인 정보 조회"/>
            <div className="profile-page">

                {/* 개인정보 수정 */}
                <div className="profile-section">
                    <h3 className="profile-section-title">개인 정보 수정</h3>

                    <div className="profile-form-row">
                        <label>아이디</label>
                        <input className="readonly-profile" readOnly value={user.email}/>
                    </div>

                    <div className="profile-form-row">
                        <label>이름</label>
                        <input className="readonly-profile" readOnly value={user.name}/>
                    </div>

                    <div className="profile-form-row">
                        <label>생년월일</label>
                        <input className="readonly-profile" readOnly value={user.birth}/>
                    </div>

                    <div className="profile-form-row">
                        <label>연락처</label>
                        <input type="text"
                               value={user.phone}
                               onChange={(e) =>
                                   setUser((p) => ({...p, phone: e.target.value}))
                               }/>
                    </div>

                    <div className="profile-form-row">
                        <label>소속 회사</label>
                        <input className="readonly-profile" readOnly value={user.company}/>
                    </div>
                    <button className="primary-btn"
                            onClick={handleUpdate}
                    >개인 정보 수정
                    </button>
                </div>

                {/* 비밀번호 변경 */}
                <div className="profile-section">
                    <h3 className="profile-section-title">비밀번호 변경</h3>

                    <div className="profile-form-row">
                        <label>기존 비밀번호</label>
                        <input type="password"
                               value={currentPassword}
                               onChange={(e) => setCurrentPassword(e.target.value)}/>
                    </div>

                    <div className="profile-form-row">
                        <label>새 비밀번호</label>
                        <input type="password"
                               value={newPassword}
                               onChange={(e) => handleNewPasswordChange(e.target.value)}/>
                    </div>

                    <p className={`hint ${passwordValidMessage.includes("사용 가능한 비밀번호입니다.") ? "success" : "error"}`}>
                        {passwordValidMessage}
                    </p>

                    <div className="profile-form-row">
                        <label>새 비밀번호 확인</label>
                        <input type="password"
                               value={newPasswordCheck}
                               onChange={(e) => handleNewPasswordCheckChange(e.target.value)}/>
                    </div>

                    <p className={`hint ${passwordMatchMessage === "비밀번호가 일치합니다." ? "success" : "error"}`}>
                        {passwordMatchMessage}
                    </p>

                    <button className="primary-btn"
                            onClick={handleChangePassword}>비밀번호 변경
                    </button>
                </div>
            </div>
        </>
    );
}
