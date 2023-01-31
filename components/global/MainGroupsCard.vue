<template>
  <base-main-card
    class="base-group-card"
    :show-back-button="showBackButton || !!activeGroup"
    :title="activeGroup ? activeGroup.title : title"
    v-bind="patchedAttrs"
    v-on="$listeners"
  >
    <template v-if="isMobileView">
      <div v-if="!activeGroup" class="px-4 py-4">
        <div
          v-for="(group, index) in groups"
          :key="index"
          class="base-group-card__group--mobile"
          @click="activeGroup = group"
        >
          <slot name="group-title" :group="group" :index="index">
            {{ group.title }}
          </slot>
        </div>
      </div>

      <div v-else>
        <div
          v-for="(item, i) in activeGroup.items || []"
          :key="item._id || item.id || i"
          class="base-group-card__item--mobile"
        >
          <slot name="item" :group="activeGroup" :item="item" :index="i" />
        </div>
      </div>
    </template>

    <template v-else>
      <div
        v-for="(group, index) in groups"
        :key="index"
        class="base-group-card__group"
      >
        <header class="base-group-card__header">
          <slot name="group-title" :group="group" :index="index">
            <h4 class="base-group-card__title">
              {{ group.title }}
            </h4>
          </slot>

          <slot name="group-actions" :group="group" :index="index">
            <span
              v-for="(action, i) in patchedGroupActions"
              :key="i"
              v-tippy="isMobileView ? false : action.tooltip"
              class="base-group-card__action"
              @click="action.handler && action.handler(group)"
            >
              <base-icon
                :name="action.icon"
                :size="isMobileView ? 16 : 20"
              />
            </span>
          </slot>
        </header>

        <base-carousel v-if="group.items && group.items.length" :items="group.items" :body-class="groupBodyClass">
          <template #item="props">
            <slot name="item" :group="group" v-bind="props" />
          </template>
        </base-carousel>
      </div>
    </template>

    <template v-for="name in filterSlots($scopedSlots)" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>

    <slot name="extended-modal" />
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },

    groups: { type: Array, default: () => [] },

    hideGroupActions: Boolean,

    showBackButton: Boolean,

    groupActions: { type: Array, default: () => [] },

    groupBodyClass: { type: String, default: '' }
  },
  data () {
    return {
      activeGroup: null
    }
  },
  computed: {
    patchedAttrs () {
      const attrs = { ...this.$attrs }

      if (this.activeGroup) {
        attrs.hideSearch = true
        attrs.actions = this.patchedGroupActions.map(action => ({
          ...action,
          handler: () => action.handler(this.activeGroup)
        }))
      }

      return attrs
    },
    patchedGroupActions () {
      return this.hideGroupActions ? this.groupActions : [
        { icon: 'add', tooltip: this.$t('global.action_add_tooltip'), handler: group => this.$emit('add-group-item', group) }
      ]
    },
    isMobileView () {
      return this.$mq === 'mobile'
    }
  },
  methods: {
    filterSlots (inputSlots) {
      const slots = { ...inputSlots }
      const usedSlots = ['default', 'group-title', 'group-actions', 'group-body', 'extended-modal']

      if (this.activeGroup) {
        usedSlots.push('title', 'title-text', 'actions')
      }

      usedSlots.forEach((slotName) => {
        delete slots[slotName]
      })

      return Object.keys(slots)
    }
  }
}
</script>

<style lang="scss">
.base-group-card {
  &__group {
    max-width: 100%;
    overflow: hidden;
    padding: 0 25px;

    &--mobile {
      opacity: 0.8;
      @apply bg-darkred text-white text-xl p-4 mb-5 rounded-6px;
    }
  }

  &__header {
    height: 85px;
    display: flex;
    align-items: center;
    padding: 10px 0;
    color: #fff;
  }

  &__title {
    flex-shrink: 0;
    font-size: 25px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 15px;
  }

  &__action {
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    cursor: pointer;
    height: 60px;
  }

  &__item {
    &--mobile {
      padding: 7.5px 15px;

      &:first-child {
        margin-top: 7.5px;
      }

      &:last-child {
        margin-bottom: 7.5px;
      }
    }
  }
}
</style>
