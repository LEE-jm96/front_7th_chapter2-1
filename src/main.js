import { Header, Footer } from "./components";
import { HomePage } from "./pages/HomePage";
import { DetailPage } from "./pages/DetailPage";
import { getProducts, getProduct } from "./api/productApi";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const push = (path) => {
  history.pushState("", "", path);
  render();
};

async function render() {
  const $root = document.querySelector("#root");

  if (location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });

    const data = await getProducts();
    $root.innerHTML = HomePage({ ...data, loading: false });

    document.body.addEventListener("click", (event) => {
      if (event.target.closest(".product-card")) {
        const productId = event.target.closest(".product-card").dataset.productId;
        push(`/products/${productId}`);
      }
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ product: data, loading: false });
  }
}

async function main() {
  render();
}

window.addEventListener("popstate", render);

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
