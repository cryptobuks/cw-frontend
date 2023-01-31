<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-full',
      title: $t('settings.profile.unit_of_measure'),
    }"
    v-on="$listeners"
  >
    <div class="h-full bg-white flex flex-col p-4">
      <div class="grid grid-cols-3 items-center mb-3">
        <span class="font-extrabold text-xs capitalize ml-1">
          {{ $t("settings.profile.unit_of_measure") }}
        </span>
        <div class="flex justify-center items-center">
          <img
            :src="`/images/flag/eur.svg`"
            class="w-8 h-8 rounded-full object-cover mr-3"
          >
        </div>
        <div class="flex justify-center items-center">
          <img
            :src="`/images/flag/us.svg`"
            class="w-8 h-8 rounded-full object-cover mr-3"
          >
        </div>
      </div>
      <div
        v-for="(value, unit) in units"
        :key="unit"
        class="grid grid-cols-3 gap-3 items-center"
      >
        <span class="font-extrabold text-xs capitalize ml-1">
          {{ $t(`units.${unit.toLowerCase()}`) }}?
        </span>
        <div
          class="shadow-cw-card flex items-center justify-between h-12 p-3 rounded-lg"
        >
          <span class="text-xs">{{
            value.label ? value.label.eur : value.eur
          }}</span>
          <base-input-radio
            v-model="value.val"
            v-bind="{ size: 15, value: value.eur }"
            @change="submit(unit, value.val)"
          />
        </div>
        <div
          class="shadow-cw-card flex items-center justify-between h-12 p-3 rounded-lg"
        >
          <span class="text-xs">{{
            value.label ? value.label.us : value.us
          }}</span>
          <base-input-radio
            v-model="value.val"
            v-bind="{ size: 15, value: value.us }"
            @change="submit(unit, value.val)"
          />
        </div>
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    units: {
      Distance: { eur: 'km', us: 'mi', val: 'mi' },
      Weight: { eur: 'kg', us: 'lb', val: 'lb' },
      Temperature: {
        eur: 'C',
        us: 'F',
        label: { eur: '°C', us: '°F' },
        val: 'F'
      },
      Date: { eur: 'DD/MM/YY', us: 'MM/DD/YY', val: 'MM/DD/YY' },
      Number: { eur: '1.000,00', us: '1,000.00', val: '1,000.00' }
    }
  }),
  created () {
    this.setUnits()
  },
  methods: {
    ...mapActions('profile', ['getProfile']),
    setUnits () {
      for (const [unit, value] of Object.entries(this.units)) {
        value.val =
          this.profile.settings[`${unit.toLowerCase()}Format`] || value.val
      }
    },
    async submit (unit, value) {
      await this.$repos.profileRepo.settings.setUnit(unit, value)
      this.$notifier.success(this.$t('global.success'))
      this.getProfile(this.profile._id)
    }
  }
}
</script>

<style>
</style>
