<template>
  <base-main-card
    v-bind="$attrs"
    :title="this.$t('profile.entities.contracts')"
    body-class="flex flex-col px-4 py-4 h-profile-body bg-white"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        profile,
        previousPage: `${$attrs.previousPage}/contracts`,
      }"
    />
    <div class="flex flex-col space-y-4">
      <nuxt-link
        v-for="(contract, contractIndex) in contracts"
        :key="`contracts-${contractIndex}`"
        class="shadow-cw-card rounded-lg w-full flex items-center px-4 h-20 text-left focus:outline-none"
        :class="[contract.class]"
        :to="`${$route.path}/${contract.name ? contract.name : ''}`"
      >
        <span class="font-bold text-sm">{{
          $t(`contract.type.${contract.name}`)
        }}</span>
      </nuxt-link>
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    contracts: [
      {
        name: 'privacy'
      },
      {
        name: 'term'
      },
      {
        name: 'role'
      },
      { name: 'insurance' },
      {
        class: 'bg-darkred text-white',
        name: 'cw_contract'
      }
    ]
  })
}
</script>

<style></style>
