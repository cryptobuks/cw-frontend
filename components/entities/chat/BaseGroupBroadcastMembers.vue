<template>
  <div>
    <div class="flex justify-between py-3">
      <div class="flex w-full">
        <cw-profile-avatar
          :src="$utils.getAvatarUrl(source.avatar, 'group')"
          :alt="source.displayName"
          :size="24"
        />
        <div class="text-gray-750 w-full min-w-0 ml-2">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-poppins-bold mr-1 truncate">
              {{ source.displayName }}
            </h3>
            <button v-if="$auth.isBusiness()" class="self-start focus:outline-none" @click="$emit('show-info')">
              <base-icon name="chevron-right" :size="16" class="text-gray-750" />
            </button>
          </div>
          <p class="description">
            {{ source.description || '' }}
          </p>
        </div>
      </div>
    </div>
    <div>
      <div v-if="!hideStatus" class="flex justify-between">
        <span v-if="!searchExpanded" class="inline-flex items-center h-10 border-t boder-b border-white box-content">
          {{ members.length.toLocaleString() }} Participants
        </span>

        <base-advanced-filter
          v-else
          v-model="filters"
          border
          sm
          autofocus
          :text-option="{
            attr: 'name',
            label: 'Search by name',
            tooltip: 'Search by name'
          }"
          :selects-option="[
            {
              attr: 'status',
              items: [
                { text: 'Active', value: 'active' },
                { text: 'Suspended', value: 'suspended' }
              ],
              label: 'Active / Suspended',
              placeholder: 'Select active or suspended',
              tooltip: 'Select active or suspended'
            }
          ]"
          class="flex-grow"
        />

        <span class="inline-flex items-center ml-2 h-10 flex-shrink-0">
          <base-icon
            :name="searchExpanded ? 'dismiss' : 'search'"
            class="cursor-pointer text-gray-600"
            :class="{ 'text-xl mr-1': !searchExpanded }"
            @click="searchExpanded = !searchExpanded"
          />
        </span>
      </div>

      <div class="py-6">
        <div class="space-y-3">
          <cw-group-member-card
            v-for="member in filteredMembers"
            :key="member._id"
            :member="member"
            :hide-status="hideStatus"
            @activate="onMemberActivate"
            @suspend="onMemberSuspend"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    source: { type: Object, required: true },
    members: { type: Array, required: true },
    hideStatus: Boolean,
    onMemberActivate: { type: Function, default: () => {} },
    onMemberSuspend: { type: Function, default: () => {} }
  },

  data: () => ({
    filters: {
      name: '',
      status: []
    },
    searchExpanded: false
  }),

  computed: {
    filteredMembers () {
      let members = this.members
      if (this.filters.name) {
        const text = this.filters.name.toLowerCase().trim()
        members = members.filter(m => m.displayName?.toLowerCase?.().includes?.(text))
      }
      if (this.filters.status.length) {
        const statuses = this.filters.status
        members = members.filter(m => statuses.includes(m.status))
      }
      return members
    }
  }
}
</script>

<style lang="postcss" scoped>
.description {
  @apply text-sm truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 3) and (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.tab {
  @apply w-full;

  &:focus {
    @apply outline-none;
  }

  & span {
    padding-bottom: 2px;
    @apply text-sm text-cw-red font-semibold border-cw-red;
