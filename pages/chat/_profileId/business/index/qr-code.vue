<template>
  <cw-qr-code-card
    v-bind="$attrs"
    :title="$t('profile.entities.qr_codes')"
    body-class="p-4 bg-white"
    v-on="$listeners"
  />
</template>
