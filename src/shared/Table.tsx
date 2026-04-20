import { Link } from "react-router-dom";

const SmartTable = ({ data = [], columns = [], actions = [] }) => {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg">
        No Data Found
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        {/* Header */}
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left font-semibold"
              >
                {col.label}
              </th>
            ))}

            {actions.length > 0 && (
              <th className="px-4 py-3 text-right font-semibold">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              {columns.map((col, index) => (
                <td key={index} className="px-4 py-3">
                  {item[col.key]}
                </td>
              ))}

              {/* Actions */}
              {actions.length > 0 && (
                <td className="px-4 py-3 text-right space-x-2">
                  {actions.map((action, index) => (
                    <Link
                      key={index}
                      to={`${action.path}/${item.id}`}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
                    >
                      {action.label}
                    </Link>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SmartTable;