export type parseSqlResults = (result: any) => {
	items: Array<Record<string, any>>
	headers: Array<string>
}