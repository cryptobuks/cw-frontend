<template>
  <base-modal
    v-bind="{
      loading: submitting,
      ref: 'modal',
      title: setting && $t(`calendar.settings.${setting.option}`)
    }"
    @done="submit"
  >
    <base-form v-if="setting" v-slot="{ rules }">
      <div v-for="field in fields" :key="field.field">
        <h3
          v-if="
            setting.option === 'bookingRules' &&
              field.field === 'violationsPeriod'
          "
          class="font-extrabold text-lg mt-10 uppercase"
        >
          {{ $t("global.violations") }}
        </h3>
        <base-input-text
          v-model="field.value"
          :rules="[rules.required]"
          type="number"
          :tooltip="field.label"
          :label="field.label"
        />
      </div>
    </base-form>
    <div
      v-if="setting && setting.option === 'bookingRules'"
      class="w-full bg-white py-3 px-4 rounded-lg text-black text-xs mt-10"
    >
      <div class="block">
        <span class="block font-bold capitalize">{{
          $t("global.booking")
        }}</span>
        <p
          v-html="
            $t('calendar.settings.bookingRules.demo.booking', {
              startTime: findField('startTime').value
            })
          "
        />
      </div>
      <div class="block mt-4">
        <span class="block font-bold capitalize">{{
          $t("global.penalty")
        }}</span>
        <p
          v-html="
            $t('calendar.settings.bookingRules.demo.penalty', {
              numberOfViolations: findField('numberOfViolations').value,
              violationsPeriod: findField('violationsPeriod').value,
              penaltyPeriod: findField('penaltyPeriod').value
            })
          "
        />
      </div>
    </div>
  </base-modal>
</template>

<script>
export default {
  props: { businessSettings: { type: Object, required: true } },
  data: () => ({
    fields: [],
    submitting: false,
    setting: null
  }),
  computed: {
    settings () {
      const settings = {
        bookingRules: [
          'startTime',
          'endTime',
          'unBookingTime',
          'violationsPeriod',
          'numberOfViolations',
          'penaltyPeriod'
        ],
        calendarVisibility: ['daysBefore', 'daysAfter'],
        trackPresence: ['startTime', 'userEndTime', 'trainerEndTime'],
        trainerSubstitution: ['endTime']
      }

      Object.keys(settings).forEach((setting) => {
        settings[setting] = settings[setting].map(field => ({
          field,
          label: this.$t(`calendar.settings.${setting}.fields.${field}`),
          value: this.setting?.[field]
        }))
      })

      return settings
    }
  },
  methods: {
    done () {
      this.setting = null
      this.fields = []
      this.$refs.modal.hide()
      // wait because response comes back before backend db is updated
      setTimeout(() => {
        this.$emit('done')
      }, 500)
    },
    findField (field) {
      return this.fields.find(f => f.field === field) || {}
    },
    show (setting) {
      this.setting = setting
      this.fields = this.settings[setting.option]
      this.$refs.modal.show()
    },
    async submit () {
      this.submitting = true
      const options = {}

      for (const field of this.fields) {
        options[field.field] = Number(field.value)
      }

      await this.$repos.settingsRepo.calendar.set({
        id: this.businessSettings._id,
        options: {
          ...this.businessSettings.options,
          [this.setting.option]: options
        }
      })
      this.submitting = false
      this.done()
    }
  }
}
</script>
