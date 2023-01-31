<template>
  <base-main-card
    v-bind="$attrs"
    :title="`Terms and Conditions`"
    body-class="flex flex-col px-4 py-4 h-profile-body bg-white"
    :actions="[{ icon: 'search' }]"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{ ...$attrs, profile,
                previousPage: `${$attrs.previousPage}/t-and-c`, }"
    />
  </base-main-card>
</template>

<script>
export default {
  name: 'UserTAndC',
  props: {
    profile: { type: Object, required: true }
  }
}
</script>
