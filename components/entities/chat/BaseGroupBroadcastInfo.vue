<template>
  <div class="h-full">
    <div class="flex flex-col items-center bg-white text-gray-750 px-4 py-6">
      <cw-profile-avatar
        :src="$utils.getAvatarUrl(source.avatar, 'group')"
        :alt="source.displayName"
        :size="24"
      />
      <h3 class="text-lg font-poppins-bold mt-5">
        {{ source.displayName }}
      </h3>
      <p class="mt-5">
        {{ source.description || '' }}
      </p>
    </div>
    <div class="bg-gray-150 h-full -mx-3 px-4 py-6">
      <cw-broadcast-tag v-for="({ id, text, value }) in filterTags" :key="id" class="mr-2 mb-1 cursor-default" :type="value.type">
        {{ text }}
      </cw-broadcast-tag>
    </div>
  </div>
</template>

<script>
import FilterMixin from '@/mixins/FilterMixin'

export default {
  mixins: [FilterMixin],
  props: {
    source: { type: Object, required: true }
  }
}
</script>
