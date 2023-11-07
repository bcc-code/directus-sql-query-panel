import { parseSqlResults } from "./types";

type mysqlResult = [
	rowSet: Array<Record<string, any>> | [Array<Record<string, any>>, any],
	metaInfo: Array<{ name: string }> | [[Array<{ name: string }>], any]
]

export const parseMysqlResults: parseSqlResults = (result: mysqlResult) => {
	const [rowSet, metaInfo] = result
	// Handle use case for how procedures are returned
	const items = rowSet.length === 2 && Array.isArray(rowSet[0]) ? rowSet.at(0) : rowSet;

	const fields: Array<{ name: string }> = metaInfo.length === 2 && Array.isArray(metaInfo[0]) ? metaInfo.at(0) : metaInfo;
	const headers = fields.map(v => v.name);

	return { items, headers };
}