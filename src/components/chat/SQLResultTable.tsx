import type { QueryResult } from '../../types/sql';

interface SQLResultTableProps {
  result: QueryResult;
}

export default function SQLResultTable({ result }: SQLResultTableProps) {
  if (result.rows.length === 0) {
    return (
      <div style={{ border: '1px dashed #cfd8ec', borderRadius: '10px', padding: '12px', color: '#63718f' }}>
        No results found. Try refining filters or asking a broader question.
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #dbe3f4', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px' }}>
          <thead>
            <tr>
              {result.columns.map((column) => (
                <th
                  key={column}
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: '#f1f5ff',
                    textAlign: 'left',
                    borderBottom: '1px solid #dbe3f4',
                    padding: '8px',
                    fontSize: '12px',
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={index}>
                {result.columns.map((column) => (
                  <td key={`${index}-${column}`} style={{ borderBottom: '1px solid #eef2fb', padding: '8px', fontSize: '12px' }}>
                    {String(row[column] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '8px 10px', fontSize: '12px', color: '#5e6b88', textAlign: 'left' }}>
        Showing page {result.pagination.page} of results ({result.pagination.total_rows} total rows)
      </div>
    </div>
  );
}
