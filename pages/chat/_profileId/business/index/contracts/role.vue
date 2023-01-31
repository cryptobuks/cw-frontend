<template>
  <base-main-card
    v-bind="$attrs"
    :title="$t('contract.type.role')"
    body-class="flex flex-col px-4 py-4 h-profile-body bg-white"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        roles: businessRoles.filter((r) => r !== 'FR'),
        profile,
        previousPage: `${$attrs.previousPage}/role`,
      }"
    />
    <div class="flex flex-col space-y-4 capitalize">
      <nuxt-link
        v-for="(role, roleIndex) in businessRoles.filter((r) => r !== 'FR')"
        :key="`roles-${roleIndex}`"
        class="shadow-cw-card rounded-lg w-full flex items-center px-4 h-20 text-left focus:outline-none"
        :class="[role.class]"
        :to="`${$route.path}/${role}`"
      >
        <span class="font-bold text-sm">{{ $t(`roles.${role}`) }}</span>
      </nuxt-link>
    </div>
  </base-main-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  computed: { ...mapGetters('profile', ['businessRoles']) }
}
</script>

<style></style>
