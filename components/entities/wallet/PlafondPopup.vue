<template>
  <base-confirm-popup
    v-bind="{
      actions: [
        {
          icon: 'save',
          loading: submitting,
          handler: submit,
          bold: true,
        },
      ],
      ref: 'confirm',
    }"
  >
    <div class="flex flex-col text-center max-w-xs space-y-3">
      <span class="text-sm">
        {{ $t("wallet.set_plafond.title") }}
      </span>
      <base-input-text
        v-model.number="plafond"
        v-bind="{
          affix: '€',
          label: $t('wallet.plafond'),
          light: true,
          mask: '######',
          tooltip: $t('rentable.max_places.label'),
        }"
      />
    </div>
  </base-confirm-popup>
</template>

<script>
export default {
  data: () => ({
    plafond: 0,
    submitting: false
  }),
  methods: {
    show (plafond = 0) {
      this.plafond = plafond
      this.$refs.confirm.show()
    },
    async submit () {
      this.submitting = true
      await this.$repos.financeRepoo.setPlafond(
        this.plafond,
        this.$dayjs().add(30, 'day').format('YYYY-MM-DD')
      )
      this.submitting = false
      this.$notifier.success(this.$t('global.success'))
      this.$emit('updated')
      this.$refs.confirm.hide()
    }
  }
}
</script>
