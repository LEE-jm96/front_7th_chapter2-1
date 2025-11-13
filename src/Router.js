class RouterClass {
  constructor() {
    this.renderCallback = null;
  }

  /**
   * 렌더링 콜백 설정
   */
  setRenderCallback(callback) {
    this.renderCallback = callback;
  }

  /**
   * 경로 이동 (pushState)
   */
  push(path) {
    history.pushState("", "", path);
    if (this.renderCallback) {
      this.renderCallback();
    }
  }

  /**
   * 상품 상세 페이지로 이동
   */
  goToProductDetail(productId) {
    this.push(`/product/${productId}`);
  }

  /**
   * 1depth 카테고리 필터 적용
   */
  filterByCategory1(category1) {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("category1", category1);
    newSearchParams.delete("category2"); // 1depth 변경 시 2depth 초기화
    newSearchParams.set("page", 1); // 페이지 리셋
    this.push(`/?${newSearchParams.toString()}`);
  }

  /**
   * 2depth 카테고리 필터 적용
   */
  filterByCategory2(category2) {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("category2", category2);
    newSearchParams.set("page", 1); // 페이지 리셋
    this.push(`/?${newSearchParams.toString()}`);
  }

  /**
   * 1depth와 2depth 카테고리 필터 함께 적용
   */
  filterByCategories(category1, category2) {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("category1", category1);
    if (category2) {
      newSearchParams.set("category2", category2);
    }
    newSearchParams.set("page", 1); // 페이지 리셋
    this.push(`/?${newSearchParams.toString()}`);
  }

  /**
   * 카테고리 필터 초기화
   */
  resetCategory() {
    this.push("/");
  }

  /**
   * 검색 필터 적용
   * - 검색어 입력 시: 카테고리 유지
   * - 검색어 삭제 시: 카테고리도 함께 초기화
   */
  search(searchQuery) {
    const newSearchParams = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      newSearchParams.set("search", searchQuery);
    } else {
      newSearchParams.delete("search");
      // 검색어 삭제 시 카테고리도 초기화
      newSearchParams.delete("category1");
      newSearchParams.delete("category2");
    }
    newSearchParams.set("page", 1);
    this.push(`/?${newSearchParams.toString()}`);
  }

  /**
   * 페이지당 상품 개수 변경
   */
  changeLimit(limit) {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("limit", limit);
    newSearchParams.set("page", 1);
    this.push(`/?${newSearchParams.toString()}`);
  }

  /**
   * 정렬 변경
   */
  changeSort(sort) {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("sort", sort);
    newSearchParams.set("page", 1);
    this.push(`/?${newSearchParams.toString()}`);
  }

  /**
   * 현재 쿼리 파라미터 확인
   */
  getSearchParams() {
    return new URLSearchParams(location.search);
  }

  /**
   * 상품 ID 추출 (상세 페이지에서)
   */
  getProductIdFromPath() {
    return location.pathname.split("/").pop();
  }
}

// 싱글톤 인스턴스 생성
export const Router = new RouterClass();
