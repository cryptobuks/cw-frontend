<template>
  <cw-qr-code-card
    v-bind="$attrs"
    :title="$t('profile.entities.membership')"
    body-class="p-4 bg-white"
    v-on="$listeners"
  />
</template>
