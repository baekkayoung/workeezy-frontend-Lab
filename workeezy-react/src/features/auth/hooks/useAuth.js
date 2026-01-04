import {useEffect, useState} from "react";
import {loginApi, logoutApi} from "../api/authApi.js";
import {getMyInfoApi} from "../api/userApi.js";
import {refreshAxios} from "../../../api/axios.js";

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const isAuthenticated = user !== null;

    // 앱 시작 시 인증 초기화
    useEffect(() => {
        async function initAuth() {

            // 로그인 상태면 skip
            if (initialized) {
                setLoading(false);
                return;
            }

            try {
                // await refreshAxios.post("/api/auth/refresh");
                const res = await getMyInfoApi();

                setUser({
                    name: res.data.name,
                    role: res.data.role,
                });
            } catch (e) {
                // 여기서 401 나면 interceptor가 refresh 처리
                setUser(null);
            } finally {
                setInitialized(true);
                setLoading(false);
            }
        }

        initAuth();
    }, [initialized]);

    // 로그인
    const login = async ({email, password, autoLogin}) => {

        const {data} = await loginApi(email, password, autoLogin);

        setUser({
            name: data.name,
            role: data.role,
        });

        if (autoLogin) {
            localStorage.setItem("autoLogin", "true");
        } else {
            localStorage.removeItem("autoLogin");
        }
        setInitialized(true);
        return data;
    };

    // 로그아웃
    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            localStorage.removeItem("autoLogin");
            setUser(null);
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };
}