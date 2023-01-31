<template>
  <base-modal ref="baseModal" title="Month">
    <template #activator>
      <slot />
    </template>

    <date-picker
      :language="language"
      class="flex justify-center items-center"
      calendar-class="datepicker-calendar"
      style="height: 350px"
      minimum-view="month"
      :full-month-name="false"
      inline
      @selected="onSelected"
    />
  </base-modal>
</template>

<script>
import DatePicker from 'vuejs-datepicker'
import { en, it } from 'vuejs-datepicker/dist/locale'

export default {
  components: {
    DatePicker
  },
  data: () => ({
    en,
    it
  }),
  computed: {
    language () {
      const lang = this.$route.query.language
      return this[lang === 'en' || lang === 'it' ? lang : 'en']
    }
  },
  methods: {
    show () {
      this.$refs.baseModal.show()
    },
    onSelected (date) {
      this.$emit('selected', date)
      this.$refs.baseModal.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep  .datepicker-calendar {
  &.vdp-datepicker__calendar {
    background: none;
    @apply uppercase text-white text-opacity-90 border-none overflow-hidden;

    & header {
      & .up, & .prev, & .next {
        &:not(.disabled):hover {
          background: none;
        }
      }

      & .prev, & .next {
        text-indent: 0;

        &::after {
          border: 0;
        }
      }

      & .prev::after {
        content: '<<';
      }

      & .next::after {
        content: '>>';
      }
    }

    & .cell {
      @apply inline-flex justify-center items-center bg-gray-500 text-black border-4 border-black border-opacity-0 bg-clip-padding;

      &.selected {
        @apply bg-white;
      }

      &:not(.blank):not(.disabled) {
        &.year, &.month {
          &:hover {
            @apply bg-white border-black border-opacity-0;
          }
        }
      }
    }
  }
}
</style>
