<template>
  <div class="flex flex-col">
    <span class="font-bold text-xl mb-2">{{ $t("input.select_file") }}</span>
    <div class="text-sm">
      <p>{{ $t("input.allowed_files", { allowed: "XLS or CSV" }) }}</p>
      {{ $t("import_contacts.verify_that") }}:
      <ul class="ml-5">
        <li
          v-for="(rule, rulesIndex) in fileImportRules"
          :key="`file-import-rule-${rulesIndex}`"
          class="list-disc"
        >
          {{ $t(rule) }}
        </li>
      </ul>
    </div>
    <base-input-file v-model="file" accept=".csv" class="mt-6 w-24 outl">
      <div
        v-if="!file"
        class="rounded-lg focus:outline-none h-24 w-24 border-dashed border-4 flex items-center justify-center"
      >
        <base-icon name="add" size="40" />
      </div>
      <div v-else class="flex flex-col items-center space-y-2">
        <div class="flex">
          <base-icon class="text-white" name="file" size="60" />
          <button
            class="bg-gray-600 text-white h-4 w-4 rounded-full flex items-center justify-center focus:outline-none -mt-3"
            @click="file = null"
          >
            <base-icon name="dismiss" size="5" />
          </button>
        </div>
        <span class="text-xs">{{ file.name }}</span>
      </div>
    </base-input-file>

    <div v-if="file" class="flex flex-col mt-6 space-y-2">
      <span class="font-bold text-xl">File preview</span>
      <span class="text-xs text-gray-200">{{
        $t("import_contacts.file_data", {
          name: file.name,
          rows: rows.length,
          columns: columns.length,
        })
      }}</span>
      <div class="max-w-3xl overflow-x-scroll">
        <table v-if="fileArray.length > 0">
          <thead class="bg-white bg-opacity-50">
            <th
              v-for="(column, columnIndex) in columns"
              :key="`column-${columnIndex}`"
              class="border-white border"
            >
              {{ column }}
            </th>
          </thead>
          <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`">
            <td
              v-for="(cell, cellIndex) in row"
              :key="`row-${rowIndex}-cell-${cellIndex}`"
              class="p-4 w-20 border-white border"
            >
              {{ cell }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: { submit: Boolean },
  data: () => ({
    file: null,
    fileArray: [],
    size: 10,
    fileImportRules: [
      'import_contacts.rules.field_seperator',
      'import_contacts.rules.field_label'
    ]
  }),
  computed: {
    columns () {
      if (this.fileArray.length < 1) {
        return []
      }
      return this.fileArray[0]
    },
    rows () {
      if (this.fileArray.length < 1) {
        return []
      }
      return this.fileArray.slice(1, this.size)
    }
  },
  watch: {
    file: {
      deep: true,
      async handler (file) {
        if (!file) {
          this.$emit('disable', true)
          return
        }
        this.fileArray = await this.$utils
          .readFile(file)
          .then(fileContent => this.$utils.csvToArray(fileContent))
        this.$emit('disable', false)
      }
    },
    submit () {
      this.$emit('change', {
        fileArray: this.fileArray,
        step: 'MapContactFields'
      })
    }
  }
}
</script>
