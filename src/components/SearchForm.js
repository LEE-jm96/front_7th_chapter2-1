export const SearchForm = ({ filters, pagination, categories }) => {
  const searchParams = new URLSearchParams(location.search);

  const getParam = (key, defaultValue = "") => {
    return searchParams.get(key) || filters?.[key] || defaultValue;
  };

  const sort = getParam("sort", "price_asc");
  const limit = searchParams.get("limit") || pagination?.limit?.toString() || "20";
  const search = getParam("search");
  const category1 = getParam("category1");
  const category2 = getParam("category2");
  const targetCategory = category1 || (categories && Object.keys(categories)[0]);

  const createCategoryButton = (categoryName, dataAttr, isSelected, styleType = "primary") => {
    const styles = {
      primary: isSelected ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 hover:bg-blue-50",
      secondary: isSelected ? "bg-blue-100 border-blue-500 text-blue-700" : "border-gray-300 hover:bg-gray-50",
    };
    return `<button class="px-3 py-1 text-sm border rounded ${styles[styleType]}" ${dataAttr}="${categoryName}"> ${categoryName} </button>`;
  };

  const renderCategory1 = () => {
    if (!categories || Object.keys(categories).length === 0) {
      return '<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>';
    }
    return Object.keys(categories)
      .map((cat1) => createCategoryButton(cat1, "data-category1", category1 === cat1))
      .join("");
  };

  const renderCategory2 = () => {
    if (!targetCategory || !categories?.[targetCategory]) return "";

    const category2List = Object.keys(categories[targetCategory]);
    if (category2List.length === 0) return "";

    const buttons = category2List
      .map((cat2) => createCategoryButton(cat2, "data-category2", category2 === cat2, "secondary"))
      .join("");

    return `<div class="flex flex-wrap gap-2 mt-2">${buttons}</div>`;
  };

  const renderBreadcrumb = () => {
    const separator = '<span class="text-xs text-gray-500">></span>';
    const parts = ['<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>'];

    if (category1) {
      parts.push(
        separator,
        `<button data-category1="${category1}" class="text-xs text-gray-700 font-medium hover:text-blue-600 hover:underline">${category1}</button>`,
      );
    }
    if (category2) {
      parts.push(separator, `<span class="text-xs text-gray-700 font-medium">${category2}</span>`);
    }

    return parts.join("");
  };

  const createSelect = (id, options, selectedValue) => {
    const optionsHtml = options
      .map(
        ({ value, label }) => `<option value="${value}" ${selectedValue === value ? "selected" : ""}>${label}</option>`,
      )
      .join("");
    return `<select id="${id}" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">${optionsHtml}</select>`;
  };

  return /* html */ `
        <div class="search-form bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="mb-4">
                <div class="relative">
                    <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="${search}" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <button id="search-btn" class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="space-y-3">
                <div class="space-y-2" data-testid="category-section">
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600" id="category-label">카테고리:</label>
                        ${renderBreadcrumb()}
                    </div>
                    
                    ${!category1 ? `<div class="flex flex-wrap gap-2">${renderCategory1()}</div>` : renderCategory2()}
                </div>
                
                <div class="flex gap-2 items-center justify-between">
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600">개수:</label>
                        ${createSelect(
                          "limit-select",
                          [
                            { value: "10", label: "10개" },
                            { value: "20", label: "20개" },
                            { value: "50", label: "50개" },
                            { value: "100", label: "100개" },
                          ],
                          limit,
                        )}
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-600">정렬:</label>
                        ${createSelect(
                          "sort-select",
                          [
                            { value: "price_asc", label: "가격 낮은순" },
                            { value: "price_desc", label: "가격 높은순" },
                            { value: "name_asc", label: "이름순" },
                            { value: "name_desc", label: "이름 역순" },
                          ],
                          sort,
                        )}
                    </div>
                </div>
            </div>
        </div>
    `;
};
