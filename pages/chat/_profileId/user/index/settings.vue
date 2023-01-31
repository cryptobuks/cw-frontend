<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-full',
      title: $t('global.settings'),
    }"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        profile,
        previousPage: `${$attrs.previousPage}/settings`,
      }"
    />
    <div class="h-full bg-white flex flex-col space-y-3 p-3">
      <nuxt-link
        v-for="setting in settings"
        :key="setting.title"
        class="border rounded-lg h-16 w-full p-4 flex items-center"
        :to="`${$route.path}/${setting.to}`"
      >
        <span class="font-extrabold text-sm capitalize">{{ $t(setting.title) }}</span>
      </nuxt-link>
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    settings: [
      { title: 'profile.entities.app_background', to: 'app-background' },
      { title: 'global.languages', to: 'languages' },
      { title: 'settings.profile.unit_of_measure', to: 'unit-of-measure' },
      { title: 'global.notifications', to: 'notifications' },
      { title: 'settings.profile.connect_calendar', to: '' }
    ]
  })
}
</script>

<style>
</style>
