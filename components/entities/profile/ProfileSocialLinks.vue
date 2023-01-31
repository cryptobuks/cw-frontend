<template>
  <div
    v-if="profile.onlineLinks && profile.onlineLinks.length"
    class="mt-4 flex justify-between items-center w-full"
  >
    <a
      v-for="site in profile.onlineLinks"
      :key="site._id"
      :href="site.link"
      rel="noopener noreferrer nofollow"
      target="_blank"
      class="inline-block no-underline hover:no-underline"
    >
      <base-icon
        :name="'social-' + (site.type === 'url' ? 'web' : site.type)"
        :size="site.type === 'url' ? 40 : 25"
      />
    </a>
  </div>
</template>

<script>
export default {
  props: { profile: { type: Object, required: true } }
}
</script>

<style>
</style>
