<template>
  <base-confirm-popup
    v-bind="{
      actions: [
        {
          text: $t('contract.confirmation.only_new'),
          handler: () => submit(false),
          bold: true,
        },
        {
          text: $t('global.all'),
          handler: () => submit(false),
          bold: true,
        },
      ],
      ref: 'confirm',
    }"
  >
    <div class="flex flex-col text-center max-w-xs space-y-3">
      <span class="text-sm">
        {{
          $t("contract.confirmation.text", {
            title: document && document.title,
          })
        }}
      </span>
    </div>
  </base-confirm-popup>
</template>

<script>
export default {
  data: () => ({
    document: null
  }),
  methods: {
    show (document) {
      this.document = document
      this.$refs.confirm.show()
    },
    submit (preApproval) {
      this.$emit('update', { ...this.document, preApproval })
      this.$refs.confirm.hide()
    }
  }
}
</script>
