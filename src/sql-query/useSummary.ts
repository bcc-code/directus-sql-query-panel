type Fn = 'sum'|'avg'|'count'|'count_unique'|'count_groups'
type SummariserFunction = (items: any[], column: string) => any;
type Summarisers = Record<Fn, SummariserFunction>;

interface Column {
  summarise: Fn | null;
  value: string;
}

interface Summary {
  [key: string]: string;
}


interface Symbols {
  [key: string]: string;
}

const symbols: Symbols = {
  sum: 'Σ',
  avg: 'μ',
  count: '#',
  count_unique: '#!',
};

const summarisers: Summarisers = {
  sum(items: any[], column: string): number {
    return items.reduce((sum, item) => sum + Number.parseInt(item[column]), 0);
  },

  avg(items: any[], column: string): number {
    return Math.round(summarisers.sum(items, column) / items.length);
  },

  count(items: any[]): number {
    return items.length;
  },

  count_unique(items: any[], column: string): number {
    return new Set(items.map(item => item[column])).size;
  },

  count_groups(items: any[], column: string): Record<string, number> {
    return items.reduce((groups: Record<string, number>, item) => {
      const value = item[column];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  },
};

export function createSummary(items: any[], columns: Column[]): Summary | null {
  if (!columns.some(c => !!c.summarise)) return null;

  const summary: Summary = {};
  for (const column of columns) {
		if (!column.summarise) continue;

    const summariser = summarisers[column.summarise];
    if (!summariser) {
      throw new Error(`Summariser function for ${column.summarise} not found.`);
    }
    const value: any = summariser(items, column.value);

    if (column.summarise === 'count_groups') {
      let stringifiedValue: string = JSON.stringify(value, null, 1)
        .replace('{\n', '')
        .replace('\n}', '')
        .replace(/[",]/g, '');
      summary[column.value] = stringifiedValue;
    } else {
      summary[column.value] = `${symbols[column.summarise]} ${value}`;
    }
  }
  return summary;
}
