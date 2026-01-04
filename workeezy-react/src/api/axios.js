import axios from "axios";

// 기본 API axios - 인증 정보는 HttpOnly Cookie로만 전달
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// refresh 전용 axios - 쿠키만 사용
export const refreshAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// ==============================
// GET 중복요청 방지(dedupe)
// - React 18 StrictMode(개발모드)에서 effect 2번 실행돼도
//   같은 GET 요청은 네트워크를 1번만 타게 함
// - 반드시 "api" 인스턴스를 사용해야 refresh 인터셉터도 적용됨
// ==============================
const pendingGetMap = new Map();

function buildGetKey(url, config = {}) {
    const params = config?.params ?? {};
    // params 순서가 달라도 같은 키로 취급하고 싶으면 여기 정렬 로직을 넣어도 됨
    return `${url}?${JSON.stringify(params)}`;
}

export function getDeduped(url, config = {}) {
    const key = buildGetKey(url, config);

    if (pendingGetMap.has(key)) {
        return pendingGetMap.get(key);
    }

    const p = api.get(url, config).finally(() => {
        pendingGetMap.delete(key);
    });

    pendingGetMap.set(key, p);
    return p;
}

// 응답 인터셉터 -401 → refresh 시도
// refresh 성공 시 기존 요청 그대로 재시도
api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        // refresh 요청 자체는 제외
        if (originalRequest.url.includes("/api/auth/refresh")) {
            return Promise.reject(error);
        }

        // silentAuth 요청은 refresh 시도 X
        if (
            error.response?.status === 401 &&
            originalRequest?.meta?.silentAuth
        ) {
            return Promise.reject(error);
        }

        // 일반 API만 refresh 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await refreshAxios.post("/api/auth/refresh");
                return api(originalRequest);
            } catch {
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;