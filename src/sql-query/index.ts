import { definePanel } from '@directus/extensions-sdk';
import PanelComponent from './panel.vue';

export default definePanel({
	id: 'sql-query',
  name: 'SQL Query panel',
  icon: 'view_list',
  description: 'Show result of a stored SQL query as a table',
  component: PanelComponent,
  options: [
    {
      field: 'sql',
      name: 'SQL query',
      type: 'string',
      meta: {
        note: "Supports variables in the format of {{variable_name}}. Don't quote string variables",
        interface: 'input-code',
        width: 'full',
        options: {
          language: 'sql',
        },
      },
    },
    {
      field: 'columns',
      name: 'Columns',
      type: 'json',
      special: 'cast-json',
      meta: {
        width: 'full',
        interface: 'list',
        options: {
          addLabel: 'Add column',
          label: '{{name}} - {{width}}',
          fields: [
            {
              field: 'value',
              name: 'Column Name',
              type: 'string',
              note: 'As returned by query',
              meta: {
                required: true,
                width: 'half',
                interface: 'input',
                options: {
                  trim: true,
                  softLength: 100,
                },
              },
            },
            {
              field: 'text',
              name: 'Label',
              type: 'string',
              note: 'What to display in the column header (Default is same as name)',
              meta: {
                width: 'half',
                interface: 'input',
                options: {
                  trim: true,
                  softLength: 100,
                },
              },
            },
            {
              field: 'width',
              name: 'Width',
              type: 'integer',
              meta: {
                required: true,
                width: 'half',
                interface: 'input',
                options: {
                  min: 40,
                  max: 400,
                },
              },
              schema: {
                default_value: 100,
              },
            },
            {
              field: 'isNumber',
              name: 'Is Numberic',
              type: 'boolean',
              meta: {
                width: 'half',
                interface: 'boolean',
              },
            },
            {
              field: 'sortable',
              name: 'Sortable',
              type: 'boolean',
              meta: {
                width: 'half',
                interface: 'boolean',
              },
            },
            {
              field: 'searchable',
              name: 'Searchable',
              type: 'boolean',
              meta: {
                width: 'half',
                interface: 'boolean',
              },
            },
            {
              field: 'summarise',
              name: 'Summarise',
              type: 'string',
              meta: {
                width: 'half',
                interface: 'select-dropdown',
                options: {
                  choices: [
                    { text: 'Sum', value: 'sum' },
                    { text: 'Average', value: 'avg' },
                    { text: 'Count', value: 'count' },
                    { text: 'Count Unique', value: 'count_unique' },
                    { text: 'Count Groups', value: 'count_groups' },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      field: 'download',
      name: 'Download button',
      type: 'boolean',
      meta: {
        width: 'half',
        interface: 'boolean',
        options: {
          label: 'Show',
        },
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'is_static',
      name: 'Is static',
      type: 'boolean',
      meta: {
        width: 'half',
        interface: 'boolean',
        options: {
          label: 'Yes',
        },
        note: 'If the result will not be affect when variables are changed, you can check this box to improve performance.',
      },
      schema: {
        default_value: false,
      },
    },
    {
      field: 'actions',
      name: 'Actions',
      type: 'json',
      special: 'cast-json',
      meta: {
        width: 'full',
        interface: 'list',
        options: {
          addLabel: 'Add action',
          label: '{{{label}}',
          fields: [
            {
              field: 'label',
              name: 'Label',
              type: 'string',
              meta: {
                required: true,
                width: 'half',
                interface: 'input',
                options: {
                  trim: true,
                  softLength: 50,
                },
              },
            },
            {
              field: 'link',
              name: 'Link',
              type: 'string',
              meta: {
                required: true,
                note: 'Variables per row can be inserted as such %column_name%',
                width: 'half',
                interface: 'input',
                options: {
                  trim: true,
                },
              },
            },
            {
              field: 'row',
              name: 'Activate on row click',
              type: 'boolean',
              meta: {
                note: "If you don't want to show the action button, but want to activate the link on row click, check this box.",
                width: 'full',
                interface: 'boolean',
              },
            },
            {
              field: 'icon',
              name: 'Icon',
              type: 'string',
              meta: {
                note: 'Leave blank to not show an icon',
                width: 'half',
                interface: 'select-icon',
              },
            },
            {
              field: 'show_label',
              name: 'Show label',
              type: 'boolean',
              meta: {
                width: 'half',
                interface: 'boolean',
              },
            },
          ],
        },
      },
    },
  ],
  minWidth: 10,
  minHeight: 10,
});
