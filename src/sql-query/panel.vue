<script setup lang="ts">
import { useApi, useStores } from '@directus/extensions-sdk';
import debounce from 'lodash.debounce';
import { computed, nextTick, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';
import FastTable from './FastTable.vue';

const router = useRouter();

const props = withDefaults(defineProps<{
  id: string;
  showHeader: boolean;
  columns: Array<{
    text: string;
    value: string;
    width: number;
    isNumber: boolean;
    sortable: boolean;
    searchable: boolean;
    summarise: 'sum' | 'avg' | 'count' | 'count_unique' | 'count_groups';
  }>;
  download: boolean;
  is_static: boolean;
  actions: Array<{
    label: string;
    icon: string;
    link: string;
    show_label: boolean;
    row: boolean;
    filter: Array<{
      variable: string;
      value: string;
    }>
  }>
}>(), {
  download: true,
});

const { id, showHeader, download, is_static } = toRefs(props);

const loading = ref(false);
const error = ref('');
const info = ref('');
const headers = ref(null);
const items = ref<any[] | null>(null);

const api = useApi();
const { useInsightsStore } = useStores();
const insights = useInsightsStore() as {
  getVariable: (name: string) => any;
  setVariable: (name: string, value: any) => void;
};

const requiredVariables = ref(new Set<string>());

const variablesInQuery = computed(() => {
  const variables = {};
  const missing: string[] = [];
  requiredVariables.value.forEach(v => {
    const value = insights.getVariable(v);
    if (typeof value === 'undefined' || value === null) {
      missing.push(v);
    } else {
      variables[v] = value;
    }
  });

  return missing.length ? missing : variables;
});

if (is_static.value) {
  nextTick(fetchData);
} else {
	const refetch = debounce(fetchData, 1000);
  watch(variablesInQuery, () => {
    if (Array.isArray(variablesInQuery.value)) {
      info.value = `Please specify: ${variablesInQuery.value.join(' & ')}`;
      return;
    }
    info.value = '';

		if (!items.value) {
			loading.value = true;
		}

		refetch();
	}, { immediate: true });
}

// fallback for columns
const tableHeaders = computed(() => {
  if (props.columns?.length > 0) {
    return props.columns.map(col => ({
      ...col,
      text: col.text || col.value,
    }));
  }

  return headers.value;
});

const sort = ref({ by: null, desc: false });
watch(
  sort,
  ({ by, desc }) => {
    if (by && items.value) {
      items.value = items.value.sort((a, b) => {
        if (a[by] < b[by]) return desc ? 1 : -1;
        if (a[by] > b[by]) return desc ? -1 : 1;
        return 0;
      });
    }
  },
  { deep: true }
);

let whoIsFetching;
async function fetchData() {
  if (Array.isArray(variablesInQuery.value)) return;
  loading.value = true;
  error.value = '';
  headers.value = null;
  items.value = null;

  try {
		const me = {};
		whoIsFetching = me

    const { data } = await api.get(`insights/query/${id.value}`, {
      params: variablesInQuery.value,
    });
		if (whoIsFetching !== me) return;

    if (data.error) {
      error.value = data.error;
    }

    if (data.headers && data.items) {
      const sortable = data.items.length > 2;
      headers.value = data.headers.map(function (v, i) {
        const text =  formatTitle(v);
        return {
          text,
          value: v,
          width: text.length + 1,
          sortable: sortable,
        };
      });

      const numberCols = props.columns && props.columns.filter(c => c.isNumber);
      if (numberCols) {
        items.value = data.items.map(item => {
          numberCols.forEach(col => {
            item[col.value] = item[col.value] !== '' ? item[col.value] * 1 : null;
          });
          return item;
        });
      } else {
        items.value = data.items;
      }
    }
  } catch (e) {
    const err = e.response?.data?.error || e.message;
    if (err.includes('Missing query param')) {
      info.value = err.replace('Missing query param', 'Please specify');
      err.split(': ')[1].split(', ').forEach(v => requiredVariables.value.add(v));
    } else {
      error.value = err;
    }
  }
  loading.value = false;
}

const rowFunction = computed(() => {
  return props.actions?.find(a => a.row);
});

function formatTitle(title) {
  return title
    .replace(/_/g, ' ')
    .replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
}

function itemsToCsv() {
  if (!items.value) return;

  let str = '';

  items.value.forEach(item => {
    for (let key in item) {
      if (/[, ]/.test(item[key])) {
        str += `"${item[key].replace(/"/g, '\\"')}",`;
      } else {
        str += item[key] + ',';
      }
    }
    str += '\r\n';
  });

  return str;
}

function exportCSVFile() {
  if (tableHeaders.value && items.value) {
    let csv = Object.values(tableHeaders.value)
      .map(h => h.text)
      .join(',');
    csv += '\r\n';
    csv += itemsToCsv();

    const exportedFilename = new Date().toISOString() + '.csv';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if ((navigator as any).msSaveBlob) {
      // IE 10+
      (navigator as any).msSaveBlob(blob, exportedFilename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', exportedFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}

// Replace {{variable}} placeholders in link with values from item
function getLinkForItem(link, item) {
  let linkWithValues = link;
  for (let key in item) {
    linkWithValues = linkWithValues.replace(new RegExp(`%${key}%`, 'g'), item[key]);
  }
  return linkWithValues;
}

function onRowClick({ item }) {  
  if (rowFunction.value) {
    onActionClick(rowFunction.value, item)
  }
}

function onActionClick(action, item) {
  if (action.filter) {
    action.filter.forEach(({ variable, value }) => {
      insights.setVariable(variable, value);
    });
  }
  if (action.link) {
    router.push(getLinkForItem(action.link, item));
  }
}
</script>

<template>
  <div class="sql-panel-container" :class="{ 'has-header': showHeader }">
    <div v-if="loading || error || info" class="center">
      <v-progress-circular v-if="loading" indeterminate />
      <v-notice v-else-if="info" type="info" center>{{ info }}</v-notice>
      <v-notice v-else type="danger" center>{{ error }}</v-notice>
    </div>

    <template v-else-if="tableHeaders && items">
      <v-button v-if="download" @click="exportCSVFile" icon secondary class="export-csv-button">
        <v-icon name="download-file" />
      </v-button>

      <FastTable
        :headers="tableHeaders"
        :items="items"
        @click:row="onRowClick"
        v-model:sort="sort.by"
        v-model:sortDesc="sort.desc"
        :rowClickable="!!rowFunction"
        fixed-header>
        <template v-if="actions?.find(a => !a.row)" #item-append="{ item }">
          <v-button
            outlined
            v-for="action in actions.filter(a => !a.row)"
            v-tooltip="action.label"
            @click="onActionClick(action, item)"
            :icon="!action.show_label"
            x-small>
            <v-icon :name="action.icon" />
            <span v-if="action.show_label">{{ action.label }}</span>
          </v-button>
        </template>
      </FastTable>
    </template>
  </div>
</template>

<style>
.sql-panel-container {
  width: 100%;
  height: 100%;
  --v-table-height: 100%;
}

.sql-panel-container .v-text-overflow {
  user-select: text;
  white-space: pre-wrap;
}
.sql-panel-container .center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.export-csv-button {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  opacity: 0.8;
}
.export-csv-button .button {
  border-radius: var(--border-radius) 0 0 0 !important;
}
</style>
