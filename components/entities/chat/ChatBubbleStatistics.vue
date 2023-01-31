<template>
  <div class="flex justify-around mt-3 pt-3 pb-2 border-t border-black border-opacity-25">
    <div class="px-3">
      <base-icon name="sended" size="20" alt="sended" />
      {{ sendedCount }}
    </div>
    <div class="px-3">
      <base-icon name="eye" size="20" alt="viewed" />
      {{ viewedCount }}
    </div>
    <div class="px-3">
      <base-icon name="mouse-click" size="20" alt="clicked" />
      {{ clickedCount }}
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    source: { type: Object, required: true }
  },
  computed: {
    sendedCount () {
      return this.source?.toProfileIds?.length || 0
    },

    viewedCount () {
      return this.source?.views?.length || 0
    },

    clickedCount () {
      return this.source?.clicks?.length || 0
    }
  },
  methods: {
    ...mapMutations({
      setCurrentDraft: 'chat/SET_CURRENT_DRAFT'
    }),
    handleAction (frontend, backend) {
      const { function: frontendFunction, ...frontendParams } = frontend

      switch (frontendFunction) {
        case 'autoreply': {
          const { defaultText } = frontendParams

          this.setCurrentDraft({
            text: defaultText
          })

          break
        }
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.action-button {
  @apply w-full text-base uppercase font-semibold py-1 px-3 border-t border-l border-black border-opacity-25 rounded-none;

  &:first-of-type {
    @apply border-l-0;
  }
}
</style>
