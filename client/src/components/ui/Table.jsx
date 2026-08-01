export const Table = ({ children, className = "" }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-[#D4D4D8] bg-white ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-[#FAFAFA] border-b border-[#D4D4D8] text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9C9C9C] sticky top-0 z-10">
      <tr>{children}</tr>
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
    <tbody className="divide-y divide-[#E5E5EA] bg-white text-sm text-[#0A0A0A]">
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = "" }) => {
  return (
    <tr className={`hover:bg-[#F6F6F9] transition-colors duration-100 ${className}`}>
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
