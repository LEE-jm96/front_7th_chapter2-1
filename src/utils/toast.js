export const ToastType = {
  SUCCESS: "success", // 초록색 - 성공
  INFO: "info", // 파란색 - 정보
  ERROR: "error", // 빨간색 - 에러
};

/**
 * 토스트 컴포넌트
 */
const Toast = ({ message, type = ToastType.SUCCESS }) => {
  const config = {
    [ToastType.SUCCESS]: {
      bgColor: "bg-green-600",
      icon: /* html */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `,
    },
    [ToastType.INFO]: {
      bgColor: "bg-blue-600",
      icon: /* html */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
    },
    [ToastType.ERROR]: {
      bgColor: "bg-red-600",
      icon: /* html */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `,
    },
  };

  const { bgColor, icon } = config[type] || config[ToastType.SUCCESS];

  return /* html */ `
    <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm animate-slide-up" id="toast-notification">
      <div class="flex-shrink-0">
        ${icon}
      </div>
      <p class="text-sm font-medium flex-1">${message}</p>
      <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
};

/**
 * 토스트 컨테이너 생성
 */
const ensureToastContainer = () => {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center";
    document.body.appendChild(container);
  }

  return container;
};

/**
 * 토스트 표시
 * @param {string} message - 토스트 메시지
 * @param {string} type - 토스트 타입 (success, info, error)
 * @param {number} duration - 표시 시간 (ms, 기본 3000ms)
 */
export const showToast = (message, type = ToastType.SUCCESS, duration = 3000) => {
  const container = ensureToastContainer();

  // 기존 토스트 제거
  const existing = container.querySelector("#toast-notification");
  if (existing) {
    existing.remove();
  }

  // 새 토스트 생성
  const toastHtml = Toast({ message, type });
  container.insertAdjacentHTML("beforeend", toastHtml);

  const toastElement = container.querySelector("#toast-notification");

  // 닫기 버튼 이벤트 (이벤트 위임 사용)
  const closeBtn = toastElement.querySelector("#toast-close-btn");
  if (closeBtn) {
    const closeHandler = () => {
      removeToast(toastElement);
      if (toastElement._timeoutId) {
        clearTimeout(toastElement._timeoutId);
      }
    };
    closeBtn.addEventListener("click", closeHandler);
  }

  // 자동 닫기
  const timeoutId = setTimeout(() => {
    removeToast(toastElement);
  }, duration);

  // 토스트 요소에 timeoutId 저장 (필요시 취소 가능)
  toastElement._timeoutId = timeoutId;
};

/**
 * 토스트 제거
 */
const removeToast = (toastElement) => {
  if (!toastElement) return;

  // timeout 취소
  if (toastElement._timeoutId) {
    clearTimeout(toastElement._timeoutId);
  }

  // 애니메이션 효과 (하단에서 사라지도록)
  toastElement.style.opacity = "0";
  toastElement.style.transform = "translateY(20px)";
  toastElement.style.transition = "all 0.3s ease-out";

  setTimeout(() => {
    toastElement.remove();

    // 컨테이너가 비어있으면 제거
    const container = document.getElementById("toast-container");
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
};
