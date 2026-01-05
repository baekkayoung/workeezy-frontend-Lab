import "./LoginForm.css";
import LoginInputs from "./LoginInputs.jsx";
import LoginOptions from "./LoginOptions.jsx";
import LoginButton from "./LoginButton.jsx";
import SocialLoginButtons from "./SocialLoginButtons.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {toast} from "../../../shared/alert/workeezyAlert.js";
import {useAuthContext} from "../context/AuthContext.jsx";

export default function LoginForm() {
    const navigate = useNavigate();
    const {login} = useAuthContext();

    // 입력 상태
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // 옵션 상태
    const [rememberEmail, setRememberEmail] = useState(false);
    const [autoLogin, setAutoLogin] = useState(false);

    // UX 상태
    const [loading, setLoading] = useState(false);

    // 저장된 이메일 불러오기 (UX 용도)
    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        try {
            setLoading(true);

            const data = await login({
                email,
                password,
                autoLogin,      // 서버에서 refreshToken TTL 제어용
                rememberEmail,  // 프론트 UX 용
            });

            // 이메일 저장 여부 처리
            if (rememberEmail) {
                localStorage.setItem("savedEmail", email);
            } else {
                localStorage.removeItem("savedEmail");
            }

            await toast.fire({
                icon: "success",
                title: `${data.name}님 환영합니다. 😊`,
            });

            navigate("/");
        } catch (err) {
            await toast.fire({
                icon: "error",
                title: "아이디 또는 비밀번호가 올바르지 않습니다.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">로그인</h2>

            {/* 이메일 / 비밀번호 입력 */}
            <LoginInputs
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
            />

            {/* 자동 로그인 / 이메일 저장 옵션 */}
            <LoginOptions
                rememberEmail={rememberEmail}
                setRememberEmail={setRememberEmail}
                autoLogin={autoLogin}
                setAutoLogin={setAutoLogin}
            />

            {/* 로그인 버튼 (중복 클릭 방지) */}
            <LoginButton disabled={loading}/>

            {/* 소셜 로그인 */}
            {/*<SocialLoginButtons/>*/}
        </form>
    );
}