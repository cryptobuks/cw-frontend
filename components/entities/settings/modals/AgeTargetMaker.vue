<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${entityName || $t('entities.age_target')}`"
    :loading="$nuxt.$loading.show"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model.number="entity.age"
        :rules="[rules.required]"
        :label="area ? area.title : null"
        type="number"
        min="0"
        step="1"
        onkeyup="this.value < 0 ? this.value = this.value * -1 : ''"
        placeholder="Age"
      />
    </base-form>
  </base-modal>
</template>

<script>
export default {
  data () {
    return {
      entityName: null,
      entity: {
        countryId: this.$route.params.id
      },
      area: null
    }
  },
  methods: {
    show ({ area = null, item = null, name = null }) {
      this.entityName = name
      this.area = area

      this.entity = this.$utils.extract(item, {
        _id: undefined,
        countryId: this.$route.params.id,
        area: area ? area.name : null,
        age: null
      })

      this.$refs.modal.show()
    },
    async save () {
      await this.$confirm(`Are you sure to update ${this.area.title} to ${this.entity.age} ?`)
        .then(() => {
          this.$store.dispatch('country/mutateAgeTarget', this.entity).then((response) => {
            if (response.success) {
              this.$emit('save')
              this.$notifier.success(response.message)
            }
          })
        })

      this.$refs.modal.hide()
    }
  }
}
</script>
