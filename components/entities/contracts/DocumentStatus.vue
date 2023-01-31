<template>
  <div class="text-xs text-gray-600">
    <span
      class="font-semibold mb-2 mr-1"
      :class="[document.status === 'expired' ? 'hidden' : '']"
    >
      {{ $t(`contract.status.${document.status}`) }}
    </span>
    <span v-if="document.status === 'active'">
      {{ $dayjs(document.activatedAt).format("DD.MM.YYYY") }}
    </span>
    <span v-else-if="document.status === 'expired'" class="text-red">
      {{ $dayjs(document.activatedAt).format("DD.MM.YYYY") }} -
      {{ $dayjs(document.expiredAt).format("DD.MM.YYYY") }}
    </span>
  </div>
</template>

<script>
export default {
  props: { document: { type: Object, required: true } }
}
</script>

<style>
</style>
