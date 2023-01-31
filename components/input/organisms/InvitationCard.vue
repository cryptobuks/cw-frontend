<template>
  <base-swipe-card
    v-bind="$attrs"
    auto-height
    bg-color="#404040"
    v-on="$listeners"
  >
    <div class="flex">
      <div class="flex-grow">
        <h3
          v-auto-resize-text="{ tooltipOnly: true }"
          class="font-bold cursor-default text-xl text-white mb-2"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </h3>

        <!-- TODO Uncomment after the role acceptance is done -->
        <!-- <template v-if="!acceptedAt" class="flex">
          <p v-if="lastSentAt" class="mb-2 truncate">
            {{ $t('input.relations.sent') }} {{ $utils.formatDate(lastSentAt, true) }}
          </p>

          <p class="text-red truncate">
            {{ $t('input.relations.to_be_confirmed') }}
          </p>
        </template>

        <template v-else>
          <p class="truncate text-green">
            {{ $t('input.relations.accepted') }} {{ $utils.formatDate(acceptedAt, true) }}
          </p>
        </template> -->
      </div>

      <!-- <div
        v-if="canResend"
        class="flex-shrink-0 rounded-lg w-30 bg-gray-600 hover:bg-gray-500 duration-300 text-white flex justify-center items-center cursor-pointer mr-6"
        @click="$emit('resend')"
      >
        <base-icon name="send" size="28" />
      </div> -->
    </div>
  </base-swipe-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    title: { type: String, default: '' },
    lastSentAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null }
  },
  computed: {
    // Can resend only once in every 24h
    canResend () {
      return !this.acceptedAt && (!this.lastSentAt || this.$dayjs().isAfter(this.$dayjs(this.lastSentAt)))
    }
  }
}
</script>
