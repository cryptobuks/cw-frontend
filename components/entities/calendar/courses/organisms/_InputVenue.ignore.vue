<template>
  <div @click="showModal">
    <base-input-wrapper class="input-wrapper" v-bind="$attrs" :active="!!venues.length">
      <transition-group
        leave-to-class="opacity-0"
        leave-active-class="absolute"
        tag="div"
        class="pb-1"
      >
        <base-chip v-for="({ id, text, value}) in chips" :key="id" class="m-1 transition duration-300" :dismissible="true" @dismiss="removeVenue(value)">
          {{ text }}
        </base-chip>
      </transition-group>
    </base-input-wrapper>

    <cw-add-venue-modal ref="addVenueModal" :period="period" @add="addVenue" />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    period: { type: Object, required: true }
  },
  data: () => ({
    venues: []
  }),
  computed: {
    chips () {
      return this.venues.map((venue, i) => {
        const { day, room, startTime: { hh: hh1, mm: mm1 }, endTime: { hh: hh2, mm: mm2 } } = venue
        return {
          id: i,
          text: `${room.name} | ${this.$utils.upperFirst(day)} ${hh1.toString().padStart(2, '0')}:${mm1.toString().padStart(2, '0')} - ${hh2.toString().padStart(2, '0')}:${mm2.toString().padStart(2, '0')}`,
          value: venue
        }
      })
    }
  },
  methods: {
    showModal () {
      this.$refs.addVenueModal.show()
    },
    addVenue (e) {
      this.venues.push(e)
    },
    removeVenue (venue) {
      const index = this.venues.indexOf(venue)
      this.venues.splice(index, 1)
    }
  }
}
</script>

<style lang="postcss" scoped>
.input-wrapper {
  @apply cursor-pointer;

  & ::v-deep .base-input__label__inner {
    @apply inline-block !important;
  }
}
</style>
