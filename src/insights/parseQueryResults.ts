import { ParseSqlResults } from "./types";

export const parseResults: ParseSqlResults = (result: any) => {
  let items: Array<Record<string, any>> = [];
  let headers: Array<string> = [];

  // PostgreSQL typically uses `result.rows` and `result.fields` structure
  if (result.rows && result.fields) {
    items = result.rows;
    headers = result.fields.map((field: any) => field.name);
  }
  // MySQL and MariaDB return an array where the first element is rows and the second is fields
  else if (Array.isArray(result)) {
		const [rowSet, metaInfo] = result
		// Handle use case for how procedures are returned
		items = rowSet.length === 2 && Array.isArray(rowSet[0]) ? rowSet.at(0) : rowSet;

		const fields: Array<{ name: string }> = metaInfo.length === 2 && Array.isArray(metaInfo[0]) ? metaInfo.at(0) : metaInfo;
		headers = fields.map(v => v.name);
  }
  // SQLite returns an array of rows directly, headers may need to be parsed separately
  else if (result.length !== undefined && result.columns) {
    items = result;
    if (items.length > 0) {
      headers = Object.keys(items[0]!);
    }
  }
  // MSSQL uses `result.recordset` and `result.recordsets` structure
  else if (result.recordset) {
    items = result.recordset;
    headers = result.recordset.columns ? Object.keys(result.recordset.columns) : [];
  }
  // Add any other client-specific parsing logic as needed

  return { items, headers };
}