import { type PanelConfig } from '@directus/extensions';
import PanelComponent from './panel.vue';

const columnFields = [
  {
    field: "value",
    name: "Column Name",
    type: "string",
    note: "As returned by query",
    meta: {
      required: true,
      width: "half",
      interface: "input",
      options: {
        trim: true,
        softLength: 100,
      },
    },
  },
  {
    field: "text",
    name: "Label",
    type: "string",
    note: "What to display in the column header (Default is same as name)",
    meta: {
      width: "half",
      interface: "input",
      options: {
        trim: true,
        softLength: 100,
      },
    },
  },
  {
    field: "width",
    name: "Width",
    type: "integer",
    meta: {
      required: true,
      width: "half",
      interface: "input",
      options: {
        min: 1,
        max: 300,
      },
      note: "Width of the column in ch (character width). Default is 10.",
    },
    schema: {
      default_value: 10,
    },
  },
  {
    field: "alignment",
    name: "Alignment",
    type: "string",
    meta: {
      width: "half",
      interface: "select-dropdown",
      options: {
        choices: [
          { text: "Left", value: "left" },
          { text: "Center", value: "center" },
          { text: "Right", value: "right" },
        ],
      },
    },
    schema: {
      default_value: "left",
    },
  },
  {
    field: "isNumber",
    name: "Is Numeric",
    type: "boolean",
    meta: {
      width: "half",
      interface: "boolean",
    },
  },
  {
    field: "sortable",
    name: "Sortable",
    type: "boolean",
    meta: {
      width: "half",
      interface: "boolean",
    },
  },
  {
    field: "searchable",
    name: "Searchable",
    type: "boolean",
    meta: {
      width: "half",
      interface: "boolean",
    },
  },
  {
    field: "summarise",
    name: "Summarise",
    type: "string",
    meta: {
      width: "half",
      interface: "select-dropdown",
      options: {
        choices: [
          { text: "Sum", value: "sum" },
          { text: "Average", value: "avg" },
          { text: "Count", value: "count" },
          { text: "Count Unique", value: "count_unique" },
          { text: "Count Groups", value: "count_groups" },
        ],
      },
    },
  },
];

const actionFields = [
  {
    field: "label",
    name: "Label",
    type: "string",
    meta: {
      required: true,
      width: "half",
      interface: "input",
      options: {
        trim: true,
        softLength: 50,
      },
    },
  },
  {
    field: "row",
    name: "Activate on row click",
    type: "boolean",
    meta: {
      note: "If you don't want to show the action button, but want to activate the action on row click",
      width: "half",
      interface: "boolean",
    },
  },
  {
    field: "link",
    name: "Goto Link",
    type: "string",
    meta: {
      note: "Variables per row can be inserted as such %column_name%",
      width: "half",
      interface: "input",
      options: {
        trim: true,
      },
    },
  },
  {
    field: "filter",
    name: "Set Variables",
    type: "json",
    meta: {
      note: "Change dashboard variables based on the values of an item",
      width: "half",
      interface: "list",
      options: {
        fields: [
          {
            field: "variable",
            name: "variable",
            type: "string",
            meta: {
              type: "string",
              field: "variable",
              width: "half",
              display: "formatted-value",
              options: { trim: true },
              required: true,
              interface: "input"
            },
          },
          {
            field: "value",
            name: "value",
            type: "string",
            meta: {
              note: "A raw value or use %column_name% to use values from the row",
              type: "string",
              field: "value",
              width: "half",
              options: { trim: true },
              required: true,
              interface: "input"
            },
          },
        ],
      },
    },
  },
  {
    field: "icon",
    name: "Icon",
    type: "string",
    meta: {
      note: "Leave blank to not show an icon",
      width: "half",
      interface: "select-icon",
    },
  },
  {
    field: "show_label",
    name: "Show label",
    type: "boolean",
    meta: {
      width: "half",
      interface: "boolean",
    },
  },
];

const panel: PanelConfig = {
  id: "sql-query",
  name: "SQL Query panel",
  icon: "view_list",
  description: "Show result of a stored SQL query as a table, single value, or pie chart",
  component: PanelComponent,
  skipUndefinedKeys: ['sql', 'display_mode'],
  options: (panel) => {
    const displayMode = (panel as { options?: Record<string, string> } | undefined)?.options?.display_mode || 'table';
    const isTable = displayMode === 'table';
    const isSingleValue = displayMode === 'single_value';
    const isPieChart = displayMode === 'pie_chart';

    return [
      {
        field: "sql",
        name: "SQL query",
        type: "string",
        meta: {
          note: "Supports variables in the format of {{variable_name}}. Don't quote string variables. Example: SELECT * FROM tasks WHERE list = {{list}} AND status IN ({{status}})",
          interface: "input-code",
          width: "full",
          options: {
            language: "sql",
          },
        },
      },
      {
        field: "display_mode",
        name: "Display mode",
        type: "string",
        meta: {
          width: "full",
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Table", value: "table" },
              { text: "Single value", value: "single_value" },
              { text: "Pie chart", value: "pie_chart" },
            ],
          },
        },
        schema: {
          default_value: "table",
        },
      },
      ...(isTable ? [{
        field: "columns",
        name: "Columns",
        type: "json",
        meta: {
          width: "full",
          interface: "list",
          options: {
            addLabel: "Add column",
            label: "{{name}} - {{width}}",
            fields: columnFields,
          },
        },
      }] : []),
      ...(isSingleValue ? [
        {
          field: "value_layout",
          name: "Value layout",
          type: "string",
          meta: {
            width: "half",
            interface: "select-dropdown",
            options: {
              choices: [
                { text: "Single", value: "single" },
                { text: "Multiple", value: "multiple" },
              ],
            },
          },
          schema: {
            default_value: "single",
          },
        },
        {
          field: "value_column",
          name: "Value column",
          type: "string",
          meta: {
            required: true,
            width: "half",
            interface: "input",
            note: "Column name as returned by the query. Supports text and numbers.",
            options: {
              trim: true,
            },
          },
          schema: {
            default_value: "value",
          },
        },
        {
          field: "value_label_column",
          name: "Label column",
          type: "string",
          meta: {
            width: "half",
            interface: "input",
            note: "Optional column for labels. In multiple layout, each row shows label | value.",
            options: {
              trim: true,
            },
          },
        },
        {
          field: "value_size",
          name: "Value size",
          type: "string",
          meta: {
            width: "half",
            interface: "select-dropdown",
            options: {
              choices: [
                { text: "Small", value: "sm" },
                { text: "Medium", value: "md" },
                { text: "Large", value: "lg" },
                { text: "Extra large", value: "xl" },
              ],
            },
          },
          schema: {
            default_value: "lg",
          },
        },
        {
          field: "value_format",
          name: "Value format",
          type: "string",
          meta: {
            width: "half",
            interface: "select-dropdown",
            options: {
              choices: [
                { text: "Auto", value: "auto" },
                { text: "Number", value: "number" },
                { text: "Percent", value: "percent" },
              ],
            },
          },
          schema: {
            default_value: "auto",
          },
        },
      ] : []),
      ...(isPieChart ? [
        {
          field: "pie_value_column",
          name: "Pie value column",
          type: "string",
          meta: {
            required: true,
            width: "half",
            interface: "input",
            note: "Numeric column used for slice sizes.",
            options: {
              trim: true,
            },
          },
        },
        {
          field: "pie_label_column",
          name: "Pie label column",
          type: "string",
          meta: {
            width: "half",
            interface: "input",
            note: "Optional column for legend labels. Defaults to Slice 1, Slice 2, etc.",
            options: {
              trim: true,
            },
          },
        },
        {
          field: "pie_show_legend",
          name: "Show legend",
          type: "boolean",
          meta: {
            width: "half",
            interface: "boolean",
            options: {
              label: "Show",
            },
          },
          schema: {
            default_value: true,
          },
        },
        {
          field: "pie_show_values",
          name: "Show percentages",
          type: "boolean",
          meta: {
            width: "half",
            interface: "boolean",
            options: {
              label: "Show",
            },
          },
          schema: {
            default_value: true,
          },
        },
      ] : []),
      ...(isTable ? [
        {
          field: "actions",
          name: "Actions",
          type: "json",
          meta: {
            width: "full",
            interface: "list",
            options: {
              addLabel: "Add action",
              label: "{{{label}}",
              fields: actionFields,
            },
          },
        },
        {
          field: "download",
          name: "Download button",
          type: "boolean",
          meta: {
            width: "half",
            interface: "boolean",
            options: {
              label: "Show",
            },
          },
          schema: {
            default_value: true,
          },
        },
      ] : []),
      {
        field: "is_static",
        name: "Is static",
        type: "boolean",
        meta: {
          width: "half",
          interface: "boolean",
          options: {
            label: "Yes",
          },
          note: "If the result will not be affect when variables are changed, you can check this box to improve performance.",
        },
        schema: {
          default_value: false,
        },
      },
      {
        field: "cache",
        name: "Cache Response",
        type: "integer",
        meta: {
          width: "half",
          interface: "input",
          options: {
            min: 10,
            max: 3600,
          },
          note: "Tells the browser how long to cache results for. Default is 30 seconds.",
        },
        schema: {
          default_value: 300,
        },
      },
      {
        field: "allow_refresh",
        name: "Allow refresh",
        type: "boolean",
        meta: {
          width: "half",
          interface: "boolean",
          note: "Allow the user to bypass the cache and fetch a fresh result"
        },
        schema: {
          default_value: false,
        },
      },
    ];
  },
  minWidth: 10,
  minHeight: 10,
};

export default panel;
