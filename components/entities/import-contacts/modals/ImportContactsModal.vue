<template>
  <base-modal
    ref="modal"
    :title="$t('profile.entities.import_contacts')"
    :loading="submit"
    :disabled="disabled"
    @done="submit = true"
  >
    <div class="flex flex-col space-y-4">
      <base-steps v-model="activeStep" v-bind="{ steps }" />
      <div>
        <component
          :is="activeStep"
          v-bind="{ ...workBookData, submit }"
          @change="changeStep"
          @disable="val => (disabled = val)"
          @done="done"
        />
      </div>
    </div>
  </base-modal>
</template>

<script>
export default {
  components: {
    ImportContactsFile: () => import('./orgainsms/ImportContactsFile'),
    MapContactFields: () => import('./orgainsms/MapContactFields')
  },
  data: () => ({
    activeStep: 'ImportContactsFile',
    disabled: true,
    steps: [
      { id: 'ImportContactsFile', title: 'Select File' },
      { id: 'MapContactFields', title: 'Map Fields' }
    ],
    submit: false,
    workBookData: null
  }),
  methods: {
    show () {
      this.$refs.modal.show()
    },
    changeStep ({ step, workBook, fileArray }) {
      this.activeStep = step
      this.workBookData = { workBook, fileArray }
      this.submit = false
    },
    done () {
      this.activeStep = 'ImportContactsFile'
      this.submit = false
      this.$refs.modal.hide()
    }
  }
}
</script>
