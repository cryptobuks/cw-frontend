<template>
  <base-swipe-card
    class="cw-country-card"
    body-class="pt-1 text-xs"
    :actions="['active', 'expired'].includes(entity.status) ? nonDraftActions : []"
    @edit="$emit('edit')"
    @remove="$emit('remove')"
  >
    <template #header>
      <p
        class="cw-country-card__status"
        :style="{ color: entity.status === 'expired' ? 'red' : entity.status === 'active' ? 'white' : '' }"
      >
        <template v-if="entity.status === 'expired'">
          {{ $utils.formatDate(entity.activatedAt) }} - {{ $utils.formatDate(entity.expiredAt) }}
        </template>

        <template v-else-if="entity.status === 'active'">
          Active from {{ $utils.formatDate(entity.activatedAt) }}
        </template>

        <template v-else>
          To be activated
        </template>
      </p>

      <h5
        v-auto-resize-text="{ min: 16 }"
        class="cw-country-card__title"
        :class="{ 'mt-2': !$slots.default }"
        @click.prevent="$emit('view')"
      >
        <slot name="title">
          {{ entity.area }} {{ entity.progressive }}
        </slot>
      </h5>
    </template>

    <template #default>
      <slot />
    </template>

    <template #footer>
      <div v-if="entity.accepted" class="cw-country-card__accept-count">
        <base-icon name="person" size="20" />

        <span>{{ entity.accepted }}</span>
      </div>

      <div v-if="entity.status != 'expired'" class="cw-country-card__activate">
        <input
          :id="entity._id"
          ref="checkbox"
          v-model="active"
          type="checkbox"
        >

        <label :for="entity._id" />
      </div>
    </template>
  </base-swipe-card>
</template>

<script>
export default {
  props: {
    entity: { type: Object, required: true }
  },
  data () {
    return {
      nonDraftActions: [
        { icon: 'eye', handler: entity => this.$emit('view'), secondary: true },
        { icon: 'copy', handler: entity => this.$emit('clone') }
      ]
    }
  },
  computed: {
    active: {
      get () {
        return this.entity.status === 'active'
      },
      set (v) {
        this.$nextTick(() => {
          this.$refs.checkbox.checked = this.active
        })

        if (v) {
          this.$emit('activate')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.cw-country-card {
  &__status {
    color: darkgrey;
    cursor: default;
  }

  &__title {
    font-size: 19px;
    @apply text-white cursor-pointer font-bold;
  }

  &__accept-count {
    @apply flex items-center text-white;

    span {
      font-size: 18px;
      margin-left: 5px;
    }
  }

  &__activate {
    @apply flex items-center ml-auto;

    [type="checkbox"] {
      display: none;

      & + label {
        @apply relative cursor-pointer;

        &:before {
          content: '';
          @apply inline-block bg-white align-text-top w-5 h-5 rounded-1/2;
        }
      }

      &:hover + label:before {
        background: lightgreen;
      }

      &:checked + label {
        &:before {
          background: lightgreen;
        }

        &:after {
          content: '';
          left: 5px;
          top: 9px;
          width: 2px;
          height: 2px;
          box-shadow:
            2px 0 0 white,
            4px 0 0 white,
            4px -2px 0 white,
            4px -4px 0 white,
            4px -6px 0 white,
            4px -8px 0 white;
          @apply transform rotate-45 absolute bg-white;
        }
      }
    }
  }
}
</style>
