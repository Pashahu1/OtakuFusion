"use client";

import { Card } from "@/components/shared/Card/Card";
import { getCategory } from "@/services/getCategory";
import { useEffect, useState } from "react";
import "./CategoryPage.scss";
import { ImInsertTemplate } from "react-icons/im";
import { Pagination } from "@/components/Pagination/Pagination";

export default function CategoryPage() {
  const [category, setCategory] = useState([]);
  const [currentPage, setCurrentPage] = useState("1");
  const [selectedLetter, setSelectedLetter] = useState("tv");

  console.log("Category Page Rendered", category);
  useEffect(() => {
    const fetchCategory = async () => {
      const fetchedCategory = await getCategory(
        selectedLetter,
        Number(currentPage)
      );
      setCategory(fetchedCategory.data.animes);
    };

    fetchCategory();
  }, []);

  return (
    <div className="category-page">
      <h1>Category Page</h1>
      <div style={{ height: "460px", background: "grey" }}></div>
      <div className="category-page__content">
        {category.map((item, idx) => (
          <Card key={idx} anime={item} />
        ))}
        <Pagination page={currentPage} total={category.length} />
      </div>
    </div>
  );
}
