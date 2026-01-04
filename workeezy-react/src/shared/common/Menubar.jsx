import "./Menubar.css";
import React, { useEffect, useMemo, useState } from "react";
import { alert, toast } from "../alert/workeezyAlert.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../features/auth/context/AuthContext.jsx";
import { normalizeRole } from "../../utils/normalizeRole.js";

export default function MenuBar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { user, isAuthenticated, loading, logout } = useAuthContext();

  // 메뉴 데이터
  const userMenu = [
    {
      title: "마이페이지",
      sub: [
        { name: "개인 정보 조회", path: "/profile-check" },
        { name: "찜 목록", path: "/likes" },
      ],
    },
    {
      title: "나의 예약",
      sub: [
        { name: "예약 조회", path: "/reservation/list" },
        { name: "작성 중인 예약", path: "/reservation/draftList" },
      ],
    },
    { title: "프로그램 찾기", path: "/search" },
    { title: "리뷰", path: "/reviews" },
  ];

  const adminMenu = [
    {
      title: "예약 관리",
      path: "/admin/reservations",
    },
    { title: "프로그램 찾기", path: "/search" },
    { title: "리뷰", path: "/reviews" },
    { title: "Admin", isFooter: true, path: "/admin" },
  ];

  // 권한/메뉴
  const role = normalizeRole(user?.role);
  const isAdminUser = role === "ADMIN";

  const menu = useMemo(() => {
    return isAdminUser ? adminMenu : userMenu;
  }, [isAdminUser]);

  //  현재 페이지 기준 대메뉴만 열기
  const [openItems, setOpenItems] = useState([]);

  useEffect(() => {
    const activeParents = menu
      .filter((m) => m.sub?.some((s) => s.path === currentPath))
      .map((m) => m.title);

    setOpenItems(activeParents);
  }, [menu, currentPath]);

  const toggleItem = (title) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  // 보호된 메뉴 클릭 처리
  const handleProtectedClick = async (path) => {
    if (!isAuthenticated) {
      await toast.fire({
        icon: "warning",
        title: "로그인이 필요한 서비스입니다.",
      });
      navigate("/login");
      return;
    }
    navigate(path);
    onClose?.();
  };

  // 로그아웃
  const handleLogout = async () => {
    const result = await alert.fire({
      text: "로그아웃 하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: "#ccc",
      cancelButtonColor: "#35593D",
      confirmButtonText: "로그아웃",
      cancelButtonText: "취소",
      timer: null,
    });

    if (!result.isConfirmed) return;

    await logout(); // 상태만 초기화

    await toast.fire({
      icon: "success",
      title: "로그아웃 완료! 다시 만나요. 😥",
    });
    navigate("/");
    onClose?.();
  };

  return (
    <div className="menu-bar">
      {/* 메뉴 헤더 */}
      <div className="menu-header">
        {user && (
          <p className="menu-user">
            {user.name}님 👋
            {isAdminUser && <span className="admin-badge">Admin</span>}
          </p>
        )}
      </div>

      <hr className="menu-divider" />

      {/* 메뉴 반복 렌더링 */}
      {menu.map((item, idx) => (
        <div key={idx} className="menu-item">
          <div
            className={`menu-title
                        ${item.isFooter ? "menu-footer" : ""}
                        ${item.path === currentPath ? "active" : ""}`}
            onClick={() =>
              item.path
                ? handleProtectedClick(item.path)
                : toggleItem(item.title)
            }
          >
            {item.title}
          </div>

          {/* 서브메뉴 */}
          {item.sub && openItems.includes(item.title) && (
            <div className="submenu">
              {item.sub.map((sub, subIdx) => (
                <div
                  key={subIdx}
                  className={`submenu-item ${
                    sub.path === currentPath ? "active" : ""
                  }`}
                  onClick={() => handleProtectedClick(sub.path)}
                >
                  {sub.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 로그인 / 로그아웃 버튼 */}
      <div className="logout-btn">
        {isAuthenticated ? (
          <div className="logout-title" onClick={handleLogout}>
            로그아웃
          </div>
        ) : (
          <div className="logout-title" onClick={() => navigate("/login")}>
            로그인
          </div>
        )}
      </div>
    </div>
  );
}
