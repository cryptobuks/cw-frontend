<template>
  <base-popover
    ref="popover"
    placement="top"
    alignment="center"
    inline
    :disabled="disabled"
    @active-change="url = null"
  >
    <template #activator>
      <default-btn v-bind="$attrs" :disabled="disabled" />
    </template>

    <base-form
      v-slot="{ rules }"
      class="cw-text-editor__link__popover"
      @submit="done"
    >
      <base-input-text
        v-model="url"
        :label="$t('editor.url_insert')"
        placeholder="https://"
        :rules="[rules.required, rules.url]"
        autofocus
      />

      <div class="flex">
        <base-button type="submit" inline class="ml-auto">
          Save
        </base-button>
      </div>
    </base-form>
  </base-popover>
</template>

<script>
import DefaultBtn from './DefaultBtn'
export default {
  components: {
    DefaultBtn
  },
  inheritAttrs: false,
  props: {
    command: { type: Function, default: null },
    disabled: Boolean
  },
  data () {
    return {
      url: null
    }
  },
  methods: {
    done () {
      if (this.command) {
        this.command({ href: this.url })
      }

      this.$refs.popover.hide()
    }
  }
}
</script>

<style lang="scss">
.cw-text-editor__link {
  &__popover {
    width: 500px;
    max-width: 100vw;
    padding: 10px 10px 16px;
    font-size: 16px;

    @apply bg-gray-750;
  }
}
</style>
