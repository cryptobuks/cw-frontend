<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col bg-white',
      title: $t('profile.entities.opening_times'),
    }"
    show-back-button
    v-on="$listeners"
  >
    <cw-weekday-modal
      ref="weekdayModal"
      v-bind="{ value: gymWeekDays() }"
      @change="setWeekDays"
    />
    <cw-exception-modal
      ref="exceptionModal"
      v-bind="{ value: (gymHours && gymHours.exceptions) || [] }"
      @change="(exceptions) => setGymHours({ exceptions })"
    />
    <base-scroll class="h-profile-body w-full px-3">
      <div class="flex my-3">
        <base-icon name="opening-gym" size="20" />
        <span
          v-if="gymStatus(date).closed === true"
          class="ml-2 text-sm capitalize"
        >
          {{ $t("gym.open_hours.closed") }}
        </span>
        <span v-else class="ml-2 text-sm capitalize">
          {{ $t(`gym.open_hours.${dateIsToday ? "open_now" : "open"}`) }}:
          {{
            gymStatus(date)
              .time.map((t) => `${t.from} - ${t.to}`)
              .join(" | ")
          }}
        </span>
      </div>

      <base-flatpickr
        v-model="date"
        v-bind="{
          flatpickrConfig: {
            inline: true,
            minDate: $dayjs().format(),
          },
          theme: 'light',
        }"
        class="shadow-cw-card rounded-lg"
        :closeddays="closedDays()"
      />

      <h5 class="font-bold my-4 text-center capitalize">
        {{ $t("gym.open_hours.open_times") }}
      </h5>

      <cw-gym-week-days
        v-bind="{ weekdays: gymWeekDays() }"
        @edit="(day) => $refs.weekdayModal.show(day)"
      />

      <h5 v-if="gymHours" class="font-bold my-4 text-center capitalize">
        <span class="pr-2">
          {{ $t("gym.open_hours.exceptions") }}
        </span>
        <base-icon
          name="add"
          class="-mr-8 cursor-pointer"
          size="16"
          @click.prevent="$refs.exceptionModal.show()"
        />
      </h5>
      <cw-gym-hours-exceptions
        v-bind="{ exceptions: (gymHours && gymHours.exceptions) || [] }"
        @delete="deleteException"
        @edit="(exception) => $refs.exceptionModal.show(exception)"
      />
    </base-scroll>
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import isToday from 'dayjs/plugin/isToday'

export default {
  inheritAttrs: false,
  data: () => ({
    date: new Date(),
    emptyarray: []
  }),
  computed: {
    ...mapState('gym-hours', ['gymHours']),
    ...mapGetters('gym-hours', ['closedDays', 'gymStatus', 'gymWeekDays']),
    ...mapGetters('profile', ['allowed', 'viewingSelf']),
    actions () {
      return !this.allowed('business.edit-gym-hours') &&
        !this.viewingSelf(this.$auth)
        ? []
        : [{ icon: 'pen', handler: () => this.$refs.modal.show() }]
    },
    dateIsToday () {
      this.$dayjs.extend(isToday)
      return this.$dayjs(this.date).isToday()
    }
  },
  methods: {
    ...mapActions('gym-hours', ['setGymHours']),
    deleteException (exception) {
      const name =
        this.$utils.formatDate(exception.dates.from) ===
        this.$utils.formatDate(exception.dates.to)
          ? this.$utils.formatDate(exception.dates.from)
          : `${this.$utils.formatDate(
              exception.dates.from
            )} ${this.$utils.formatDate(exception.dates.to)}`

      this.$confirm(this.$t('global.confirm_remove', { name }), async () => {
        const exceptions = this.gymHours.exceptions.filter(
          e =>
            e.from !== exception.from ||
            e.to !== exception.to ||
            e.isClosed !== exception.isClosed
        )

        await this.setGymHours({ exceptions })
      })
    },
    setWeekDays (weekdays) {
      weekdays = weekdays.filter(day => !day.closed)
      this.setGymHours({ weekdays })
    }
  }
}
</script>

<style>
.opening-times-date-picker {
  @apply shadow-cw-card w-full border-none !important;
}

.swipe-card__menu-toggler {
  right: 5px !important;
  top: 5px !important;
  position: absolute !important;
  cursor: pointer !important;
}
</style>
