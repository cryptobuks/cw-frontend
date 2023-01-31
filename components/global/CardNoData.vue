<template>
  <div class="mt-3 flex justify-center items-center">
    <h5 class="font-extrabold">
      {{ $t(message) }}
    </h5>
  </div>
</template>

<script>
export default {
  props: { message: { type: String, default: 'card.search_empty' } }
}
</script>
