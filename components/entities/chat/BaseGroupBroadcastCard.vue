<template>
  <base-main-card
    v-bind="$attrs"
    :title="title"
    body-class="bg-white px-3"
    :show-back-button="!hideBackButton && mode === 'INFO'"
    hide-search
    :show-search-toggler="true"
    :actions="actions"
    @back="$emit('back')"
  >
    <template #default="{ searchText }">
      <keep-alive>
        <slot :search-text="searchText" />
      </keep-alive>
    </template>
  </base-main-card>
</template>

<script>
export default {
  props: {
    mode: { type: String, default: 'MEMBERS' },
    title: { type: String, required: true },
    hideBackButton: Boolean,
    hideEditButton: Boolean,
    editTooltip: { type: String, default: '' }
  },
  computed: {
    actions () {
      const actions = []
      if (this.mode === 'INFO' && !this.hideEditButton) {
        actions.push({ icon: 'pen', tooltip: this.editTooltip, handler: () => this.$emit('edit') })
      }
      actions.push({ icon: 'dismiss', size: 16, handler: () => this.$emit('dismiss') })
      return actions
    }
  }
}
</script>
