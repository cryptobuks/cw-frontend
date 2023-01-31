<template>
  <div class="flex flex-col">
    <span class="font-bold text-xl">Map Fields</span>
    <span class="text-xs text-gray-200">
      Select the correct field type that match the fields in the file
    </span>

    <table>
      <thead class="border-b-2 border-white text-left">
        <th class="p-2 w-1/3">
          File Label
        </th>
        <th class="p-2">
          File Data
        </th>
        <th class="p-2 w-1/3">
          Map To
        </th>
      </thead>
      <tr
        v-for="(column, mapIndex) in mappedColumns"
        :key="`map-index-${mapIndex}`"
        class="border-b-2 border-white border-dashed"
      >
        <td class="p-2">
          {{ column.label }}
        </td>
        <td class="p-2">
          <span
            v-for="(item, itemIndex) in column.data.slice(0, 3)"
            :key="`item-${itemIndex}`"
            class="block"
          >{{ item }}</span>
        </td>
        <td class="p-2">
          <base-select
            v-model="column.field"
            label="Field Name"
            :items="fields"
            return-object
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    fileArray: { type: Array, required: true },
    submit: Boolean
  },
  data: () => ({
    fields: [
      'Name',
      'Surname',
      'Email',
      'Email 2',
      'Email 3',
      'Mobile',
      'Mobile 2',
      'Landline',
      'Landline 2',
      'PIN',
      'Gender',
      'Date of Birth',
      'Place of Birth',
      'Address',
      'Address - City',
      'Address - Country'
    ],
    mappedColumns: []
  }),
  watch: {
    fileArray: {
      immediate: true,
      deep: true,
      handler (fileArray) {
        if (fileArray.length < 1) {
          return
        }
        const rows = fileArray.slice(1, fileArray.length)
        this.mappedColumns = fileArray[0].map((column, index) => ({
          label: column,
          data: rows.map(row => row[index]),
          field: null
        }))
      }
    },
    async submit () {
      const columns = this.mappedColumns.filter(
        column => !!column.field && column.data.length > 0
      )
      const rows = []
      for (const column of columns) {
        for (const index in column.data) {
          const currentRow = rows[index] || {}
          currentRow[column.field] = column.data[index]
          rows[index] = currentRow
        }
      }
      const csvContent = this.$utils.jsonToCSV(rows)
      await this.$repos.contactsRepo.importContacts(csvContent)
      this.$notifier.success('Contacts Imported!')
      this.$emit('done')
    }
  }
}
</script>
