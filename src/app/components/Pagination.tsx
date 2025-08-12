"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "../lib/formatters";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-6 py-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          전체 {formatNumber(totalCount)}개 중 {formatNumber(startItem)}-
          {formatNumber(endItem)}개 표시
        </div>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-1 border border-input bg-background rounded-md text-sm"
        >
          <option value={20}>20개씩</option>
          <option value={100}>100개씩</option>
          <option value={500}>500개씩</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 7) return true;
              if (page === 1 || page === totalPages) return true;
              if (Math.abs(page - currentPage) <= 1) return true;
              if (page === 2 && currentPage <= 3) return true;
              if (page === totalPages - 1 && currentPage >= totalPages - 2)
                return true;
              return false;
            })
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-10"
                >
                  {formatNumber(page)}
                </Button>
              </React.Fragment>
            ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
