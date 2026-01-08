import {Routes, Route} from "react-router-dom";

import PrivateRoute from "./shared/route/PrivateRoute";

import LoginPage from "./features/auth/pages/LoginPage.jsx";
import Home from "./features/home/pages/Home";
import MyPage from "./features/profile/pages/MyPage.jsx";
import ProfilePasswordCheck from "./features/profile/pages/ProfilePasswordCheck.jsx";

import ProgramDetailPage from "./features/program/pages/ProgramDetailPage.jsx";
import ReviewPage from "./features/review/pages/ReviewPage.jsx";
import SearchPage from "./features/search/pages/SearchPage.jsx";

import NewReservationPage from "./features/reservation/pages/NewReservationPage.jsx";
import LikesPage from "./features/profile/pages/LikesPage.jsx";
import AdminReservationPage from "./features/reservation/pages/AdminReservationPage.jsx";
import ReservationListPage from "./features/reservation/pages/ReservationListPage.jsx";
import EditReservationPage from "./features/reservation/pages/EditReservationPage.jsx";

import CheckoutPage from "./features/payment/pages/CheckoutPage.jsx";
import PaymentSuccessPage from "./features/payment/pages/PaymentSuccessPage.jsx";
import PaymentFailPage from "./features/payment/pages/PaymentFailPage.jsx";

import Forbidden from "./shared/error/Forbidden.jsx";
import ServerError from "./shared/error/ServerError.jsx";
import NotFound from "./shared/error/NotFound.jsx";
import AdminRoute from "./shared/route/AdminRoute.jsx";
import DraftReservationPage from "./features/reservation/pages/DraftReservationPage.jsx";
import ReservationConfirmPage from "./features/reservation/pages/ReservationConfirmPage.jsx";
import ResubmitReservationPage from "./features/reservation/pages/ResubmitReservationPage.jsx";
import ComingSoon from "./shared/common/ComingSoon.jsx";

export default function App() {
    if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init("b915b18542b9776646e5434c83e959c9");
        console.log("Kakao SDK initialized!");
    }

    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            {/* 비밀번호 재확인 */}
            <Route
                path="/profile-check"
                element={
                    <PrivateRoute>
                        <ProfilePasswordCheck/>
                    </PrivateRoute>
                }
            />
            {/* 마이페이지 */}
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <MyPage/>
                    </PrivateRoute>
                }
            />
            <Route path="/likes" element={<LikesPage/>}/>

            {/* 검색, 리뷰 */}
            <Route path="/program" element={<ProgramDetailPage/>}/>
            <Route path="/programs/:id" element={<ProgramDetailPage/>}/>
            <Route path="/reviews" element={<ReviewPage/>}/>
            <Route path="/search" element={<SearchPage/>}/>

            {/* 예약 */}
            <Route path="/reservation/list" element={<ReservationListPage/>}/>
            <Route path="/reservation/new" element={<NewReservationPage/>}/>
            <Route path="/reservation/edit/:id" element={<EditReservationPage/>}/>
            <Route
                path="/reservation/resubmit/:id"
                element={<ResubmitReservationPage/>}
            />

            <Route
                path="/admin/reservations"
                element={
                    <AdminRoute>
                        <AdminReservationPage/>
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/reservations/:reservationId"
                element={
                    <AdminRoute>
                        <AdminReservationPage/>
                    </AdminRoute>
                }
            />

            <Route path="/reservation/draftList" element={<DraftReservationPage/>}/>
            <Route
                path="/reservation/:id/confirmation"
                element={<ReservationConfirmPage/>}
            ></Route>

            {/* 결제 */}
            <Route path="/payment/:reservationId" element={<CheckoutPage/>}/>
            <Route path="/payment/result/success" element={<PaymentSuccessPage/>}/>
            <Route path="/payment/result/fail" element={<PaymentFailPage/>}/>

            {/*서비스 준비 페이지*/}
            <Route path="/coming-soon" element={<ComingSoon/>}/>

            {/* 에러 페이지 */}
            <Route path="/403" element={<Forbidden/>}/>
            <Route path="/500" element={<ServerError/>}/>

            {/* 404 자동 이동 */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    );
}
