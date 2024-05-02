declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

export enum sqpFilterEvents {
	REQUEST = 'sql-query.request',
	RESPONSE = 'sql-query.response',
}

export type sqpRequestPayload = {
	query: string
	variables: Record<string, any>
}

export type sqpResponsePayload = {
	items: Record<string, any>[]
	headers: string[]
}

export type sqpFilterHandler<T> = (payload: T, req: any) => T | Promise<T> 

export type sqpRequestHandler = sqpFilterHandler<sqpRequestPayload>
export type sqpResponseHandler = sqpFilterHandler<sqpResponsePayload>