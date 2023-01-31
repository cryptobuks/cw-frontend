<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${systemName}`"
    :loading="submitting"
    @hide="reset"
    @done="submit"
  >
    <slot name="top" />

    <base-form v-slot="{ rules }" @submit.prevent>
      <base-progressive-fields-container
        v-bind="{ fields, showAllFields: !!paymentSystem._id }"
      >
        <template #name="{ inputAttrs }">
          <base-input-text
            v-model="paymentSystem.name"
            v-bind="{
              ...inputAttrs,
              rules: [rules.required],
              tooltip: $t('payment_systems.name.tooltip'),
              label: $t('global.name'),
              placeholder: $t('payment_systems.name.placeholder')
            }"
          />
        </template>

        <template v-if="paymentSystem.settings" #type="{ inputAttrs }">
          <base-select
            v-model="paymentSystem.settings.type"
            v-bind="{
              ...inputAttrs,
              items: types.map((type) => $t(type)),
              tooltip: $t('payment_systems.type.tooltip'),
              label: $t('global.type'),
              placeholder: $t('payment_systems.type.placeholder')
            }"
            return-object
          />
        </template>

        <template #activeOnline>
          <div class="flex items-center justify-between">
            <span class="font-poppins-medium uppercase">
              {{ $t('payment_systems.active_online') }}
            </span>
            <base-switcher
              v-model="paymentSystem.active"
              v-bind="{
                trueColor: 'green',
                falseColor: 'red',
                trueText: $t('global.yes'),
                falseText: $t('global.no')
              }"
              class="w-24 ml-6 mt-3"
            />
          </div>
        </template>
      </base-progressive-fields-container>
    </base-form>
  </base-modal>
</template>

<script>
import _ from 'lodash'

export default {
  data: () => ({
    fields: [
      { name: 'name', required: true },
      { name: 'type', required: false },
      { name: 'activeOnline', required: false }
    ],
    paymentSystem: {
      name: null,
      gateway: 'viva',
      settings: { type: null },
      active: true
    },
    submitting: false,
    types: ['payment_systems.types.not_integrated']
  }),
  computed: {
    systemName () {
      return this.paymentSystem.name
        ? this.paymentSystem.name
        : this.$t('payment_systems.title')
    }
  },
  methods: {
    reset () {
      Object.assign(this.$data, this.$options.data.call(this))
    },
    show (system) {
      if (system) {
        this.paymentSystem = _.cloneDeep(system)
      }
      this.$refs.modal.show()
    },
    async submit () {
      this.submitting = true
      await this.$repos.financeRepo.mutatePaymentConfig(this.paymentSystem)
      this.submitting = false
      this.reset()
      this.$refs.modal.hide()
      this.$emit('done')
    }
  }
}
</script>

<style>
</style>
