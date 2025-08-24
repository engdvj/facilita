import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <Button
        variant="secondary"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        icon={<ChevronLeft size={16} />}
      />
      
      <span className="px-3 py-1 text-sm">
        {currentPage} / {totalPages}
      </span>
      
      <Button
        variant="secondary"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        icon={<ChevronRight size={16} />}
      />
    </div>
  );
}