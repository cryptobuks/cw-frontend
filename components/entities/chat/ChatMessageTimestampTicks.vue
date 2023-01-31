<template>
  <div class="flex justify-end items-center flex-1">
    <span class="opacity-50 text-xs">{{ $utils.formatTime(source.createdAt) }}</span>
    <base-icon v-if="!source._id" class="opacity-50 ml-1 mr-2" name="clock" />
    <cw-chat-ticks v-if="source.toProfileId !== $auth.user._id && source._id" class="flex-shrink-0 transform scale-75 opacity-60" :delivered="source.isDelivered" :read="source.isViewed" />
  </div>
</template>

<script>
export default {
  props: {
    source: { type: Object, required: true }
  }
}
</script>
