import { isValidPath, getRelativePath } from "./utils/jsUtils";
import { Router } from "./Router";
import { handleClick, handleChange, handleKeyDown } from "./handlers/eventHandlers.js";
import { initCartBadge } from "./utils/cartBadge.js";
import { renderHomePage, renderDetailPage, render404Page } from "./pages/pageRenderers.js";

/**
 * MSW 모킹 활성화
 */
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

/**
 * 메인 렌더링 함수
 * @param {boolean} isInitial - 초기 렌더링 여부
 */
async function render(isInitial = false) {
  const pathname = location.pathname;
  const relativePath = getRelativePath(pathname);
  const isHomePage = relativePath === "/";
  const wasHomePage = document.querySelector(".search-form") !== null;
  const needsFullRender = isInitial || isHomePage !== wasHomePage;

  // 페이지 전환 시 스크롤을 맨 위로
  if (needsFullRender && !isInitial) {
    window.scrollTo(0, 0);
  }

  // 유효하지 않은 경로면 404 페이지 표시
  if (!isValidPath(relativePath)) {
    render404Page();
    return;
  }

  if (isHomePage) {
    await renderHomePage(needsFullRender);
  } else {
    await renderDetailPage();
  }
}

// 이벤트 리스너 등록
const setupEventListeners = () => {
  document.body.addEventListener("click", handleClick);
  document.body.addEventListener("change", handleChange);
  document.body.addEventListener("keydown", handleKeyDown);
  window.addEventListener("popstate", () => render(false));
};

// 애플리케이션 초기화
async function main() {
  Router.setRenderCallback(() => render(false));
  await render(true);
  setupEventListeners();
  initCartBadge(); // 장바구니 배지 초기화
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
