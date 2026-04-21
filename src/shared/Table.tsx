// components/SmartTable.jsx
import { Link } from "react-router-dom";
interface Column<T = any> {
  key?: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface Action<T = any> {
  label?: string;
  path?: string;
  render?: (item: T) => React.ReactNode;
}

interface SmartTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
}




function SmartTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  actions = [] 
}: SmartTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg">
        <p className="text-lg font-medium text-slate-900">No Data Found</p>
        <p className="text-sm mt-1 text-slate-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className=" overflow-x-auto border rounded-lg">
      <div className="w-[400px] md:w-full ">
      <table className="w-full text-sm">
        {/* Header */}
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-4 text-left font-semibold text-slate-700">
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-4 text-right font-semibold text-slate-700">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
              {/* Dynamic Columns */}
              {columns.map((col, index) => (
                <td key={index} className="px-6 py-4">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
              
              {/* Actions Column */}
              {actions.length > 0 && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actions.map((action, idx) => (
                      action.render ? (
                        action.render(item)
                      ) : (
                        <Link
                          key={idx}
                          to={`${action.path}/${item.id}`}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          {action.label}
                        </Link>
                      )
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default SmartTable;

