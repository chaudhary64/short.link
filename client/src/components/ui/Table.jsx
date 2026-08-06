export const Table = ({ children, className = "" }) => {
  return (
    <div className={`g-table-wrap ${className}`}>
      <table className="g-table w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = "" }) => {
  return (
    <thead className="bg-[var(--g-paper)]">
      <tr className={className}>{children}</tr>
    </thead>
  );
};

export const TableHead = ({ children, className = "" }) => {
  return (
    <th className={`px-5 py-3 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
};

export const TableBody = ({ children }) => {
  return (
    <tbody className="bg-[var(--g-paper)] text-sm text-[var(--g-ink)]">
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = "" }) => {
  return (
    <tr className={`transition-colors duration-100 ${className}`}>
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = "" }) => {
  return (
    <td className={`px-5 py-3 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
};
