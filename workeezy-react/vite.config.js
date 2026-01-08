import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
            },
        },
    },

    // Vitest 설정 추가
    test: {
        globals: true,              // describe / it / expect 전역 사용
        environment: "jsdom",       // React 컴포넌트 대비
        include: ["src/tests/**/*.test.{js,jsx}"],
        setupFiles: ["src/tests/setupTests.js"],             // 필요하면 나중에 추가
    },
});
