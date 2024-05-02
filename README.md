# SQL Query Panel

View the result of your SQL query in a tabular panel with Directus Insights.

## Supports

- Global Variables
- Static Queries
- `CALL` statements
- Downloading results as CSV
- Summary row with count, sum, average, count unique and count groups
- Columns can be made searchable, sortable and marked as numeric
- Actions can be added to an entire row or as buttons at the end of each row with support for adding values from result
- **Security** panel results can only be viewed by users with access to those panels, so you can adjust permissions on a per panel basis via Directus Access


## Install

### Via npm

`npm install directus-extension-sql-query-panel`

## Usage

Add a new panel and select the `SQL Query panel` type.

Enter your SQL query, optionally adding global variables wrapped in `{{ }}` to make your query dynamic.

By default a table will be generated with the selected columns from your query, however you can manually add columns you want to display and configure them.

If you do not use variables, you can mark the panel as static.

## Events

There are two events that are fired when a query is executed:

	- `sql-query:request` - Fired before variables are replaced in the query (payload: `{ variables: Record<string, any>, query: string }`, request)
	- `sql-query:response` - Fired after the query has been executed (payload: `{items: Record<string, any>[], headers: string[]}`, request)

Use it to add your own logic to the query, for example:

```js
// Check or modify the variables and query before it gets executed
emitter.onFilter('sql-query:request', async ({ variables, query }, req) => {
	// Ensure the current user has access to the tenant
	if (query.includes('{{tenant}}') && variables.tenant) {
		const tenantSrv = new ItemsService('tenants', req);
		try {
			await tenantSrv.readOne(variables.tenant, { fields: ['id'] });
		} catch (e) { throw new Error('Invalid tenant'); }
	}

	// Add tenant if not already present eg.
	// variables.tenant = req.user.tenantId;

	return { variables, query };
})
```

## Contributing

PRs are welcome!

