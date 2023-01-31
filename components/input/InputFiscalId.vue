<template>
  <base-input-text
    ref="input"
    v-model="fiscalId"
    v-bind="$attrs"
    :validation-value="value"
    :rules="{
      syntax: checkSyntax,
      unique: checkUnique,
      typeCode: checkTypeCode,
      ...$attrs.rules
    }"
    input-class="uppercase"
    v-on="$utils.except($listeners, 'input')"
  >
    <template #prepend>
      <cw-input-country
        v-model="countryCode"
        auto-shrink
        managed-countries-only
        :tabindex="countryCode ? -1 : $attrs.tabindex"
        @focus="onCountryCodeFocus"
        @blur="onCountryCodeBlur"
        @input="onCountryCodeChange"
      />
    </template>

    <template #error:typeCode="{ message: gymName }">
      {{
        $t("gym.validation.profile_type", {
          field: $t("gym.fiscal.label"),
        })
      }}.
      <template v-if="!contactedGymNames.includes(gymName)">
        {{ $t("gym.validation.unique_confirm_before") }}
        <span
          class="text-white underline cursor-pointer uppercase"
          @click="contactSupport(gymName)"
        >
          {{ $t("global.here") }}
        </span>
        {{ $t("gym.validation.unique_confirm_after") }}
      </template>
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-text>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Object, default: () => ({}) },
    defaultCountryCode: { type: String, default: null },
    unique: Boolean,
    typeCodes: { type: Array, default: () => [] }
  },
  data () {
    return {
      contactedGymNames: []
    }
  },
  computed: {
    countryCode: {
      get () {
        return this.value?.countryCode || null
      },
      set (countryCode) {
        this.$emit('input', {
          countryCode,
          value: this.fiscalId || null
        })
      }
    },
    fiscalId: {
      get () {
        return this.value?.value || ''
      },
      set (value) {
        this.$emit('input', {
          ...this.value,
          value
        })
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (!v) {
          this.$emit('input', {
            countryCode: this.defaultCountryCode,
            key: 'fiscal',
            value: null
          })
        } else if (!v.countryCode && this.defaultCountryCode) {
          Object.assign(v, { countryCode: this.defaultCountryCode })
        }
      }
    },

    defaultCountryCode: {
      immediate: true,
      handler (countryCode) {
        if (countryCode && !this.fiscalId) {
          this.countryCode = countryCode
        }
      }
    }
  },
  methods: {
    onCountryCodeFocus () {
      this.$attrs.listeners?.focus?.()
    },

    onCountryCodeBlur () {
      if (!this.value.countryCode && (!document.activeElement || !this.$el.contains(document.activeElement))) {
        this.$refs.input.validate()
      }
    },

    onCountryCodeChange () {
      setTimeout(() => this.$refs.input?.focus())
    },

    // Example MWTMNU91D08F205Y
    checkSyntax (fiscal) {
      const { countryCode, value } = fiscal || {}
      return !value || !countryCode || /^\d{8,11}$/.test(value) || this.$t('input.fiscal.validation.syntax')
    },

    async checkUnique (fiscal) {
      return !this.unique ||
        !fiscal?.countryCode ||
        !fiscal.value ||
          await this.$repos.profileRepo.checkFiscalUniqueness(fiscal) ||
          this.$t('input.fiscal.validation.unique')
    },

    async checkTypeCode (fiscal) {
      return this.unique ||
        !this.typeCodes?.length ||
        !fiscal?.value ||
        !fiscal.countryCode ||
        await this.$repos.profileRepo.getCompanyByFiscal(fiscal).then((profile) => {
          if (profile) {
            if (!this.typeCodes.includes(profile.typeCode)) {
              return profile.displayName
            }
            this.$emit('existed-profile', profile)
          }
          return true
        })
    },

    contactSupport (gymName) {
      this.contactedGymNames.push(gymName)

      this.$repos.profileRepo.contactSupport({
        message: `The following existing Company Profile "${gymName}" can not become a GYM. Can you please fix this issue and reply`
      })
    }
  }
}
</script>
