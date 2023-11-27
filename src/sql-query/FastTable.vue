<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { createSummary } from './useSummary.js';

const { t } = useI18n();

// A vue 3 component with v-model and sort
const props = defineProps({
  loading: Boolean,
  headers: {
    type: Array,
    validator: value => value.every(header => header.value && header.text),
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },

  sort: String,
  sortDesc: Boolean,
  fixedHeader: Boolean,
});

const search = ref('');
const searchable = computed(() => props.headers.filter(header => header.searchable));
const fiteredItems = computed(() => {
  const searchValue = search.value ? search.value.toLowerCase().trim() : '';
  return searchValue
    ? props.items.filter(item => {
        return searchable.value.some(header => {
          return item[header.value] && item[header.value].toLowerCase().includes(searchValue);
        });
      })
    : props.items;
});

const summary = computed(() => {
  const result = createSummary(fiteredItems.value, props.headers);
  return result;
});

// Emit change events
const $emit = defineEmits(['update:sort', 'update:sortDesc', 'click:row']);

function sortIt(header) {
  if (!header.sortable) return;

  $emit('update:sort', header.value);
  $emit('update:sortDesc', !props.sortDesc);
}
</script>

<template>
  <div class="sql-query-table">
    <table>
      <thead class="table-header" :class="{ fixed: fixedHeader }">
        <tr class="search" v-if="searchable.length && items.length > 10">
          <th colspan="80%">
            <v-input v-model="search" small trim class="search-input" rounded placeholder="Search">
              <template #prepend>
                <v-icon name="search" />
              </template>
            </v-input>
          </th>
        </tr>
        <tr class="headers">
          <th v-for="header in headers" :style="{minWidth: `${header.width || auto}ch`}" :key="header.value" @click="sortIt(header)" :align="header.align || 'left'">
            {{ header.text }}
            <v-icon
              v-if="header.sortable"
              name="sort"
              small
              class="sort-icon"
              :class="{ show: sort === header.value }"
              :style="`transform: ${
                sortDesc ? 'rotateZ(0deg) rotateY(0deg)' : 'rotateZ(180deg) rotateY(180deg)'
              }; transition: .2s all ease`" />
          </th>
          <th v-if="$slots['item-append']">#</th>
        </tr>
        <tr v-if="loading">
          <td :colspan="headers.length + 1">
            <v-progress-linear indeterminate />
          </td>
        </tr>
      </thead>
      <tbody v-if="!(loading || items.length)">
        <tr>
          <td colspan="100%">
            <v-card style="padding: 2rem; --v-card-max-width: 100%; margin: 2rem auto;">
              <v-card-title>
                <v-icon name="info" style="margin-right: 2rem" />
                {{ t('no_items') }}
              </v-card-title>
            </v-card>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <slot :items="fiteredItems">
          <tr v-for="item in fiteredItems" @click="$emit('click:row', { item, event: $event })">
            <td v-for="header in headers" :key="header.value" :class="`align-${header.align}`">
              {{ item[header.value] }}
            </td>
            <td v-if="$slots['item-append']" @click.stop>
              <slot name="item-append" :item="item" />
            </td>
          </tr>
        </slot>
        <!-- This is to fill up any remaining height in the table -->
        <tr><td style="height: 100%;"></td></tr>
      </tbody>
      <tfoot v-if="summary">
        <tr>
          <td v-for="col in headers" :key="col.value" v-tooltip="col.summarise">
            <code class="v-text-overflow" v-if="summary[col.value]">
              {{ summary[col.value] }}
            </code>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
:global(body) {
  --v-table-color: var(--v-input-color);
  --v-table-background-color: var(--v-input-background-color);
}

.sql-query-table {
  position: relative;
  height: var(--v-table-height);
  overflow-y: auto;

  --sqt-head--background: var(--background-normal, var(--theme--background));
  --sqt-head--color: color: var(--foreground-normal, var(--theme--foreground));

  --sqt-foot--background: var(--background-normal, var(--theme--background));
  --sqt-foot--color: color: var(--foreground-normal, var(--theme--foreground));
}

table {
  min-width: 100%;
  min-height: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  background-color: var(--v-table-background-color);
  color: var(--v-table-color);
}

table thead {
  background-color: var(--sqt-head--background);
  color: var(--sqt-head--color);
  border-bottom: var(--border-width) solid var(--v-input-border-color);
}

table thead.fixed {
  position: sticky;
  top: 0;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

table thead tr.headers th {
  padding: 8px;
  font-weight: bold;
  min-width: 3rem;
  background-color: var(--sqt-head--background);
  color: var(--sqt-head--color);
  border-bottom: var(--border-width) solid var(--v-input-border-color);
}

table tr.search th {
  padding: 0;
}

table tr.search th .search-input.v-input {
  margin: 0;
  border: none;
}

table th .sort-icon {
  opacity: 0;
}

table th:hover .sort-icon {
  opacity: 0.5;
}

table th .sort-icon.show {
  opacity: 1;
}

table th.select {
  width: 2rem;
}

table td {
  padding: 8px;
  align: middle;
  border-bottom: var(--border-width) solid var(--v-input-border-color);
}

table tbody {
  display: contents;
}

table tfoot tr {
  position: sticky;
  bottom: 0;
  background-color: var(--sqt-foot--background);
  color: var(--sqt-foot--color);
  box-shadow: var(--card-shadow);
}

table tfoot tr td {
  padding: 8px;
  height: 44px;
  font-weight: bold;
  background-color: var(--sqt-foot--background);
  color: var(--sqt-foot--color);
}
</style>
