import { CartModal } from '../modals/index.js';
import { cartStore } from '../store/cartStore.js';

/**
 * 모달 컨테이너 생성 (없으면)
 */
const ensureModalContainer = () => {
  let container = document.getElementById('modal-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-container';
    container.className = 'fixed inset-0 z-50 hidden';
    // #root 내부에 추가하여 테스트 코드가 찾을 수 있도록 함
    const root = document.getElementById('root');
    if (root) {
      root.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }
  
  return container;
};

/**
 * 모달 열기
 * @param {string} modalHtml - 모달 HTML 문자열
 */
export const openModal = (modalHtml) => {
  const container = ensureModalContainer();
  
  // 배경 + 모달 컨텐츠
  container.innerHTML = `
    <!-- 배경 오버레이 -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" id="modal-backdrop"></div>
    
    <!-- 모달 컨텐츠 -->
    ${modalHtml}
  `;
  
  // 모달 표시
  container.classList.remove('hidden');
  
  // body 스크롤 막기
  document.body.style.overflow = 'hidden';
};

/**
 * 모달 닫기
 */
export const closeModal = () => {
  const container = document.getElementById('modal-container');
  
  if (container) {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
  
  // body 스크롤 복원
  document.body.style.overflow = '';
  
  // Store 구독 해제
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

/**
 * 장바구니 모달 렌더링
 */
let unsubscribe = null;

const renderCartModal = () => {
  const state = cartStore.getState();
  const modalHtml = CartModal({
    items: state.items,
    selectedItems: state.selectedItems
  });
  
  const container = document.getElementById('modal-container');
  if (container && !container.classList.contains('hidden')) {
    // 배경 + 모달 컨텐츠
    container.innerHTML = `
      <!-- 배경 오버레이 -->
      <div class="cart-modal-overlay fixed inset-0 bg-black bg-opacity-50 transition-opacity" id="modal-backdrop"></div>
      
      <!-- 모달 컨텐츠 -->
      ${modalHtml}
    `;
  }
};

/**
 * 장바구니 모달 열기 (Store 연동)
 */
export const openCartModal = () => {
  try {
    // 컨테이너 생성 및 표시
    const container = ensureModalContainer();
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // 초기 렌더링 (컨테이너가 보이는 상태에서)
    renderCartModal();
    
    // Store 구독 (상태 변경 시 자동 리렌더링)
    if (unsubscribe) {
      unsubscribe(); // 이전 구독 해제
    }
    unsubscribe = cartStore.subscribe(() => {
      renderCartModal();
    });
  } catch (error) {
    throw error;
  }
};

