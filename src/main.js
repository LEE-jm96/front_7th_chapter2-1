import { DetailPage } from "./pages/DetailPage";
import { PageLayout } from "./pages/PageLayout.js";
import { _404Page } from "./pages/404Page.js";
import { getProducts, getProduct, getCategories } from "./api/productApi";
import { setupInfiniteScroll } from "./utils/infiniteScroll";
import { renderToRoot, renderTo } from "./utils/render";
import { restoreSearchFocus, isSearchInputFocused, getUrlParams, isValidPath, getRelativePath } from "./utils/jsUtils";
import { Router } from "./Router";
import { SearchForm, ProductList } from "./components/index.js";
import { handleClick, handleChange, handleKeyDown } from "./handlers/eventHandlers.js";
import { initCartBadge, updateCartBadge } from "./utils/cartBadge.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 홈페이지 전체 렌더링
const renderFullHomePage = async (params) => {
  // 로딩 상태 표시
  renderToRoot(
    PageLayout({
      children: `
        ${SearchForm({ pagination: { limit: 20 }, categories: {} })}
        ${ProductList({ loading: true, products: [], pagination: { limit: 20 } })}
      `,
    }),
  );

  // 데이터 로드
  const [categories, productsData] = await Promise.all([getCategories(), getProducts(params)]);

  // 전체 페이지 렌더링
  renderToRoot(
    PageLayout({
      children: `
        ${SearchForm({ pagination: productsData.pagination, categories })}
        ${ProductList({ loading: false, products: productsData.products, pagination: productsData.pagination })}
      `,
    }),
  );

  setupInfiniteScroll();

  // 장바구니 배지 업데이트 (Header 렌더링 후)
  setTimeout(() => {
    updateCartBadge();
  }, 0);
};

// 홈페이지 부분 렌더링
const renderPartialHomePage = async (params) => {
  const wasSearchFocused = isSearchInputFocused();

  // 데이터 로드
  const [productsData, categories] = await Promise.all([getProducts(params), getCategories()]);

  // SearchForm 업데이트
  const searchFormHtml = SearchForm({
    filters: {
      search: params.search,
      sort: params.sort,
      category1: params.category1,
      category2: params.category2,
    },
    pagination: productsData.pagination,
    categories,
  });
  renderTo(".search-form", searchFormHtml, { replace: true });

  // ProductList 업데이트
  const productListHtml = ProductList({
    loading: false,
    products: productsData.products,
    pagination: productsData.pagination,
  });
  renderTo(".product-list", productListHtml, { replace: true });
  setupInfiniteScroll();

  // 포커스 복원
  restoreSearchFocus(wasSearchFocused);

  // 장바구니 배지 업데이트 (Header는 변경 안 되지만 안전하게)
  setTimeout(() => {
    updateCartBadge();
  }, 0);
};

// 홈페이지 렌더링
async function renderHomePage(isInitial = false) {
  const params = getUrlParams();

  if (isInitial) {
    await renderFullHomePage(params);
  } else {
    await renderPartialHomePage(params);
  }
}

// 상세 페이지 렌더링
const renderDetailPage = async () => {
  // 로딩 상태 표시
  renderToRoot(DetailPage({ loading: true }));

  const productId = Router.getProductIdFromPath();
  const product = await getProduct(productId);

  // 관련 상품 가져오기 (같은 category2의 다른 상품들, 현재 상품 제외)
  const relatedProductsData = await getProducts({ category2: product.category2 });
  const relatedProducts = relatedProductsData.products.filter((p) => p.productId !== product.productId);

  renderToRoot(
    DetailPage({
      product,
      relatedProducts,
      loading: false,
    }),
  );

  // 장바구니 배지 업데이트 (Header 렌더링 후)
  setTimeout(() => {
    updateCartBadge();
  }, 0);
};

// 메인 렌더링 함수
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

// 404 페이지 렌더링
const render404Page = () => {
  renderToRoot(
    PageLayout({
      children: _404Page(),
    }),
  );

  // 장바구니 배지 업데이트 (Header 렌더링 후)
  setTimeout(() => {
    updateCartBadge();
  }, 0);
};

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
