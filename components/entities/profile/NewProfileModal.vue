<template>
  <component
    :is="isIndividualModal ? 'individual-profile-modal' : 'business-profile-modal'"
    v-if="loaded"
    ref="modal"
    device-action="CREATE_NEW_PROFILE"
    v-bind="switching ? { noAnimate: true } : {}"
    @hidden="onHidden"
    @hook:mounted="onModalMounted"
    @hook:beforeDestroy="onModalUnmounted"
  >
    <template #top>
      <div class="text-right">
        <base-switcher
          v-if="hasSwitcher"
          :value="isIndividualModal"
          :true-text="$t('entities.profile')"
          :false-text="$t('entities.company')"
          @input="changeModal"
        />
      </div>
    </template>
  </component>
</template>

<script>
export default {
  components: {
    IndividualProfileModal: () => import('./IndividualProfileModal'),
    BusinessProfileModal: () => import('./BusinessProfileModal')
  },
  data () {
    return {
      loaded: false,
      isIndividualModal: true,
      hasSwitcher: false,
      switching: false,
      resolve: null,
      waitForModalMount: null
    }
  },
  created () {
    this.onModalUnmounted()
  },
  methods: {
    show ({ individual = true, hasSwitcher = true, params = [] } = {}) {
      this.loaded = true
      this.isIndividualModal = individual
      this.hasSwitcher = hasSwitcher

      setTimeout(async () => {
        this.waitForModalMount && await this.waitForModalMount
        this.$refs.modal?.show?.(...params)
      })
    },

    hide (...params) {
      this.$refs.modal?.hide?.(...params)
    },

    changeModal (isIndividualModal) {
      if (isIndividualModal === this.isIndividualModal) {
        return
      }

      this.switching = true

      this.isIndividualModal = isIndividualModal

      setTimeout(async () => {
        this.waitForModalMount && await this.waitForModalMount
        this.$refs.modal?.show?.()

        this.switching = false
      })
    },

    onHidden () {
      this.$nextTick(() => !this.switching && this.$emit('hidden'))
    },

    onModalMounted () {
      this.resolve?.()
    },

    onModalUnmounted () {
      this.waitForModalMount = new Promise((resolve, reject) => {
        this.resolve = resolve
      })
    }
  }
}
</script>
