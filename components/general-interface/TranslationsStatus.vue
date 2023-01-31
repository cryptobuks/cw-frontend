<template>
  <div class="base-trans-status flex items-center">
    <span
      v-for="item in items"
      :key="item.text"
      v-tippy="item.value"
      class="base-trans-status__item uppercase font-bold"
      :class="{ 'is-unavailable': !item.value }"
    >
      {{ item.text }}
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    translations: { type: Object, default: () => ({}) }
  },
  computed: {
    ...mapState('settings', ['languages']),

    items () {
      const missingTrans = []
      const filledTrans = []

      for (const lang of this.languages) {
        const arr = this.translations[lang.language]
          ? filledTrans
          : missingTrans
        arr.push({
          text: lang.language,
          value: this.translations[lang.language] || null
        })
      }

      return missingTrans.concat(filledTrans)
    }
    // isShown () {
    //   for (const key in this.items) {
    //     if (this.items[key].value) {
    //       return
    //     }
    //   }
    //   return { visibility: 'hidden' }
    // }
  }
}
</script>

<style lang="scss">
.base-trans-status {
  &__item {
    color: #00d000;

    &.is-unavailable {
      color: red;
    }

    &:not(:last-child):after {
      content: "";
      display: inline-block;
      height: 12px;
      width: 2px;
      background-color: darkgrey;
      margin-left: 5px;
      margin-right: 7px;
    }
  }
}
</style>
