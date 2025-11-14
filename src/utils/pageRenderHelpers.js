import { updateCartBadge } from "./cartBadge.js";

/**
 * 장바구니 배지 업데이트 (DOM 렌더링 후 호출용)
 */
export const updateCartBadgeAfterRender = () => {
  setTimeout(() => {
    updateCartBadge();
  }, 0);
};

/**
 * 오류 처리 및 재시도 콜백 설정
 * @param {Error} error - 발생한 오류
 * @param {Function} retryFn - 재시도 함수
 * @param {string} context - 오류 발생 컨텍스트 (로깅용)
 */
export const handleRenderError = (error, retryFn, context = "page") => {
  window.isErrorState = true;
  window.currentRetryCallback = async () => {
    window.isErrorState = false;
    await retryFn();
    updateCartBadgeAfterRender();
  };
};

/**
 * 성공적인 렌더링 후 처리
 */
export const handleRenderSuccess = () => {
  window.isErrorState = false;
  updateCartBadgeAfterRender();
};

