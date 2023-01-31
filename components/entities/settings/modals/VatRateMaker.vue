<template>
  <base-modal
    ref="modal"
    :title="$t('global.manage') + ' ' + (entityName || $t('entities.vat_rate'))"
    :loading="$nuxt.$loading.show"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model.number="entity.vat"
        type="number"
        tooltip="Enter the VAT rate, mandatory."
        label="VAT Rate"
        min="0"
        placeholder="VAT Rate"
        :rules="[rules.required, rules.min(0)]"
      />

      <base-textarea
        v-model="entity.shortDescription"
        tooltip="Enter a short label to associate to the VAT rate, optional."
        label="Short Description"
        placeholder="Short Description"
        :rules="[rules.maxLength(100)]"
      />
      <base-textarea
        v-model="entity.longDescription"
        tooltip="Enter the VAT description that need to be quoted in the invoice, optional."
        label="Long Description"
        placeholder="Long Description"
      />
    </base-form>
  </base-modal>
</template>

<script>
export default {
  data () {
    return {
      entity: {
        vat: null,
        shortDescription: '',
        longDescription: '',
        countryId: this.$route.params.id
      },

      entityName: null
    }
  },
  methods: {
    show (entity) {
      this.entityName = entity ? entity.text : null

      this.entity = this.$utils.extract(entity, {
        _id: undefined,
        vat: '',
        shortDescription: '',
        longDescription: '',
        countryId: this.$route.params.id
      })
      this.$refs.modal.show()
    },
    save () {
      this.$store.dispatch('country/mutateVatRate', this.entity).then((response) => {
        if (response.success) {
          this.$refs.modal.hide()
          this.$notifier.success(response.message)
        }
      })
    }
  }
}
</script>
