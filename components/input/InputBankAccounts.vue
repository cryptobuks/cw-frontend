<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="value"
    :label="isGymUnit ? $t('input.banks.label.unit') : $attrs.label || $t('input.banks.label')"
    :tooltip="isGymUnit ? $t('input.banks.tooltip.unit') : $attrs.tooltip || $t('input.banks.tooltip')"
    v-on="isGymUnit ? {} : { 'add-item': () => showModal() }"
  >
    <cw-bank-maker
      v-if="!isGymUnit"
      ref="modal"
      @done="onMakerDone"
    />

    <template #item="{ item, index }">
      <cw-bank-swipe-card
        :bank="item"
        :hide-actions="isGymUnit"
        @remove="remove(item)"
        @edit="showModal(item)"
      >
        <template v-if="isGymUnit" #title-append>
          <base-checkbox
            :checked="!!item.isActive"
            class="float-right"
            @change="toggleBank(item, index)"
            @focus="onCheckboxFocus"
            @blur="onCheckboxBlur"
          />
        </template>
      </cw-bank-swipe-card>
    </template>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    countryCode: { type: String, default: '' },
    profile: { type: Object, default: null }
  },
  data () {
    return {
      tmpBankIndex: -1
    }
  },
  computed: {
    isGymUnit () {
      return ['CU', 'GU'].includes(this.profile?.typeCode)
    }
  },
  methods: {
    async showModal (entity = null) {
      this.tmpBankIndex = this.value.indexOf(entity)

      this.$refs.modal.show(entity || {
        countryCode: this.countryCode || await this.$repos.countryRepo.getMyCountryCode()
      })
    },

    remove (item) {
      this.$confirm(this.$t('input.banks.confirm_remove'), async () => {
        if (this.profile?._id && item._id) {
          await this.$repos.profileRepo.removeBank(item._id, this.profile._id)
        }
        this.value.splice(this.value.indexOf(item), 1)
      })
    },

    async onMakerDone (bank) {
      const newBank = this.profile?._id
        ? await this.$repos.profileRepo.mutateBank(bank, this.profile._id)
        : bank

      if (this.tmpBankIndex !== -1) {
        this.value.splice(this.tmpBankIndex, 1, newBank)
      } else {
        this.value.push(newBank)
      }

      this.$attrs.listeners?.validated?.()
    },

    toggleBank (bank, index) {
      const newBank = { ...bank, isActive: !bank.isActive }
      this.value.splice(index, 1, newBank)
      if (this.profile?._id) {
        this.$repos.profileRepo.mutateBank(newBank, this.profile._id)
      }
    },

    onCheckboxFocus () {
      // Clear onCheckboxBlur call
      this.$utils.debounce()
    },

    onCheckboxBlur () {
      this.$utils.debounce(() => {
        this.$attrs.listeners?.validated?.()
      }, 50)
    }
  }
}
</script>
