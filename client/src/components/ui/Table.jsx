export const Table = ({ children, className = "" }) => {
  return (
    <div className={`w-full overflow-x-auto border border-gray-200 bg-white ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-600 sticky top-0 z-10">
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
    <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-800">
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = "" }) => {
  return (
    <tr className={`hover:bg-gray-50/60 transition-colors duration-100 ${className}`}>
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
