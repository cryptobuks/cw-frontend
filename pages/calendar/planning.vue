<template>
  <cw-calendar-main>
    <template #switcher>
      <nuxt-link to="/calendar">
        <base-icon name="planner-switch" :size="30" />
      </nuxt-link>
    </template>

    <div
      v-masonry="'calendar-masonry-container'"
      class="px-2 py-4"
      :gutter="15"
      transition-duration="0.3s"
      item-selector=".masonry-item"
    >
      <cw-planning-course-card v-masonry-tile class="masonry-item mb-4" />
    </div>
  </cw-calendar-main>
</template>

<script>
export default {
  head () {
    return {
      title: this.$t('nav.calendar')
    }
  }
}
</script>
