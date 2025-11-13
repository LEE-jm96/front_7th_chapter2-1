const skeleton = /* html */ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div class="aspect-square bg-gray-200"></div>
        <div class="p-3">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>                
            <div class="h-8 bg-gray-200 rounded"></div>
        </div>
    </div>
`;

const Loading = /* html */ `
    <div class="text-center py-4">
        <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
            </div>
        </div>
    </div>
`;

const ProductItem = ({ title, productId, image, lprice, brand, maker }) => {
  const brandName = brand || maker || "";
  return /* html */ `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
            data-product-id="${productId}">
            <!-- 상품 이미지 -->
            <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                <img src="${image}"
                    alt="${title}"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    loading="lazy">
            </div>
            <!-- 상품 정보 -->
            <div class="p-3">
                <div class="cursor-pointer product-info mb-3">
                    <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        ${title}
                    </h3>
                    <p class="text-xs text-gray-500 mb-2">${brandName}</p>
                    <p class="text-lg font-bold text-gray-900">
                        ${Number(lprice).toLocaleString()}원
                    </p>
                </div>
                <!-- 장바구니 버튼 -->
                <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                    hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${productId}">
                    장바구니 담기
                </button>
            </div>
        </div>
    `;
};

const ErrorUI = ({ errorMessage = "" }) => {
  return /* html */ `
    <div class="text-center py-12">
      <div class="text-red-500 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
      <p class="text-gray-600 mb-4">${errorMessage || "데이터를 불러올 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요."}</p>
      <button id="retry-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        다시 시도
      </button>
    </div>
  `;
};

export const ProductList = ({ loading, products, pagination, error }) => {
  // 오류 상태면 오류 UI 표시
  if (error) {
    return /* html */ `
      <div class="product-list mb-6">
        <div>
          ${ErrorUI({ errorMessage: error })}
        </div>
      </div>
    `;
  }

  return /* html */ `
        <div class="product-list mb-6">
            <div>
                ${
                  loading
                    ? /* html */ `
                        <!-- 상품 그리드 -->
                        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                            <!-- 로딩 스켈레톤 -->
                            ${skeleton.repeat(4)}
                        </div>
                        ${Loading}`
                    : /* html */ `
                        <div class="mb-4 text-sm text-gray-600">
                            총 <span class="font-medium text-gray-900">${pagination?.total || products.length}개</span>의 상품
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                            ${products.map(ProductItem).join("")}
                        </div>
                        <!-- 무한스크롤 트리거 -->
                        <div id="infinite-scroll-trigger" class="h-10"></div>
                        ${
                          pagination?.hasNext
                            ? `<div id="loading-more" class="text-center py-4 hidden">${Loading}</div>`
                            : `<div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다.</div>`
                        }
                    `
                }
            </div>
        </div>
    `;
};
