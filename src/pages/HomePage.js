import { PageLayout } from "./PageLayout";
import { SearchForm, ProductList } from "../components/index.js";

export const HomePage = ({ filters, products, pagination, loading }) => {
  return PageLayout({
    children: `
            ${SearchForm({ filters, pagination })}
            ${ProductList({ loading, products })}
        `,
  });
};
