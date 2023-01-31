<template>
  <base-input-text
    ref="input"
    v-model="tmp.fulladdress"
    input-class="cw-input-address"
    no-validate-on-blur
    v-bind="$attrs"
    :rules="patchedRules"
    :validation-value="value"
    :placeholder="$attrs.placeholder || (cityOnly ? null : tmp.type && $t('input.address.placeholder', { type: $t(tmp.type) }))"
    :listeners="$utils.except($attrs.listeners, ['validated', 'blur'])"
    aria-autocomplete="list"
    role="listbox"
    v-on="$utils.except($listeners, ['validated', 'input', 'blur'])"
    @focus="onFullAddressFocus"
    @blur="onFullAddressBlur"
    @keyup.native.enter="onEnterKeyup"
  >
    <template v-if="!cityOnly" #prepend>
      <base-select
        ref="type"
        v-model="tmp.type"
        :items="types.map(type => ({ text: $t(type), value: type }))"
        no-validate-on-blur
        hide-error
        hide-selected
        :clearable="false"
        :tabindex="tmp.type ? -1 : 0"
        style="min-width: 115px; width: 115px;"
        @input="value && Object.assign(value, { type: $event })"
      />
    </template>

    <template v-if="hasStreetNumber && shownStreetNumber" #append>
      <base-input-text
        ref="number"
        v-model="tmp.number"
        label="No"
        hide-error
        no-validate-on-blur
        style="min-width: 80px; width: 80px;"
        @focus="onStreetNumberFocus"
        @blur="onBlur"
      />
    </template>

    <template #error:valid>
      {{ $t('input.validation.double_check') }}
      <span class="text-white underline cursor-pointer" @click="proceedInvalidAddress">{{ $t('global.correct') }}</span>?
    </template>
  </base-input-text>
</template>

<script>
import GoogleMapsMixin from '@/mixins/GoogleMapsMixin'
import { mapGetters } from 'vuex'
export default {
  mixins: [GoogleMapsMixin],
  inheritAttrs: false,
  props: {
    value: { type: Object, default: () => null },

    // residental | domicile | legal | operative
    defaultType: { type: String, default: 'legal' },

    // Address types
    types: { type: Array, default: () => ['residental', 'domicile', 'legal', 'operative'] },

    // Use checkSupported validation to allow only address with country included in managedCountries array
    managedCountriesOnly: Boolean,

    // Add types = ['cities'] to GG Place autocomplete option to filter the results with cities only
    cityOnly: Boolean
  },
  data () {
    const { fulladdress = null, number = null, type = this.defaultType } = this.value || {}

    return {
      tmp: {
        fulladdress,
        number,
        type
      },

      snap: {
        fulladdress: null,
        number: null
      },

      invalidFullAddressException: null,

      shownStreetNumber: false
    }
  },
  computed: {
    ...mapGetters('country', ['managedCountriesCode']),

    hasStreetNumber () {
      return !this.cityOnly && !!this.value?.addressComponents?.route
    },

    patchedRules () {
      return {
        valid: () => this.checkValidity(),
        managed: () => this.checkSupported(),
        ...this.$attrs.rules
      }
    }
  },
  watch: {
    value (val, oldVal) {
      if (!val) {
        this.tmp = {
          type: this.defaultType,
          fulladdress: null,
          number: null
        }

        this.reset()
      } else if (val !== oldVal) {
        this.tmp = this.$utils.extract(val, [
          { from: 'type', default: null },
          {
            from: 'fulladdress',
            default: null,
            transform: v => this.hasStreetNumber && this.shownStreetNumber
              ? this._getFullAddressWithoutNumber(val)
              : v
          },
          {
            from: 'addressComponents',
            to: 'number',
            transform: a => a && a.street_number ? a.street_number.long : null,
            default: null
          }
        ])
      }
    }
  },
  async mounted () {
    // Temporary fix when this input is in a modal
    let tmp = 0
    await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (++tmp === 20 || this.$el?.querySelector) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })

    const inputEl = this.$el?.querySelector?.('input.cw-input-address')

    inputEl && this.initGoogleMap(() => {
      this.createAutocompleteInput(inputEl, this.handleGooglePlaceSelected.bind(this))
    })
  },
  methods: {
    reset () {
      const { type, fulladdress, number } = this.tmp

      this.$emit('input', {
        type,
        fulladdress,
        addressComponents: number ? { street_number: { long: number + '', short: number + '' } } : {},
        zipcode: '',
        location: { lat: null, lng: null }
      })

      this.invalidFullAddressException = null
    },

    onFullAddressFocus () {
      if (!this.cityOnly && this.hasStreetNumber) {
        this.shownStreetNumber = true
        this.tmp.fulladdress = this.snap.fulladdress = this._getFullAddressWithoutNumber(this.value)
      } else {
        this.snap.fulladdress = this.tmp.fulladdress
      }
    },

    onStreetNumberFocus () {
      this.snap.number = this.tmp.number
    },

    onEnterKeyup (e) {
      document.activeElement && document.activeElement.blur()
    },

    onFullAddressBlur (e) {
      if (this.tmp.fulladdress !== this.snap.fulladdress) {
        this.reset()
      }

      // Autocomplete place_changed event is fired pretty late depending on the machine's speed
      // resulting in the default blur & validated event being triggered too soon
      this.onBlur(e, 500)
    },

    // Trigger event "validated" and "blur" only when no internal field is focused
    // Because this event is handled by the ProgressiveFieldContainer to update the fields's order
    // and we don't want this field to be moved to the lower area before the address number input is filled
    onBlur (e, delay = 0) {
      setTimeout(async () => {
        const focusedEl = document.activeElement
        const { input: inputRef, type: typeRef } = this.$refs
        if (!inputRef || (focusedEl && inputRef.$el.contains(focusedEl) && (!typeRef || !typeRef.$el.contains(focusedEl)))) {
          return
        }

        const { listeners: { validated, blur } = {} } = this.$attrs

        if (await this.$refs.input.validate()) {
          validated && validated()
          this.$listeners.validated && this.$listeners.validated()
        }

        blur && blur()
        this.$listeners.blur && this.$listeners.blur()

        if (this.hasStreetNumber) {
          const { addressComponents } = this.value
          const { number, fulladdress } = this.tmp
          if (number) {
            addressComponents.street_number = { long: number, short: number }
            this.tmp.fulladdress = this.value.fulladdress = number + ' ' + fulladdress
          } else {
            delete addressComponents.street_number
          }

          if (number !== this.snap.number) {
            delete addressComponents.premise
            delete addressComponents.establishment
          }
        }

        this.shownStreetNumber = false
      }, delay)
    },

    async checkSupported (addr) {
      if (this.cityOnly || !this.managedCountriesOnly) {
        return true
      }

      await this.$store.dispatch('country/getManagedCountries')

      const { addressComponents: { country } = {} } = addr || {}

      return !country ||
        this.managedCountriesCode.includes(country.short.toLowerCase()) ||
        this.$t('input.address.validation.supported_country', { country: country.long })
    },

    checkValidity (addr) {
      if (this.cityOnly) {
        return true
      }

      const { fulladdress, addressComponents: { country } = {} } = addr || {}
      return !fulladdress ||
        !!country ||
        this.invalidFullAddressException === fulladdress
    },

    proceedInvalidAddress () {
      this.invalidFullAddressException = this.value.fulladdress
      this.$refs.input.resetValidation()
      const { validated } = this.$attrs.listeners
      validated && validated()
    },

    createAutocompleteInput (inputEl, onPlaceChange) {
      if (!window.google) {
        return
      }

      const oldAutocompleteAttr = inputEl.getAttribute('autocomplete')
      oldAutocompleteAttr && setTimeout(() => inputEl.setAttribute('autocomplete', oldAutocompleteAttr), 200)

      // https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions
      // TODO Filter type address by default. Set types to ['address'] might do this but also need to handle type esablishment (e.g. a building)
      const opts = this.cityOnly ? { types: ['(cities)'] } : {}
      const autocomplete = new window.google.maps.places.Autocomplete(inputEl, opts)

      // TODO Remove pac-container on destroy

      // https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.place_changed
      onPlaceChange && autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place && place.address_components) {
          onPlaceChange(place, inputEl)
        }
      })
    },

    handleGooglePlaceSelected (place) {
      const addressComponents = {}

      if (place.types.includes('establishment')) {
        addressComponents.establishment = { short: place.name, long: place.name }
      }

      place.address_components.forEach((c) => {
        addressComponents[c.types[0]] = { long: c.long_name, short: c.short_name }
      })

      const data = {
        type: this.tmp.type || this.defaultType,
        addressComponents,
        location: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        zipcode: addressComponents.postal_code?.long || ''
      }

      if (this.cityOnly) {
        data.fulladdress = [
          addressComponents.locality ||
          addressComponents.administrative_area_level_5 ||
          addressComponents.administrative_area_level_4 ||
          addressComponents.administrative_area_level_3 ||
          addressComponents.administrative_area_level_2 ||
          addressComponents.administrative_area_level_1,
          addressComponents.country
        ]
          .filter(Boolean)
          .map(c => c.long)
          .join(', ')
      } else {
        // Ensure fulladdress always has street number and route first
        const streetAddrHtml = place.adr_address?.split('</span>').find(c => c.includes('"street-address"'))
        const streetAddr = streetAddrHtml?.slice(streetAddrHtml?.lastIndexOf('>') + 1)
        data.fulladdress = !streetAddr ? place.formatted_address : [
          // eslint-disable-next-line camelcase
          [data.addressComponents?.street_number?.long, data.addressComponents?.route?.long].filter(Boolean).join(' '),
          place.formatted_address.replace(streetAddr + ', ', '')
        ].filter(Boolean).join(', ')
      }

      data.type = this.tmp.type || this.defaultType
      this.$emit('input', data)

      this.shownStreetNumber = !this.cityOnly && !!addressComponents.route

      this.shownStreetNumber && this.$nextTick(() => {
        this.$refs.number && this.$refs.number.focus()
      })
    },

    _getFullAddressWithoutNumber (data) {
      const route = data.addressComponents.route?.long
      const streetNumber = data.addressComponents.street_number?.long

      if (streetNumber && route) {
        const separatedStreetNumber = `, ${streetNumber},`
        if (data.fulladdress.includes(separatedStreetNumber)) {
          return data.fulladdress.replace(separatedStreetNumber, ',')
        }

        const numberRoute = `${streetNumber} ${route},`
        if (data.fulladdress.includes(numberRoute)) {
          return data.fulladdress.replace(numberRoute, route + ',')
        }
      }

      return data.fulladdress
    }
  }
}
</script>

<style lang="scss">
.pac-container {
  font-size: 15px;
  box-shadow: none;
  @apply bg-gray-700 shadow-none border-t-0 rounded-t-none rounded-b-10px;
}
.pac-item {
  cursor: pointer;
  color: rgba(#fff, .9);
  border-top: none;
  padding: 5px 10px;
  user-select: none;
  font-size: 1em;
  .pac-item-query {
    color: white;
  }
  .pac-icon {
    display: none;
  }
  &:hover {
    background: unset;
    color: white;
  }
  &-selected {
    &, &:hover {
      @apply bg-gray-750;
    }
  }
}
.pac-logo:after {
  display: none;
}
</style>
