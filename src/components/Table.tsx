import React from 'react';
import Loader from './Loader';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: React.ReactNode;
}

export function Table<T>({ columns, data, isLoading, pagination }: TableProps<T>) {
  if (isLoading) {
    return <Loader variant="skeleton" rows={6} cols={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="card-premium p-12 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No data available</p>
        <p className="text-slate-300 text-sm mt-1">Records will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="card-premium overflow-hidden animate-slide-up">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-slate-50 last:border-b-0 transition-colors duration-150 hover:bg-primary/[0.03]"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-slate-600"
                  >
                    {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? pagination : (
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-500">{data.length}</span> record{data.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
