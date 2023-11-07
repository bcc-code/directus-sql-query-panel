import { parseSqlResults } from "./types";

type pgResult = {
	rows: any[],
	fields: Array<{
		name: string
	}>
}

export const parsePostgresResult: parseSqlResults = (result: pgResult) => {
	// TODO: Handle use case for how procedures are returned
	const items = result.rows;
	const headers = result.fields.map((v: {name: string}) => v.name);

	return { items, headers };
}