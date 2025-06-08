"use client";
import "./Pagination.scss";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
type Props = {
  page: string;
  total: number;
};

export const Pagination: React.FC<Props> = ({ page, total }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "1";
  const letter = searchParams.get("letter") || "All";
  const current = Number(currentPage);
  const path = usePathname();
  console.log(path);
  const handleNextPage = () => {
    router.push(`/category?letter=${letter}&page=${current + 1}`);
  };

  const handlePrevPage = () => {
    if (current > 1) {
      router.push(`/category?letter=${letter}&page=${current - 1}`);
    }
  };

  return (
    <div className="pagination">
      <button
        onClick={handlePrevPage}
        className="pagination__button button__prev"
      >
        Prev
      </button>
      <span>
        {page} - {total}
      </span>
      <button
        className="pagination__button button__next"
        onClick={handleNextPage}
      >
        Next
      </button>
    </div>
  );
};
