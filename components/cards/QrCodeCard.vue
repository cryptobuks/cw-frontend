<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions: [
        {
          icon: 'printer',
          tooltip: this.$t('contract.action.print'),
          handler: () => this.$refs.printer.print({ title: $attrs.title })
        }
      ]
    }"
    class="qr-code-card"
  >
    <base-printer ref="printer" class="qr-code-card__body">
      <h1 v-if="profile.displayName" class="qr-code-card__title hidden mb-16 text-3xl">
        {{ profile.displayName }}
      </h1>

      <base-qr-code
        :text="`${$utils.origin}/?invitingId=${$auth.user._id}${$auth.isBusiness() ? '&action=access' : ''}`"
        :logo-url="profile && $utils.getAvatarUrl(profile.avatar)"
        class="qr-code-card__qr h-64"
      />
    </base-printer>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  mounted () {
    const style = document.createElement('style')
    style.innerHTML = '@media print { @page { size: 21cm 14.85cm } }'
    document.head.appendChild(style)
    this.$once('hook:beforeDestroy', () => document.head.removeChild(style))
  }
}
</script>

<style lang="scss">
@media print {
  .qr-code-card {
    &__body {
      @apply flex flex-col items-center;
    }

    &__title {
      @apply block;
    }

    &__qr {
      transform: scale(1.2);
    }
  }
}
</style>
