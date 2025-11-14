import { cartStore } from '../store/cartStore.js';

// 전역 구독 관리 (한 번만 구독)
let isSubscribed = false;

/**
 * 장바구니 배지 업데이트
 * 페이지 렌더링 후 호출 가능하도록 export
 */
export const updateCartBadge = () => {
  const cartBtn = document.getElementById('cart-icon-btn');
  if (!cartBtn) {
    // 버튼이 아직 없으면 나중에 다시 시도
    return;
  }

  // 상품 개수 (아이템 종류 수)
  const itemCount = cartStore.getTotalCount();
  
  // 기존 배지 제거
  const existingBadge = cartBtn.querySelector('.cart-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  // 상품이 있으면 배지 추가
  if (itemCount > 0) {
    const badge = document.createElement('span');
    badge.className = 'cart-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center';
    badge.textContent = itemCount > 99 ? '99+' : itemCount;
    cartBtn.appendChild(badge);
  }
};

/**
 * 장바구니 배지 초기화 및 구독
 */
export const initCartBadge = () => {
  // 초기 업데이트
  updateCartBadge();
  
  // Store 구독 (상태 변경 시 자동 업데이트) - 한 번만 구독
  if (!isSubscribed) {
    cartStore.subscribe(() => {
      // 약간의 지연을 주어 DOM이 준비된 후 업데이트
      setTimeout(() => {
        updateCartBadge();
      }, 0);
    });
    isSubscribed = true;
  }
};

