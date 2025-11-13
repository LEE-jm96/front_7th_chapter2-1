import { DetailPage } from "./DetailPage";
import { PageLayout } from "./PageLayout.js";
import { _404Page } from "./404Page.js";
import { getProducts, getProduct, getCategories } from "../api/productApi";
import { setupInfiniteScroll } from "../utils/infiniteScroll";
import { renderToRoot, renderTo } from "../utils/render";
import { restoreSearchFocus, isSearchInputFocused, getUrlParams } from "../utils/jsUtils";
import { Router } from "../Router";
import { SearchForm, ProductList } from "../components/index.js";
import { updateCartBadgeAfterRender, handleRenderError, handleRenderSuccess } from "../utils/pageRenderHelpers";

/**
 * 홈페이지 전체 렌더링
 * @param {Object} params - URL 파라미터
 */
export const renderFullHomePage = async (params) => {
  // 로딩 상태 표시
  renderToRoot(
    PageLayout({
      children: `
        ${SearchForm({ pagination: { limit: 20 }, categories: {} })}
        ${ProductList({ loading: true, products: [], pagination: { limit: 20 } })}
      `,
    }),
  );

  try {
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

    setupInfiniteScroll(productsData.pagination?.hasNext);
    handleRenderSuccess();
  } catch (error) {
    // SearchForm은 유지하고 ProductList에 오류 전달
    const productListHtml = ProductList({ loading: false, products: [], pagination: {}, error: error.message });
    renderTo(".product-list", productListHtml, { replace: true });
    handleRenderError(error, () => renderFullHomePage(params), "home page");
  }
};

/**
 * 홈페이지 부분 렌더링
 * @param {Object} params - URL 파라미터
 */
export const renderPartialHomePage = async (params) => {
  const wasSearchFocused = isSearchInputFocused();

  try {
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
    setupInfiniteScroll(productsData.pagination?.hasNext);

    // 포커스 복원
    restoreSearchFocus(wasSearchFocused);
    handleRenderSuccess();
  } catch (error) {
    // SearchForm은 유지하고 ProductList에 오류 전달
    const productListHtml = ProductList({ loading: false, products: [], pagination: {}, error: error.message });
    renderTo(".product-list", productListHtml, { replace: true });
    handleRenderError(error, () => renderPartialHomePage(params), "home page");
  }
};

/**
 * 홈페이지 렌더링 (전체 또는 부분)
 * @param {boolean} isInitial - 초기 렌더링 여부
 */
export const renderHomePage = async (isInitial = false) => {
  const params = getUrlParams();

  if (isInitial) {
    await renderFullHomePage(params);
  } else {
    await renderPartialHomePage(params);
  }
};

/**
 * 상세 페이지 렌더링
 */
export const renderDetailPage = async () => {
  // 로딩 상태 표시
  renderToRoot(DetailPage({ loading: true }));

  try {
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

    handleRenderSuccess();
  } catch (error) {
    // DetailPage에 오류 전달
    renderToRoot(DetailPage({ loading: false, error: error.message }));
    handleRenderError(error, renderDetailPage, "detail page");
  }
};

/**
 * 404 페이지 렌더링
 */
export const render404Page = () => {
  renderToRoot(
    PageLayout({
      children: _404Page(),
    }),
  );

  updateCartBadgeAfterRender();
};
