<template>
  <base-confirm-popup
    ref="confirm"
    :actions="[{ text: 'UPDATE', handler: update, bold: true }]"
  >
    <template #title>
      <div class="flex justify-center items-center text-sm">
        <span>Lesson {{ $utils.upperFirst(selectedDay) }}</span>
        <span class="mx-1">|</span>
        <span>Room Paris</span>
        <base-icon class="mx-1" name="person" size="10" />
        <span>15</span>
      </div>
    </template>

    <div class="top-row">
      <cw-input-time
        v-model="from"
        input-class="input-class"
        label="FROM"
        light
      />
      <cw-input-time
        v-model="to"
        input-class="input-class"
        label="TO"
        light
      />
      <base-input-text
        :value="duration"
        class="pointer-events-none"
        input-class="input-class"
        label="DURATION"
        :clearable="false"
        light
      />
    </div>

    <base-input-text
      v-model="roomCapacity"
      class="mx-auto"
      input-class="input-class"
      style="width: 33%"
      label="MAX PLACES"
      :clearable="false"
      light
    />
  </base-confirm-popup>
</template>

<script>
export default {
  props: {
    selectedDay: { type: String, required: true }
  },
  data: () => ({
    from: '0',
    to: '0',
    roomCapacity: 15
  }),
  computed: {
    duration () {
      let { hh, mm } = this.parseTimeString(this.from)
      const from = hh + mm / 60

      ;({ hh, mm } = this.parseTimeString(this.to))
      const to = hh + mm / 60

      const diff = to - from

      return `${Math.floor(diff)}h ${Math.round((diff % 1) * 60)}m`
    }
  },
  methods: {
    show (from, to) {
      const { hh: hh1, mm: mm1 } = from
      const { hh: hh2, mm: mm2 } = to
      this.from = `${hh1.toString().padStart(2, '0')}:${mm1.toString().padStart(2, '0')}`
      this.to = `${hh2.toString().padStart(2, '0')}:${mm2.toString().padStart(2, '0')}`
      this.$refs.confirm.show()
    },
    parseTimeString (time) {
      let [hh, mm] = time.split(':')
      hh = parseInt(hh || 0)
      mm = parseInt(mm || 0)

      return { hh, mm }
    },
    update () {
      this.$emit('update', this.parseTimeString(this.from), this.parseTimeString(this.to))
      this.$refs.confirm.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep .base-confirm__container {
  max-width: 450px !important;
}

::v-deep .base-confirm__main {
  @apply px-0 !important;
}

::v-deep .base-input__label__inner {
  font-size: 10px;
}

::v-deep .base-input__label::after {
  width: 5px;
}

.top-row {
  display: grid;
  width: 80%;
  grid-template-columns: 22% 22% 30%;
  column-gap: 11%;
  @apply mx-auto;
}

::v-deep .base-input-text__placeholder {
  @apply text-xs;
}

::v-deep .input-class {
  color: #86cf9e;
  @apply text-xs;
}
</style>
