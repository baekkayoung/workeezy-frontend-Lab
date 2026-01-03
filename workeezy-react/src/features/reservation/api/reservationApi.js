import axios from "../../../api/axios.js";

// 예약 취소 api
export async function cancelReservation(reservationId) {
  return axios.patch(`/api/reservations/${reservationId}/cancel`);
}

// 확정서 presigned url 요청
export function fetchConfirmDocUrl(reservationId) {
  return axios.get(`/api/reservations/${reservationId}/confirm-doc`);
}

// 예약 취소 신청 api(
export async function cancelRequestReservation(reservationId) {
  return axios.patch(`/api/reservations/${reservationId}/cancel-request`);
}
