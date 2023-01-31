<template>
  <base-modal v-bind="{ ref: 'modal' }" @dismiss="hide">
    <div class="flex flex-col items-center">
      <button
        v-for="{ modal, title } in modals"
        :key="modal"
        class="w-64 bg-white text-black p-3 rounded text-center my-2 capitalize"
        @click="$refs[modal].show()"
      >
        {{ title }}
      </button>

      <cw-weekdays-modal ref="weekdaysModal" />
      <cw-exceptions-modal ref="exceptionsModal" />
    </div>
  </base-modal>
</template>

<script>
export default {
  computed: {
    modals () {
      return [
        { title: this.$t('gym.open_hours.open_times'), modal: 'weekdaysModal' },
        {
          title: this.$t('gym.open_hours.exceptions'),
          modal: 'exceptionsModal'
        }
      ]
    }
  },
  methods: {
    hide () {
      this.$refs.modal.hide()
    },
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>
