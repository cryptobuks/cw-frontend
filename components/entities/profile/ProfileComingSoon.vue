<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col bg-white h-full',
      hideSearch: true,
      title: $t(entity),
    }"
    v-on="$listeners"
  >
    <div class="h-full flex justify-center space-y-3 p-6">
      <span class="font-extrabold uppercase">
        {{ $t("profile.entities.coming_soon") }}
      </span>
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: { entity: { type: String, required: true } },
  data: () => ({ entity: null }),
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        this.entity = $route.query.entity
      }
    }
  }
}
</script>

<style>
</style>
