import useAuth from "../hooks/useAuth.js";
import {AuthContext} from "../context/AuthContext.jsx";
import {useEffect} from "react";

export default function AuthProvider({children}) {
    const auth = useAuth(); // 여기서 단 1번만 실행

    useEffect(() => {
        return () => console.log("AuthProvider UNMOUNT");
    }, []);

    useEffect(() => {
    }, [auth.user]);

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}