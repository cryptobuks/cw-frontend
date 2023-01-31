<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col px-4 py-4 h-profile-body bg-white',
      hideSearch: true,
      title: $t('contract.type.collaborations')
    }"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        profile,
        previousPage: `${$attrs.previousPage}/collaborations`
      }"
    />
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <span
          v-if="!searchExpanded"
          class="inline-flex items-center h-10 border-t boder-b border-white box-content"
        >
          {{ collaborators.length }} {{ $t('global.active') }}
          {{ $t('authorization.entities.collaborator.label') }}
        </span>

        <base-advanced-filter
          v-else
          v-model="filters"
          border
          sm
          autofocus
          v-bind="{
            textOption: {
              attr: 'search',
              label: $t('global.search_by', { name: $t('global.name') }),
              tooltip: $t('global.search_by', { name: $t('global.name') })
            },
            selectOption: [
              {
                attr: 'status',
                items: [
                  { text: $t('global.active'), value: 'active' },
                  { text: $t('global.suspended'), value: 'suspended' }
                ],
                label: `${$t('global.active')} / ${$t('global.suspended')}`,
                placeholder: $t('filters.label.select_active_or_suspended'),
                tooltip: $t('filters.label.select_active_or_suspended')
              }
            ]
          }"
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

      <base-swipe-card
        v-for="collaborator in collaborators"
        :key="`collaboration-${collaborator._id}`"
        auto-height
        bg-color="white"
        container-class="text-black"
        class="shadow-cw-card"
        toggler-class="text-black"
      >
        <div class="flex h-full">
          <nuxt-link
            :to="`${$route.path}/${collaborator._id}/user/profile-info`"
            class="h-16 w-16"
          >
            <img
              :src="$utils.getAvatarUrl(collaborator.avatar)"
              :alt="collaborator.displayName"
              class="rounded-full"
            >
          </nuxt-link>
          <div class="flex flex-col ml-3 w-full">
            <div class="flex items-center justify-between">
              <nuxt-link
                class="font-extrabold text-sm"
                :to="`/chat/${collaborator._id}/business/profile-info?from=${$route.path}`"
              >
                {{ collaborator.displayName }}
              </nuxt-link>

              <span class="text-green uppercase text-sm font-bold mr-4">
                {{ $t('global.active') }}
              </span>
            </div>
            <div class="flex flex-col text-xs space-y-1">
              <div
                v-for="(role, roleIndex) in collaborator.role"
                :key="roleIndex + role"
                class="flex items-center text-green"
                :class="[!!role ? 'text-green' : 'text-red']"
              >
                <nuxt-link
                  :to="`${$attrs.previousPage}/role-characteristics`"
                  class="w-24"
                >
                  {{ $t(`roles.${role}`) }}
                </nuxt-link>
                <span v-if="false">
                  <!-- {{ role.expiry }}-{{ role.status }} -->
                </span>
              </div>
            </div>
          </div>
        </div>
      </base-swipe-card>
    </div>
  </base-main-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    filters: {
      search: '',
      status: []
    },
    searchExpanded: false,
    tabs: [
      { title: 'Active', active: true },
      { title: 'Expired', active: false }
    ]
  }),
  computed: {
    ...mapState('profile', ['managedProfiles']),
    collaborators () {
      return this.managedProfiles.filter(
        profile =>
          profile.isBusiness &&
          profile.displayName
            .toLowerCase()
            .match(this.filters.search.toLowerCase())
      )
    }
  }
}
</script>
