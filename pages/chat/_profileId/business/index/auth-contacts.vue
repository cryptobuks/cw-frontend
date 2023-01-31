<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions: [
        {
          icon: 'add',
          tooltip: $t('global.action_add_tooltip'),
          handler: () => $refs.modal && $refs.modal.show(),
        },
      ],
      bodyClass: `flex flex-col h-full ${!loading ? 'bg-white p-4' : ''}`,
      hideSearch: true,
      title: $t('profile.entities.auth_contacts'),
    }"
    v-on="$listeners"
  >
    <cw-assign-role-modal
      ref="modal"
      :company-id="profile._id"
      :hidden-profiles-id="businessUsers.map((user) => user._id)"
    />

    <base-card-loading v-if="loading" />
    <nuxt-child
      v-if="!loading"
      v-bind="{
        ...$attrs,
        businessUsers,
        previousPage: `${$attrs.previousPage}/auth-contacts`,
        profile,
        unassignedContacts,
      }"
      @updated="getContacts(profile._id)"
    />
    <div v-if="!loading" class="space-y-4 h-full">
      <div class="flex items-center justify-between">
        <span
          v-if="!searchExpanded"
          class="inline-flex items-center h-10 border-t boder-b border-white box-content"
        >
          {{ businessUsers.length }} {{ $t("global.active") }}
          {{ $t("authorization.entities.collaborator.label") }}
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
              tooltip: $t('global.search_by', { name: $t('global.name') }),
            },
            selectOption: [
              {
                attr: 'status',
                items: [
                  { text: $t('global.active'), value: 'active' },
                  { text: $t('global.suspended'), value: 'suspended' },
                ],
                label: `${$t('global.active')} / ${$t('global.suspended')}`,
                placeholder: $t('filters.label.select_active_or_suspended'),
                tooltip: $t('filters.label.select_active_or_suspended'),
              },
            ],
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
      <div v-if="displayedUsers.length > 0" class="space-y-3">
        <base-swipe-card
          v-for="user in displayedUsers"
          :key="`cw-auth-contacts-${user._id}`"
          auto-height
          bg-color="white"
          container-class="text-black"
          class="shadow-cw-card"
          :actions="swipeActions"
          toggler-class="text-black"
        >
          <div class="flex h-full">
            <nuxt-link
              :to="
                canView(user)
                  ? `${$route.path}/${user._id}/user/profile-info`
                  : $route.path
              "
              class="h-12 w-12 cursor-pointer"
            >
              <img
                :src="$utils.getAvatarUrl(user.avatar)"
                :alt="user.displayName"
                class="rounded-full"
              >
            </nuxt-link>
            <div class="flex flex-col justify-between ml-3 w-full">
              <div
                class="flex flex-col h-full justify-between focus:outline-none"
              >
                <div class="flex items-center justify-between">
                  <nuxt-link
                    :to="
                      canView(user)
                        ? `/chat/${user._id}/user/profile-info?from=${$route.path}`
                        : $route.path
                    "
                    class="text-sm font-bold focus:outline-none"
                  >
                    {{ user.displayName }}
                  </nuxt-link>
                  <span class="text-green uppercase text-sm font-bold mr-6">
                    {{ $t("global.active") }}
                  </span>
                </div>
                <div>
                  <div v-if="user.status !== 'expired'" class="flex">
                    <nuxt-link
                      v-for="(role, roleIndex) in user.roles"
                      :key="`contact-${user._id}-${role.role}`"
                      class="text-xs text-gray-500 inline focus:outline-none ml-1"
                      :to="`/chat/${profile._id}/business/contracts/role/${role.role}?from=${$route.path}`"
                    >
                      {{ $t(`roles.${role.role}`) }}
                      {{ user.roles.length - 1 > roleIndex ? " | " : "" }}
                    </nuxt-link>
                  </div>
                  <base-multiple-avatars
                    v-if="user.assigned.length"
                    :avatars="
                      user.assigned.map((contact) =>
                        $utils.getAvatarUrl(contact.avatar)
                      )
                    "
                    size="xs"
                    class="mt-3"
                    @click="$router.push(`${$route.path}/${user._id}`)"
                  />
                </div>
              </div>
              <div
                v-if="user.logs"
                class="flex flex-col space-y-1 text-xs text-gray-500 mt-2 cursor-pointer"
                @click="user.openLogs = !user.openLogs"
              >
                <div
                  v-for="(log, logIndex) in user.openLogs
                    ? user.logs
                    : user.logs.slice(0, 1)"
                  :key="`${user._id}-role-logs-${logIndex}`"
                  class="flex justify-between items-center"
                >
                  <span>{{ log.role }}</span>
                  <span class="ml-5">{{ log.from }} - {{ log.to }}</span>
                </div>
              </div>
            </div>
          </div>
        </base-swipe-card>
      </div>
      <div v-else class="mt-3 flex justify-center items-center">
        <h5 class="font-extrabold">
          {{ $t("card.search_empty") }}
        </h5>
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } },
  data: () => ({
    filters: {
      keywords: '',
      status: []
    },
    businessUsers: [],
    loading: true,
    searchExpanded: false,
    unassignedContacts: []
  }),
  computed: {
    ...mapState('profile', ['roles']),
    displayedUsers () {
      return this.businessUsers.filter(
        user =>
          (this.filters.status.includes(user.status) ||
            this.filters.status.length < 1) &&
          user.displayName
            .toLowerCase()
            .match(this.filters.keywords.toLowerCase())
      )
    },
    swipeActions () {
      return [
        { icon: 'pause' },
        { icon: 'bin', color: '#fff', bgColor: 'red' }
      ]
    },
    tabs () {
      return [
        { title: `Accepted (${this.displayedUsers.length})`, name: 'active' },
        {
          title: `Expired (${
            this.businessUsers.length - this.displayedUsers.length
          })`,
          name: 'expired'
        }
      ]
    }
  },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      async handler (profile) {
        this.loading = true
        await this.getContacts(profile._id)
        this.loading = false
      }
    }
  },
  methods: {
    canView (user) {
      return user.roles
        .map(role => role.role)
        .some(role => ['CT', 'PT', 'SP', 'TR'].includes(role))
    },
    async getBusinessUsers (profileId) {
      const businessUsers = await this.$repos.contactsRepo.getBusinessUsers(
        profileId
      )
      this.businessUsers = businessUsers.map((user) => {
        let status = 'expired'
        const roles = []
        for (const role of user.roles) {
          roles.push({
            ...role,
            ...this.roles.find(r => r.value === role.role)
          })
          if (role.status !== 'expired') {
            status = 'active'
          }
        }
        return { ...user, roles, status, openLogs: false }
      })
    },
    async getUnassignedContacts (profileId) {
      this.unassignedContacts = await this.$repos.contactsRepo.getUnassignedContacts(
        profileId
      )
    },
    async getContacts (profileId) {
      const promises = [this.getUnassignedContacts(profileId)]
      if (this.$auth.isBusiness()) { promises.push(this.getBusinessUsers(profileId)) }
      await Promise.all(promises)
    }
  }
}
</script>
