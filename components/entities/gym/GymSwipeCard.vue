<template>
  <base-swipe-card
    :actions="status.isDraft ? [] : cardActions"
    :hide-actions="status.isSuspended"
    bg-color="rgba(238, 238, 237)"
    body-class="flex text-black -m-1"
    class="relative"
    @edit="$emit('edit')"
    @remove="$emit('remove')"
  >
    <div class="w-14 select-none flex-shrink-0">
      <div class="w-12 h-12 rounded-full overflow-hidden bg-white">
        <img
          :src="$utils.getAvatarUrl(gym.avatar)"
          class="w-full max-h-full"
        >
      </div>
    </div>

    <div class="overflow-hidden">
      <div class="flex flex-wrap mb-1 items-center">
        <h4
          v-auto-resize-text="{ tooltipOnly: true }"
          class="font-bold capitalize inline-block mr-1"
          :class="{ 'text-orange': status.isTemporary }"
        >
          {{ gym.name }}
        </h4>

        <span
          v-if="group && group.parent && group.children && group.children.length"
          v-tippy="{
            content: `<div class='mb-1 font-normal cursor-default'>${group.parent.displayName}</div><ul class='list-disc list-inside cursor-default'>${group.children.map(c => `<li class='mb-1 ${c._id === gym._id ? 'font-semibold' : 'font-normal'}'>${c.displayName}</li>`).join('')}</ul>`,
            interactive: true,
            placement: 'bottom',
          }"
          class="text-xs text-black font-semibold cursor-default"
        >
          ({{ $t('gym.card.group.' + (group.parent._id === gym._id ? 'head' : 'son')) }})
        </span>
      </div>

      <div v-auto-resize-text="{ tooltipOnly: true }" class="mb-1">
        {{ gymLocation }}
      </div>

      <div
        class="capitalize mb-1"
        :class="{
          'text-gray-700': status.isDraft,
          'text-orange': status.isTemporary,
          'text-green': status.isActive,
          'text-red': status.isSuspended
        }"
      >
        {{ gym.status }}
      </div>

      <div :style="{ color: status.isExpired ? 'red' : '#68D79B' }" class="text-xl mb-1">
        <template v-for="cwModule in gym.cwModules">
          <base-icon
            v-if="cwModule.isActive"
            :key="cwModule._id"
            v-tippy="$t(`settings.countries.pricelist.${cwModule.area}`)"
            :name="`cw-modules/${cwModule.area}`"
            class="mr-2"
          />
        </template>
      </div>

      <div v-if="gym.cwSalesman">
        {{ gym.cwSalesman.name }}
      </div>
    </div>

    <div v-if="status.isSuspended" class="bg-white bg-opacity-90 absolute inset-0 flex flex-col justify-center items-center text-xl">
      <div
        v-tippy="[gym.name, gymLocation].filter(Boolean).join('<br>')"
        class="text-red capitalize cursor-default mb-3"
      >
        {{ gym.status }}
      </div>

      <div v-if="canUnsuspend" class="inline-block uppercase cursor-pointer" @click="$emit('activate')">
        <span class="underline ml-2">RE-ACTIVATE</span> <base-icon name="play" />
      </div>
    </div>
  </base-swipe-card>
</template>

<script>
export default {
  props: {
    group: { type: Object, default: null },
    gym: { type: Object, default: () => ({}) }
  },
  computed: {
    canSuspend () {
      return !!this.$auth.user?.permission?.gym?.suspend
    },

    canUnsuspend () {
      return !!this.$auth.user?.permission?.gym?.unSuspend
    },

    cardActions () {
      return [
        this.canSuspend ? { icon: 'pause', tooltip: this.$t('gym.suspend'), danger: true, handler: () => this.$emit('suspend') } : null,
        { icon: 'pen', handler: () => this.$emit('edit') }
      ].filter(Boolean)
    },

    gymLocation () {
      const c = this.gym?.address?.addressComponents || {}
      return [
        c.administrative_area_level_3 || c.administrative_area_level_2 || c.administrative_area_level_1,
        c.country
      ].filter(Boolean).map(c => c.long).join(', ')
    },

    status () {
      const { status } = this.gym

      return {
        isDraft: status === 'draft',
        isTemporary: status === 'temporary',
        isSuspended: status === 'suspended',
        isActive: status === 'active',
        isExpired: status === 'expired'
      }
    }
  }
}
</script>
