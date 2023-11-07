export type ParseSqlResults = (result: any) => {
	items: Array<Record<string, any>>
	headers: Array<string>
}

export enum OnFilterEvents {
	REQUEST = 'sql-query.request',
	RESPONSE = 'sql-query.response',
}

export type RequestPayload = {
	query: string
	variables: Record<string, any>
}

export type ResponsePayload = {
	items: Record<string, any>[]
	headers: string[]
}

export type FilterHandler<T> = (payload: T, req: any) => T | Promise<T> 

export type RequestHandler = FilterHandler<RequestPayload>
export type ResponseHandler = FilterHandler<ResponsePayload>