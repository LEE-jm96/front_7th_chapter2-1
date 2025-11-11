import { getProducts } from "../api/productApi";

// 무한스크롤 상태
let infiniteScrollObserver;
let isLoadingMore = false; // 중복 로드 방지

/**
 * 무한스크롤 옵저버 설정
 */
export async function setupInfiniteScroll() {
  // 기존 옵저버 정리
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect();
  }

  const trigger = document.getElementById("infinite-scroll-trigger");
  if (!trigger) return;

  infiniteScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 트리거가 뷰포트에 진입했을 때
        if (entry.isIntersecting && !isLoadingMore) {
          const searchParams = new URLSearchParams(location.search);
          const currentPage = parseInt(searchParams.get("page")) || 1;
          const nextPage = currentPage + 1;

          // 다음 페이지 데이터 로드
          loadNextPage(nextPage);
        }
      });
    },
    {
      rootMargin: "300px", // 트리거까지 300px 남았을 때 감지 (더 일찍 로드)
    },
  );

  infiniteScrollObserver.observe(trigger);
}

/**
 * 다음 페이지 로드
 */
async function loadNextPage(nextPage) {
  // 이미 로딩 중이면 return
  if (isLoadingMore) return;
  isLoadingMore = true;

  const searchParams = new URLSearchParams(location.search);
  const params = {
    page: nextPage,
    limit: searchParams.get("limit") || 20,
    search: searchParams.get("search") || "",
    category1: searchParams.get("category1") || "",
    category2: searchParams.get("category2") || "",
    sort: searchParams.get("sort") || "price_asc",
  };

  // 로딩 표시
  const loadingMore = document.getElementById("loading-more");
  if (loadingMore) {
    loadingMore.classList.remove("hidden");
  }

  try {
    const newData = await getProducts(params);

    // 기존 상품에 새로운 상품 추가
    const grid = document.getElementById("products-grid");
    if (grid && newData.products) {
      newData.products.forEach((product) => {
        const productItem = /* html */ `
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card" data-product-id="${product.productId}">
            <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
              <img src="${product.image}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" loading="lazy">
            </div>
            <div class="p-3">
              <div class="cursor-pointer product-info mb-3">
                <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${product.title}</h3>
                <p class="text-xs text-gray-500 mb-2"></p>
                <p class="text-lg font-bold text-gray-900">${Number(product.lprice).toLocaleString()}원</p>
              </div>
              <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${product.productId}">
                장바구니 담기
              </button>
            </div>
          </div>
        `;
        grid.insertAdjacentHTML("beforeend", productItem);
      });
    }

    // URL 업데이트 (히스토리 변경 없음)
    searchParams.set("page", nextPage);
    history.replaceState("", "", `/?${searchParams.toString()}`);

    // 더 이상 다음 페이지가 없으면 트리거 제거
    if (!newData.pagination?.hasNext) {
      const trigger = document.getElementById("infinite-scroll-trigger");
      if (trigger && infiniteScrollObserver) {
        infiniteScrollObserver.unobserve(trigger);
        trigger.remove();
      }
      // "더 이상 상품이 없습니다" 메시지 표시
      const loadingMoreDiv = document.getElementById("loading-more");
      if (loadingMoreDiv) {
        loadingMoreDiv.innerHTML = '<div class="text-center py-4 text-sm text-gray-500">더 이상 상품이 없습니다.</div>';
        loadingMoreDiv.classList.remove("hidden");
      }
    } else {
      // 로딩 표시 숨김
      if (loadingMore) {
        loadingMore.classList.add("hidden");
      }

      // 이전 트리거 제거
      const oldTrigger = document.getElementById("infinite-scroll-trigger");
      if (oldTrigger && infiniteScrollObserver) {
        infiniteScrollObserver.unobserve(oldTrigger);
        oldTrigger.remove();
      }

      // 새로운 트리거 생성
      const newTrigger = document.createElement("div");
      newTrigger.id = "infinite-scroll-trigger";
      newTrigger.className = "h-10";
      grid?.appendChild(newTrigger);

      // 새로운 트리거 설정
      setupInfiniteScroll();
    }
  } catch (error) {
    console.error("무한스크롤 로드 실패:", error);
    if (loadingMore) {
      loadingMore.classList.add("hidden");
    }
  } finally {
    // 로딩 완료 - 다음 로드를 위해 플래그 리셋
    isLoadingMore = false;
  }
}
