import type { EndpointConfig } from '@directus/extensions';
import { parseMysqlResults } from './resultsMysql';
import { parsePostgresResult } from './resultsPostgres';
import { OnFilterEvents, RequestPayload, ResponsePayload } from './types';

const registerEndpoint: EndpointConfig = ((router, { database, services, emitter }) => {
  const { PanelsService } = services;

  async function getPanelQuery(req: any) {
    const panelId = req.params.panelId;
    if (!panelId) throw new Error('Missing panelId');

    const service = new PanelsService({
      accountability: req.accountability,
      schema: req.schema,
    });
    const panel = (await service.readOne(panelId)) as {
      id: string;
      dashboard: string;
      options: {
        sql: string;
      };
    };

    let { variables, query }: RequestPayload = await emitter.emitFilter(OnFilterEvents.REQUEST, {
      variables: Object.assign({dashboard: panel.dashboard }, req.query ?? {}),
      query: panel.options.sql,
    }, req);

    for (const q in variables) {
      // Throw if q isn't a clean variable name
      if (!q.match(/^[a-zA-Z0-9_]+$/)) {
        throw new Error(`Invalid variable name: ${q}`);
      }

      query = query.replace(new RegExp(`{{${q}}}`, 'g'), `:${q}`);
    }

    return {
      query,
      variables,
      panel,
    };
  }

  async function executeQuery(sql: string, vars: Record<string, any>) {
    const blacklistSql = new RegExp(
      ['delete', 'update', 'insert', 'execute', 'kill', 'drop'].map(item => `\\b${item}\\b`).join('|')
    );
    if (blacklistSql.test(sql.toLowerCase())) {
      throw new Error('SQL query is blacklisted');
    }

    const missingParams = sql.match(/{{\w+}}/g);
    if (missingParams) {
      throw new Error(`Missing query param: ${missingParams.join(', ').replace(/{{|}}/g, '')}`);
    }

    const result = await database.raw(sql, vars);
    switch (database.client.config.client) {
      case 'mysql':
        return parseMysqlResults(result);
      case 'pg':
        return parsePostgresResult(result);
      default:
        throw new Error(`Unsupported database client: ${database.client.config.client}`);
    }
  }

  async function executeQueryHandler(req, res) {
		try {
    	const { query, variables } = await getPanelQuery(req)
      let result: ResponsePayload = await executeQuery(query, variables)

      result = await emitter.emitFilter(OnFilterEvents.RESPONSE, result, req);      

      // Default cache of 30 seconds
      res.set('Cache-control', 'public, max-age=30')
			return res.json(result);
		} catch (err) {
      return res.status(400).json({ error: (err as Error).message })
		}
  }

  router.get('/query/:panelId', executeQueryHandler);
});

export default registerEndpoint;