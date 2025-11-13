import React from 'react';
import './Table.css';

const Table = ({ 
  data = [], 
  columns = [], 
  loading = false, 
  emptyMessage = "No data found",
  onRowClick,
  actions = []
}) => {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={column.className || ''}>
                {column.header}
              </th>
            ))}
            {actions.length > 0 && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || row._id || rowIndex} 
              className={onRowClick ? 'clickable-row' : ''}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className || ''}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="actions-cell">
                  {actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      className={`btn btn-sm ${action.className || 'btn-secondary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      disabled={action.disabled && action.disabled(row)}
                    >
                      {action.label}
                    </button>
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

export default Table;
