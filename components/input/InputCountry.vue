<template>
  <base-select
    v-bind="$attrs"
    class="cw-input-country"
    :class="{ focused, 'auto-shrink': autoShrink }"
    :items="filteredCountries"
    :item-text="autoShrink && !focused ? item => item && item.code.toUpperCase() : 'name'"
    item-value="code"
    searchable
    hide-error
    no-validate-on-blur
    select-on-blur
    :clearable="focused || !autoShrink"
    :sort="(a, b) => a.name > b.name ? 1 : -1"
    :get-item-searched-text="item => item.name + ' ' + item.prefix"
    :tabindex="$attrs.value ? -1 : ($attrs.tabindex || 0)"
    :auto-select="autoSelectCountryHandler"
    @focus="focused = true"
    v-on="{
      ...$listeners,
      blur: onBlur
    }"
  >
    <template #item="{ item }">
      <div class="cw-input-country__option">
        <img v-lazy="`/images/flag/${item.code}.svg`" class="cw-input-country__flag">

        <span v-auto-resize-text class="cw-input-country__name">{{ item.name }}</span>

        <span class="cw-input-country__prefix">{{ item.prefix }}</span>
      </div>
    </template>
  </base-select>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    excepts: { type: Array, default: () => [] },
    autoShrink: Boolean,
    managedCountriesOnly: Boolean
  },
  data () {
    return {
      focused: false
    }
  },
  computed: {
    ...mapGetters('country', ['localizedCountries', 'managedCountriesCode']),
    filteredCountries () {
      const managedCountriesCode = this.managedCountriesOnly &&
        (
          this.$auth.user.typeCode === 'CH'
            ? this.managedCountriesCode
            : this.$auth.user?.managedCountries?.map?.(m => m.countryCode)
        )
      const countries = managedCountriesCode
        ? this.localizedCountries.filter(c => managedCountriesCode.includes(c.code))
        : this.localizedCountries
      return this.excepts.length
        ? countries.filter(c => !this.excepts.includes(c.code))
        : countries
    }
  },
  created () {
    if (!this.countries) {
      this.getCountries()
    }
  },
  methods: {
    ...mapActions('country', ['getCountries']),

    onBlur () {
      setTimeout(() => {
        if (document.activeElement && !this.$el.contains(document.activeElement)) {
          this.focused = false
          this.$emit('blur')
        }
      }, 150)
    },

    autoSelectCountryHandler (item, searchText) {
      return item &&
        (
          item.name.toLowerCase() === searchText ||
          item.prefix === searchText ||
          item.prefix.slice(1) === searchText
        )
    }
  }
}
</script>

<style lang="scss">
.cw-input-country {
  &.auto-shrink {
    width: 64px;
    transition: width .3s;

    &.focused {
      width: 150px;

      input:not([readonly]) {
        text-transform: none;
      }
    }

    input {
      text-transform: uppercase;
    }
  }

  &__option {
    display: flex;
    align-items: center;
    padding: 5px 10px;
  }

  &__flag {
    flex-shrink: 0;
    width: 20px;
    margin-right: 15px;
  }

  &__name {
    white-space: nowrap;
    margin-right: 6px;
    display: block;
  }

  &__prefix {
    flex-shrink: 0;
    opacity: .7;
    margin-left: auto;
    font-size: 13px;
  }
}
</style>
