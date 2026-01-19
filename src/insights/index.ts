import { defineEndpoint } from '@directus/extensions-sdk';
import Keyv from 'keyv';
import { parseResults } from './parseQueryResults';
import { OnFilterEvents, RequestPayload, ResponsePayload } from './types';

export default defineEndpoint((router, { database, services, emitter }) => {
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
        cache: number;
      };
    };

    let { variables, query }: RequestPayload = await emitter.emitFilter(OnFilterEvents.REQUEST, {
      variables: Object.assign({ dashboard: panel.dashboard }, req.query ?? {}),
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
      cache: service.cache as Keyv<any>
    };
  }

  async function tryCache(cache: Keyv<any>, key: string, ttl: number, fn: () => Promise<any>) {
    if (!cache) return await fn();
    const cached = await cache.get(key);
    if (cached) return cached as any;

    const result = await fn();
    await cache.set(key, result, ttl);
    return result;
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
    return parseResults(result);
  }

  router.get('/query/:panelId', async (req, res) => {
		try {
    	const { query, variables, panel, cache } = await getPanelQuery(req)
      let result: ResponsePayload = await executeQuery(query, variables)

      // Default cache of 300 seconds
      let ttl = Number(panel.options.cache ?? 300)
      ttl = ttl > 0 ? ttl : 300
      const cacheKey = `insights:query:${panel.id}:${JSON.stringify(variables)}`

      // Check if noCache flag is set to bypass cache
      const noCacheParam = req.query.noCache;
      const noCache = noCacheParam === 'true' || noCacheParam === '1' || String(noCacheParam) === 'true'
      
      if (noCache) {
        // Bypass cache and execute query directly
        result = await executeQuery(query, variables)
        // Still set cache for future requests
        if (cache) {
          await cache.set(cacheKey, result, ttl)
        }
      } else {
        result = await tryCache(cache, cacheKey, ttl, () => executeQuery(query, variables))
      }

      result = await emitter.emitFilter(OnFilterEvents.RESPONSE, result, req);      

      res.set('Cache-control', `public, max-age=${ttl}`)
			return res.json(result);
		} catch (err) {
      return res.status(400).json({ error: (err as Error).message })
		}
  });
});
