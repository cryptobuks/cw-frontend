<template>
  <base-input-autocomplete
    ref="input"
    v-model="vatId"
    v-bind="$attrs"
    :debounce-duration="300"
    :item-text="vat => vat && vat.value"
    :items="suggestedGyms"
    :placeholder="$attrs.placeholder || $t('input.vat.placeholder')"
    :validation-value="value"
    :rules="{
      syntax: checkSyntax,
      unique: checkUnique,
      typeCode: checkTypeCode,
      ...$attrs.rules
    }"
    input-class="uppercase"
    v-on="$utils.except($listeners, 'input')"
    @search="search"
    @item-select="onProfileSelected"
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

    <template #item-text="{ item }">
      <span class="px-2 py-1">
        {{
          [item.vat && (item.vat.countryCode.toUpperCase() + item.vat.value), item.name]
            .filter(Boolean)
            .join(' – ')
        }}
      </span>
    </template>

    <template #error:typeCode="{ message: gymName }">
      {{
        $t("gym.validation.profile_type", {
          field: $t("gym.vat.label"),
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
  </base-input-autocomplete>
</template>

<script>
import { checkVAT, countries } from 'jsvat'
export default {
  inheritAttrs: false,
  props: {
    value: { type: Object, default: () => ({}) },
    defaultCountryCode: { type: String, default: null },
    // If (!!profile._id) vat must be unique otherwise enable the suggestions
    unique: Boolean,
    typeCodes: { type: Array, default: () => ['CO', 'GY'] }
  },
  data () {
    return {
      suggestedGyms: [],
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
          value: this.vatId || null
        })
      }
    },
    vatId: {
      get () {
        return this.value?.value || ''
      },
      set (value) {
        this.$emit('input', {
          ...this.value,
          value
        })
      }
    },
    selectedCountry () {
      const { countryCode } = this.value || {}
      return countryCode && countries.find(c => c.codes[0].toLowerCase() === countryCode)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (!v) {
          this.$emit('input', {
            countryCode: this.defaultCountryCode,
            key: 'vat',
            value: null
          })
        } else if (!v.countryCode && this.defaultCountryCode) {
          Object.assign(this.value, { countryCode: this.defaultCountryCode })
        }
      }
    },

    defaultCountryCode: {
      immediate: true,
      handler (countryCode) {
        if (countryCode && !this.vatId) {
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

    checkSyntax (vat) {
      const { countryCode, value } = vat || {}
      return !value || !countryCode || !this.selectedCountry || checkVAT(countryCode + value, [this.selectedCountry]).isValid || this.$t('input.vat.validation.syntax')
    },

    async checkUnique (vat) {
      return !this.unique ||
        !vat?.countryCode ||
        !vat.value ||
          await this.$repos.profileRepo.checkVatUniqueness(vat) ||
          this.$t('input.vat.validation.unique')
    },

    async checkTypeCode (vat) {
      return this.unique ||
        !this.typeCodes?.length ||
        !vat?.value ||
        !vat.countryCode ||
        await this.$repos.profileRepo.getCompanyByVat(vat).then((profile) => {
          if (profile) {
            if (!this.typeCodes.includes(profile.typeCode)) {
              return profile.displayName
            }
            this.$emit('existed-profile', profile)
          }
          return true
        })
    },

    async search (keyword) {
      if (!this.unique && keyword && keyword.length >= 3) {
        this.suggestedGyms = await this.$repos.profileRepo.searchCompaniesByVat({ countryCode: this.countryCode, value: keyword })
          .then(profiles => profiles.filter(p => this.typeCodes.includes(p.typeCode)))
      } else {
        this.suggestedGyms = []
      }
    },

    async onProfileSelected (profile) {
      this.suggestedGyms = []
      const detailedProfile = await this.$repos.profileRepo.getGymById(profile._id)
      detailedProfile && this.$emit('existed-profile', detailedProfile)
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
