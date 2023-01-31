<template>
  <base-modal
    ref="baseModal"
    :title="`${$t('global.manage')} ${rentableName}`"
    :loading="submitting"
    @shown="onShown"
  >
    <slot name="top" />

    <base-form v-slot="{ rules }" @submit.prevent>
      <base-progressive-fields-container v-bind="{ fields }">
        <template #nameAndIcon="{ inputAttrs }">
          <base-input-autocomplete
            v-model.trim="rentable.name"
            v-bind="{
              ...inputAttrs,
              active: true,
              required: true,
              class: 'relative z-10',
              label: $t('rentable.name_icon.label'),
              placeholder: $t('rentable.name_icon.label'),
              rules: {
                required: rules.required,
                unique: checkRentableNameUniqueness,
              },
              tooltip: $t('rentable.name_icon.label'),
            }"
          >
            <template #prepend-icon>
              <v-swatches
                v-model="color"
                v-bind="{
                  backgroundColor: '#4a4a4a',
                  fallbackInputClass: 'vue-swatches-fallback-input-class',
                  fallbackInputType: 'color',
                  fallbackOkClass: '',
                  shape: 'circles',
                  showFallback: true,
                  swatchSize: 20,
                  triggerStyle: { width: '20px', height: '20px' },
                  wrapperStyle: { display: 'none' },
                }"
              />
            </template>
          </base-input-autocomplete>
        </template>

        <template #activity="{ inputAttrs }">
          <cw-input-activity v-model="rentable.activity" v-bind="inputAttrs" />
        </template>

        <template #ageAndDurationMin="{ inputAttrs }">
          <cw-input-age-range v-model="age" v-bind="inputAttrs" class="my-8" />
          <div class="flex items-center">
            <base-input-text
              v-model="rentable.durationMin"
              v-bind="{
                required: true,
                rules: [rules.required],
                ...inputAttrs,
                tooltip: $t('rentable.min_duration.tooltip'),
                label: $t('rentable.min_duration.tooltip'),
                placeholder: $t('rentable.min_duration.tooltip'),
                mask: '#####',
                affix: !rentable.durationMin ? '' : $t('global.minutes'),
              }"
            />
            <base-switcher
              v-model="rentable.flexibleDuration"
              v-bind="{
                trueColor: 'black',
                falseColor: 'black',
                trueText: $t('rentable.duration.fixed'),
                falseText: $t('rentable.duration.defined'),
              }"
              class="w-24 ml-6 mt-3"
            />
          </div>
        </template>

        <template #rentalStartAndAssets="{ inputAttrs }">
          <div class="flex flex-col">
            <base-select
              v-if="rentable.flexibleDuration"
              v-model="rentable.rentalStart"
              v-bind="{
                ...inputAttrs,
                affix: !rentable.flexibleDuration ? '' : $t('global.minutes'),
                hideSelected: true,
                items: rentalStarts,
                label: $t('rentable.rental_starting.label'),
                placeholder: $t('rentable.rental_starting.tooltip'),
                required: true,
                returnObject: true,
                rules: { required: rules.required },
                searchable: true,
                tooltip: $t('rentable.rental_starting.tooltip'),
              }"
              @focus.prevent="onRentalStartFocus(inputAttrs.listeners.focus)"
            />
            <base-select
              v-if="focused.rentalStart || !rentable.flexibleDuration"
              v-model="rentable.assets"
              v-bind="{
                ...inputAttrs,
                hideSelected: true,
                items: assets,
                itemText: 'name',
                label: $t('rentable.assets.label'),
                placeholder: $t('rentable.assets.tooltip'),
                required: true,
                returnObject: true,
                rules: { required: rules.required },
                searchable: true,
                sortByText: true,
                tooltip: $t('rentable.assets.tooltip'),
              }"
            >
              <template #selected-item-text="{ item: asset }">
                <span
                  class="cursor-pointer"
                  @click="$refs.capacityPopup.show(asset)"
                >
                  {{ asset.name }}
                  <base-icon name="person" size="10" />
                  {{ asset.capacity }}</span>
              </template>
            </base-select>
            <cw-rentable-capacity-popup ref="capacityPopup" />
          </div>
        </template>

        <template #timingsToSports="{ inputAttrs }">
          <div
            class="flex flex-col"
            @focus="onFocus(inputAttrs.listeners.focus)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="uppercase mr-4">
                  {{ $t("rentable.timings.label") }}
                </span>
                <base-icon
                  v-tippy="{
                    content: $t('rentable.timings.tooltip'),
                    placement: 'bottom',
                  }"
                  name="question-circle"
                />
              </div>
              <base-switcher
                v-if="rentable.customOpeningTime"
                v-bind="{
                  trueColor: 'black',
                  falseColor: 'red',
                  trueText: $t('global.connected'),
                  falseText: $t('global.disconnected'),
                }"
                class="w-30 ml-6 mt-3"
                @input="rentable.customOpeningTime = undefined"
              />
              <span v-else class="text-green uppercase">
                {{ $t("global.connected") }}
              </span>
            </div>
            <cw-gym-week-days
              v-bind="{
                weekdays: !!rentable.customOpeningTime
                  ? rentable.customOpeningTime
                  : gymWeekDays(),
              }"
              @focus.native="onFocus(inputAttrs.listeners.focus)"
              @edit="(day) => $refs.weekDayModal.show(day)"
              @delete="
                (day) => $refs.weekDayModal.submit({ ...day, closed: true })
              "
            />
            <cw-weekday-modal
              ref="weekDayModal"
              v-model="rentable.customOpeningTime"
              v-bind="{
                weekdays: !!rentable.customOpeningTime
                  ? rentable.customOpeningTime
                  : gymWeekDays(),
              }"
            />
          </div>

          <div class="flex flex-col mt-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <button
                  class="uppercase mr-4"
                  @click="$refs.exceptionModal.show()"
                >
                  {{ $t("gym.open_hours.add_exception") }}
                </button>
                <base-icon
                  v-tippy="{
                    content: $t('rentable.add_exception.tooltip'),
                    placement: 'bottom',
                  }"
                  name="question-circle"
                />
              </div>
              <base-switcher
                v-if="rentable.exceptionOpeningTime"
                v-bind="{
                  trueColor: 'black',
                  falseColor: 'red',
                  trueText: 'connected',
                  falseText: 'disconnected',
                }"
                class="w-30 ml-6 mt-3"
                @input="rentable.exceptionOpeningTime = undefined"
              />
              <span v-else class="text-green uppercase">
                {{ $t("global.connected") }}
              </span>
            </div>
            <cw-gym-hours-exceptions
              v-bind="{
                exceptions: !!rentable.exceptionOpeningTime
                  ? rentable.exceptionOpeningTime
                  : gymHours
                    ? gymHours.exceptions
                    : [],
              }"
              @edit-exception="
                (exception) => $refs.exceptionModal.show(exception)
              "
              @delete-exception="deleteException"
            />
            <cw-exception-modal
              ref="exceptionModal"
              v-model="rentable.exceptionOpeningTime"
              v-bind="{
                exceptions: !!rentable.exceptionOpeningTime
                  ? rentable.exceptionOpeningTime
                  : gymHours
                    ? gymHours.exceptions
                    : [],
              }"
            />
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center">
              <span class="uppercase mr-4">
                {{ $t("rentable.full_rent.label") }}
              </span>
              <base-icon
                v-tippy="{
                  content: $t('rentable.full_rent.tooltip'),
                  placement: 'bottom',
                }"
                name="question-circle"
              />
            </div>
            <base-switcher
              v-model="rentable.isFullRent"
              v-bind="{
                trueColor: 'black',
                falseColor: 'black',
                trueText: 'full asset',
                falseText: 'single person',
              }"
              class="w-32 ml-6 mt-3"
            />
          </div>

          <base-select
            v-model="rentable.sports"
            :tooltip="$t('activity.sport_tooltip')"
            :label="$t('activity.sport')"
            :placeholder="$t('activity.sport')"
            :items="sportInterests"
            hide-selected
            item-text="name"
            item-value="_id"
            searchable
            v-bind="inputAttrs"
            sort-by-text
            class="mt-4"
          />
        </template>

        <template #fixedPrice="{ inputAttrs }">
          <base-input-text
            v-model.number="rentable.price.fix"
            required
            :rules="[rules.required]"
            v-bind="inputAttrs"
            :label="$t('rentable.fixed_price.label')"
            :tooltip="$t('rentable.fixed_price.tooltip')"
            :placeholder="$t('rentable.fixed_price.tooltip')"
            mask="###########"
            :affix="!rentable.price.fix ? '' : country.currency.symbol"
          />
        </template>

        <template #pricePerPerson="{ inputAttrs }">
          <base-input-text
            v-model.number="rentable.price.person"
            v-bind="inputAttrs"
            :tooltip="$t('rentable.person_price.tooltip')"
            :label="$t('rentable.person_price.label')"
            :placeholder="$t('rentable.person_price.tooltip')"
            mask="###########"
            :affix="!rentable.price.person ? '' : country.currency.symbol"
          />
        </template>

        <template #vat="{ inputAttrs }">
          <div class="grid sm:grid-cols-2 items-center">
            <base-select
              v-model="rentable.vatRateId"
              v-bind="{
                ...inputAttrs,
                hideSelected: true,
                items: vatRates,
                label: $t('rentable.vat_rate.label'),
                placeholder: $t('rentable.vat_rate.tooltip'),
                required: true,
                itemValue: '_id',
                rules: { required: rules.required },
                searchable: true,
                sortByText: true,
                tooltip: $t('rentable.vat_rate.tooltip'),
              }"
              @focus.prevent="onRentalStartFocus(inputAttrs.listeners.focus)"
            />
            <base-input-text
              v-model="rentable.weightOfZeroVat"
              required
              hide-prepend
              :rules="[rules.required]"
              v-bind="inputAttrs"
              label="weight of 0% vat"
              :placeholder="$t('rentable.0_vat_weight.tooltip')"
              mask="###"
              class="ml-4"
            />
          </div>
        </template>
        <template #publicAndNotes="{ inputAttrs }">
          <div class="flex items-center justify-between my-4">
            <div class="flex items-center">
              <span class="uppercase mr-4">{{
                $t("rentable.is_public.label")
              }}</span>
              <base-icon
                v-tippy="{
                  content: $t('rentable.is_public.tooltip'),
                  placement: 'bottom',
                }"
                name="question-circle"
              />
            </div>
            <base-switcher
              v-model="rentable.isPublic"
              v-bind="{
                trueColor: 'black',
                falseColor: 'black',
                trueText: 'public',
                falseText: 'private',
              }"
              class="w-30 ml-6 mt-3"
            />
          </div>
          <base-textarea
            v-model="rentable.note"
            :label="$t('rentable.notes.label')"
            :placeholder="$t('rentable.notes.tooltip')"
            :tooltip="$t('rentable.notes.tooltip')"
            maxlength="300"
            :disabled="false"
            :rules="[rules.maxLength(300)]"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <template #actions>
      <base-button
        lg
        inline
        :disabled="isDisabled"
        class="flex-shrink-0"
        @click="submit('draft')"
      >
        <base-icon name="save" size="25" />
      </base-button>

      <base-button
        lg
        :disabled="isDisabled"
        class="ml-5 flex-grow"
        @click="submit('active')"
      >
        {{ $t("global.publish") }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import VSwatches from 'vue-swatches'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  components: {
    VSwatches
  },
  data: () => ({
    country: {},
    fields: [
      'nameAndIcon',
      'activity',
      'ageAndDurationMin',
      'rentalStartAndAssets',
      'timingsToSports',
      'fixedPrice',
      'pricePerPerson',
      'vat',
      'publicAndNotes'
    ].map(name => ({
      name
    })),
    focused: {
      rentalStart: false,
      slider: false
    },
    rentable: {
      name: null,
      icon: null,
      age: { min: 0, max: 100 },
      durationMin: null,
      flexibleDuration: true,
      rentalStart: null,
      assets: [],
      customOpeningTime: undefined,
      exceptionOpeningTime: undefined,
      isFullRent: false,
      sports: [],
      price: {
        fix: null,
        person: null
      },
      vatRateId: null,
      weightOfZeroVat: null,
      isPublic: true,
      note: null
    },
    rentalStarts: [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 60].map(n => String(n)),
    serviceType: 'rentable',
    submitting: false
  }),
  computed: {
    ...mapGetters('calendar', ['usedColors']),
    ...mapGetters('gym-hours', ['gymWeekDays']),
    ...mapGetters('settings', ['sportInterests']),
    ...mapState('calendar', ['gymAssets', 'rentables']),
    ...mapState('country', ['vatRates']),
    ...mapState('gym-hours', ['gymHours']),
    age: {
      get () {
        const { min, max } = this.rentable.age
        return [min, max]
      },
      set (age) {
        const [min, max] = age
        this.rentable.age = { min, max }
      }
    },
    assets () {
      return this.gymAssets.map(asset => ({
        name: asset.name,
        assetId: asset._id,
        capacity: String(this.getAssetCapacity(asset))
      }))
    },
    color: {
      get () {
        if (this.rentable.icon) {
          return this.rentable.icon
        } else {
          return this.$utils.getNewColor(this.usedColors)
        }
      },
      set (v) {
        this.rentable.icon = v
      }
    },
    isDisabled () {
      let disabled = false
      const fields = Object.entries(this.rentable).filter(
        ([key]) =>
          !['customOpeningTime', 'exceptionOpeningTime', 'isFullRent'].includes(
            key
          )
      )
      for (const [key, value] of fields) {
        if (!value) {
          disabled = true
          break
        }
        if (key === 'assets' && value.length < 1) {
          disabled = true
          break
        }
        if (key === 'price' && (!value.fix || !value.person)) {
          disabled = true
          break
        }
      }
      return disabled
    },
    rentableName () {
      return (
        this.rentable.name || this.$t('global.new', { name: this.serviceType })
      )
    }
  },
  async created () {
    if (!this.sportInterests?.length) {
      this.getSportInterests()
    }
    if (!this.gymAssets?.length) {
      this.getGymAssets(this.$auth.user._id)
    }
    this.getGymHours(this.$auth.user._id)
    this.country = await this.getCountry()
    this.getVatRates()
  },
  methods: {
    ...mapActions('calendar', ['saveRentable', 'getGymAssets']),
    ...mapActions('country', ['getVatRateList']),
    ...mapActions('gym-hours', ['getGymHours']),
    ...mapActions('settings', ['getSportInterests']),
    checkRentableNameUniqueness (name) {
      return !(this.rentables || []).find(rentable =>
        rentable.name.toLowerCase().match(name.toLowerCase())
      )
    },
    deleteException (exception) {
      const exceptions = this.rentable.exceptionOpeningTime
        ? this.rentable.exceptionOpeningTime
        : this.$utils.clone(this.gymHours?.exceptions || [])
      for (const [index, exp] of Object.entries(exceptions)) {
        if (exception.from === exp.from && exception.to === exp.to) {
          exceptions.splice(index, 1)
          break
        }
      }
      this.rentable.exceptionOpeningTime = exceptions
    },
    getAssetCapacity (asset) {
      const ageGroup =
        Number(this.rentable.age.max) >= 12 ? 'adult' : 'children'
      return asset.capacity[ageGroup]
    },
    async getCountry () {
      const countries = await this.$repos.settingsRepo.country
        .get()
        .then(res => res.data.countries)
      return countries.find(
        c =>
          c.code.toLowerCase() ===
          this.$auth.user.company?.country.toLowerCase()
      )
    },
    async getVatRates () {
      await this.getVatRateList({ countryId: this.country._id })
      this.rentable.vatRateId = this.vatRates.find(v => v.isDefault)?._id
    },
    onFocus (e) {
      if (typeof e === 'function') {
        e()
      }
    },
    onRentalStartFocus (e) {
      if (this.rentable.flexibleDuration) {
        this.focused.rentalStart = true
      } else {
        this.onFocus(e)
      }
    },
    onShown () {
      Object.assign(this.$data, this.$options.data.call(this))
    },
    onSliderFocus (e) {
      this.onFocus(e)
      this.focused.slider = true
    },
    show (rentable = null) {
      this.rentable = rentable || this.rentable
      this.$refs.baseModal.show()
    },
    async submit (status) {
      this.submitting = true

      await this.saveRentable({
        ...this.rentable,
        status,
        assets: this.rentable.assets.map(asset => ({
          assetId: asset._id,
          capacity: String(this.getAssetCapacity(asset))
        })),
        rentalStart: undefined // bug in backend will remove this once Faraz fixes
      })
      this.submitting = false
      this.$refs.baseModal.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep .vue-swatches-fallback-input-class {
  @apply py-0 !important;
}

::v-deep .vue-swatches-fallback-ok-class {
  background-color: #86cf9e;
}

::v-deep .vue-slider-mark-label {
  top: initial;
  margin-top: initial;
  bottom: 200%;
}
</style>
