import { Router } from "../Router.js";
import { getSearchValue } from "../utils/jsUtils.js";
import { openCartModal, closeModal } from "../utils/modalUtils.js";
import { cartStore } from "../store/cartStore.js";
import { showToast, ToastType } from "../utils/toast.js";
import { updateCartBadge } from "../utils/cartBadge.js";

/**
 * click 이벤트 핸들러
 * @param {Event} event - 클릭 이벤트
 */
export const handleClick = (event) => {
  // 오류 상태일 때는 필터 관련 클릭 무시 (장바구니, 모달 등은 허용)
  if (window.isErrorState) {
    // 카테고리, 검색 등 필터 관련 클릭 무시
    if (
      event.target.dataset.category1 ||
      event.target.dataset.category2 ||
      event.target.dataset.breadcrumb === "reset" ||
      event.target.id === "search-btn" ||
      event.target.closest("[data-category1]") ||
      event.target.closest("[data-category2]") ||
      event.target.closest("[data-breadcrumb='reset']") ||
      event.target.closest("#search-btn")
    ) {
      event.preventDefault();
      return;
    }
  }

  // 장바구니 아이콘 클릭
  if (event.target.closest("#cart-icon-btn")) {
    console.log('[DEBUG] Cart icon clicked');
    try {
      openCartModal(); // 빈 장바구니로 열기
    } catch (error) {
      console.error('[ERROR] Failed to open cart modal:', error);
    }
    return;
  }

  // 장바구니 모달 닫기 버튼
  if (event.target.closest("#cart-modal-close-btn")) {
    closeModal();
    return;
  }

  // 모달 배경 클릭 시 닫기
  if (event.target.id === "modal-backdrop" || event.target.classList.contains("cart-modal-overlay")) {
    closeModal();
    return;
  }

  // === 장바구니 모달 내부 액션들 ===

  // 장바구니 아이템 체크박스 (개별 선택)
  if (event.target.classList.contains("cart-item-checkbox")) {
    const productId = event.target.dataset.productId;
    cartStore.toggleSelect(productId);
    return;
  }

  // 전체 선택 체크박스
  if (event.target.id === "cart-modal-select-all-checkbox") {
    cartStore.toggleSelectAll();
    return;
  }

  // 수량 증가 버튼
  if (event.target.closest(".quantity-increase-btn")) {
    const btn = event.target.closest(".quantity-increase-btn");
    const productId = btn.dataset.productId;
    cartStore.increaseQuantity(productId);
    return;
  }

  // 수량 감소 버튼 (장바구니 모달)
  if (event.target.closest(".quantity-decrease-btn")) {
    const btn = event.target.closest(".quantity-decrease-btn");
    const productId = btn.dataset.productId;
    cartStore.decreaseQuantity(productId);
    return;
  }

  // 상세 페이지 수량 증가 버튼
  if (event.target.closest(".detail-quantity-increase-btn") || event.target.id === "quantity-increase") {
    const btn = event.target.closest(".detail-quantity-increase-btn") || event.target;
    const productId = btn.dataset.productId;
    const input = document.getElementById('quantity-input');
    if (input) {
      const currentValue = parseInt(input.value) || 1;
      const maxValue = parseInt(input.max) || 107;
      const newValue = Math.min(currentValue + 1, maxValue);
      input.value = newValue;
      
      // 감소 버튼 활성화/비활성화
      const decreaseBtn = document.getElementById('quantity-decrease');
      if (decreaseBtn) {
        decreaseBtn.disabled = newValue <= 1;
      }
    }
    return;
  }

  // 상세 페이지 수량 감소 버튼
  if (event.target.closest(".detail-quantity-decrease-btn") || event.target.id === "quantity-decrease") {
    const btn = event.target.closest(".detail-quantity-decrease-btn") || event.target;
    if (btn.disabled) return; // 비활성화된 버튼은 무시
    
    const productId = btn.dataset.productId;
    const input = document.getElementById('quantity-input');
    if (input) {
      const currentValue = parseInt(input.value) || 1;
      const newValue = Math.max(currentValue - 1, 1);
      input.value = newValue;
      
      // 감소 버튼 활성화/비활성화
      btn.disabled = newValue <= 1;
    }
    return;
  }

  // 상세 페이지 수량 입력 필드 변경
  if (event.target.classList.contains('detail-quantity-input') || event.target.id === "quantity-input") {
    const input = event.target;
    const value = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 107;
    
    // 범위 제한
    const clampedValue = Math.max(min, Math.min(value, max));
    input.value = clampedValue;
    
    // 감소 버튼 활성화/비활성화
    const decreaseBtn = document.getElementById('quantity-decrease');
    if (decreaseBtn) {
      decreaseBtn.disabled = clampedValue <= 1;
    }
    return;
  }

  // 상품 삭제 버튼
  if (event.target.closest(".cart-item-remove-btn")) {
    const btn = event.target.closest(".cart-item-remove-btn");
    const productId = btn.dataset.productId;
    const item = cartStore.getState().items.find(item => item.productId === productId);
    cartStore.removeItem(productId);
    
    // 토스트 알림 표시
    if (item) {
      showToast('상품이 삭제되었습니다', ToastType.INFO);
    }
    return;
  }

  // 선택한 상품 삭제
  if (event.target.closest("#cart-modal-remove-selected-btn")) {
    const state = cartStore.getState();
    const selectedCount = state.selectedItems.length;
    cartStore.removeSelected();
    
    // 토스트 알림 표시
    if (selectedCount > 0) {
      showToast(`선택된 상품 ${selectedCount}개가 삭제되었습니다`, ToastType.INFO);
    }
    return;
  }

  // 전체 비우기
  if (event.target.closest("#cart-modal-clear-cart-btn")) {
    const state = cartStore.getState();
    if (state.items.length === 0) {
      showToast('장바구니가 이미 비어있습니다', ToastType.INFO);
      return;
    }
    
    // 확인 없이 바로 삭제 (토스트로 확인)
    const itemCount = state.items.length;
    cartStore.clearCart();
    showToast(`장바구니의 모든 상품(${itemCount}개)이 삭제되었습니다`, ToastType.INFO);
    return;
  }

  // 구매하기 버튼
  if (event.target.closest("#cart-modal-checkout-btn")) {
    const state = cartStore.getState();
    if (state.items.length === 0) {
      showToast('장바구니에 상품이 없습니다', ToastType.INFO);
      return;
    }
    showToast('구매 기능은 추후 구현 예정입니다', ToastType.INFO);
    return;
  }

  // 장바구니 담기 버튼 (상품 목록, 상세 페이지)
  // ⚠️ 중요: 상품 카드 클릭보다 먼저 체크해야 함!
  if (event.target.closest(".add-to-cart-btn, #add-to-cart-btn")) {
    event.preventDefault();
    event.stopPropagation(); // 이벤트 버블링 중단!
    
    const btn = event.target.closest(".add-to-cart-btn, #add-to-cart-btn");
    const productId = btn.dataset.productId;
    
    // 상품 정보 가져오기 (간단한 방법: DOM에서 추출)
    const productCard = btn.closest('.product-card, .related-product-card');
    const detailSection = btn.closest('[data-product-id]');
    
    let product = null;
    
    try {
      if (productCard) {
        // 상품 카드에서 정보 추출
        const img = productCard.querySelector('img');
        const title = productCard.querySelector('h3')?.textContent.trim() || img?.alt || '';
        const priceText = productCard.querySelector('.text-lg.font-bold')?.textContent || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        
        product = {
          productId,
          title,
          image: img?.src || '',
          lprice: price
        };
      } else if (detailSection) {
        // 상세 페이지에서 정보 추출
        const title = document.querySelector('h1')?.textContent.trim() || '';
        const priceText = document.querySelector('.text-3xl.font-bold, .text-2xl.font-bold')?.textContent || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        const img = document.querySelector('.aspect-square img, .product-detail-image');
        
        // 수량 가져오기
        const quantityInput = document.getElementById('quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        
        product = {
          productId,
          title,
          image: img?.src || '',
          lprice: price
        };
        
        // 수량만큼 장바구니에 추가
        for (let i = 0; i < quantity; i++) {
          cartStore.addItem(product);
        }
        
        // 토스트 알림 표시 (성공)
        // 테스트 코드와 일치하도록 항상 "장바구니에 추가되었습니다"로 표시
        showToast('장바구니에 추가되었습니다', ToastType.SUCCESS);
        
        return; // 여기서 종료
      }
      
      // 상세 페이지는 이미 위에서 처리했으므로 여기서는 상품 카드만 처리
      if (product && product.productId && productCard) {
        cartStore.addItem(product);
        
        // 토스트 알림 표시 (성공)
        showToast('장바구니에 추가되었습니다', ToastType.SUCCESS);
      } else if (!product || !product.productId) {
        showToast('상품 정보를 찾을 수 없습니다', ToastType.ERROR);
      }
    } catch (error) {
      showToast('장바구니 담기에 실패했습니다', ToastType.ERROR);
    }
    
    return;
  }

  // 장바구니 아이템 이미지/제목 클릭 (상세 페이지로 이동)
  if (event.target.closest(".cart-item-image, .cart-item-title")) {
    const element = event.target.closest(".cart-item-image, .cart-item-title");
    const productId = element.dataset.productId;
    closeModal();
    Router.goToProductDetail(productId);
    return;
  }

  // 상품 카드 클릭 (product-card 또는 related-product-card)
  // ⚠️ 장바구니 담기 버튼을 먼저 체크했으므로 여기서는 차단됨
  const productCard = event.target.closest(".product-card, .related-product-card");
  if (productCard) {
    Router.goToProductDetail(productCard.dataset.productId);
    return;
  }

  // 상품 목록으로 돌아가기 버튼
  if (event.target.closest(".go-to-product-list")) {
    Router.resetCategory();
    return;
  }

  // 2depth 카테고리 버튼 클릭 (1depth보다 먼저 체크)
  const category2Button = event.target.closest("[data-category2]");
  if (category2Button) {
    const { category2, parentCategory1 } = category2Button.dataset;
    // 상세 페이지에서 온 경우 parent category도 함께 설정
    if (parentCategory1) {
      Router.filterByCategories(parentCategory1, category2);
    } else {
      Router.filterByCategory2(category2);
    }
    return;
  }

  // 1depth 카테고리 버튼 클릭
  const category1Button = event.target.closest("[data-category1]");
  if (category1Button) {
    Router.filterByCategory1(category1Button.dataset.category1);
    return;
  }

  // 전체 카테고리 버튼 클릭
  if (event.target.closest("[data-breadcrumb='reset']")) {
    Router.resetCategory();
    return;
  }

  // 검색 버튼 클릭
  if (event.target.closest("#search-btn")) {
    Router.search(getSearchValue());
    return;
  }

  // 404 페이지의 "홈으로" 버튼 클릭
  if (event.target.id === "404-home-btn" || event.target.closest('[id="404-home-btn"]')) {
    event.preventDefault();
    Router.resetCategory(); // 홈으로 이동
    return;
  }

  // 헤더 뒤로가기 버튼 (상세 페이지)
  if (event.target.id === "header-back-btn" || event.target.closest('[id="header-back-btn"]')) {
    window.history.back();
    return;
  }

  // 오류 페이지의 "다시 시도" 버튼
  if (event.target.id === "retry-btn" || event.target.closest('[id="retry-btn"]')) {
    event.preventDefault();
    // 장바구니 배지 즉시 업데이트 (재시도 전에도 유지)
    updateCartBadge();
    // main.js에서 설정한 retryCallback 호출
    const retryBtn = event.target.closest('[id="retry-btn"]') || event.target;
    const callback = window.currentRetryCallback;
    if (callback && typeof callback === 'function') {
      callback();
    }
    return;
  }
};


/**
 * change 이벤트 핸들러
 * @param {Event} event - change 이벤트
 */
export const handleChange = (event) => {
  // 오류 상태일 때는 필터 변경 무시
  if (window.isErrorState) {
    event.preventDefault();
    return;
  }
  
  const { id, value } = event.target;
  
  if (id === "limit-select") {
    Router.changeLimit(value);
  } else if (id === "sort-select") {
    Router.changeSort(value);
  }
};

/**
 * keyDown 이벤트 핸들러
 * @param {Event} event - keyDown 이벤트
 */
export const handleKeyDown = (event) => {
  // ESC 키로 모달 닫기
  if (event.key === "Escape") {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer && !modalContainer.classList.contains('hidden')) {
      closeModal();
      return;
    }
  }
  
  if (event.target.id === "search-input" && event.key === "Enter") {
    // 오류 상태일 때는 검색 무시
    if (window.isErrorState) {
      event.preventDefault();
      return;
    }
    Router.search(getSearchValue());
  }
};

