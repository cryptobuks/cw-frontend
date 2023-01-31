<template>
  <base-main-card
    v-if="user"
    v-bind="{
      ...$attrs,
      actions: [{ name: 'role' }],
      bodyClass: 'flex flex-col h-full bg-white p-4',
      showSearchToggler: true,
      hideSearch: true,
      title: user && user.displayName,
      previousPage: $route.query.prev || $attrs.previousPage,
    }"
    @search="keywords = $event"
    v-on="$listeners"
  >
    <template #action:role>
      <cw-custom-select
        v-if="roles.length > 1"
        v-model="currentRole"
        v-bind="{ items: roles, itemText: (role) => $t(role.text) }"
        class="bg-transparent p-2"
      >
        <template #display="{ data: role }">
          <span class="text-sm">{{ $t(role.text) }}</span>
        </template>
      </cw-custom-select>
      <div v-else />
    </template>
    <div class="space-y-4">
      <base-tabs
        v-model="activeTab"
        v-bind="{ tabs, property: 'name', name: 'title' }"
      />
      <div class="flex justify-between items-center my-2">
        <base-icon name="filter-active" size="30" />
        <base-icon name="filter-inactive" size="35" />
        <base-icon name="filter-inactive" size="35" />
      </div>
      <div
        v-for="contact in displayedContacts"
        :key="`cw-auth-contacts-${contact._id}`"
        class="flex items-center justify-between shadow-cw-card px-4 py-6 rounded-lg"
      >
        <div class="flex">
          <img
            :src="$utils.getAvatarUrl(contact.avatar)"
            :alt="contact.displayName"
            class="h-12 w-12 rounded-full"
          >
          <div class="space-y-2 ml-4">
            <span class="block font-bold text-sm">{{
              contact.displayName
            }}</span>
            <span
              class="text-xs"
              :class="[
                contact.status === 'active'
                  ? 'text-green'
                  : contact.status === 'prospect'
                    ? 'text-blue'
                    : 'text-red',
              ]"
            >
              {{ contact.expires || "prospect" }}
            </span>
          </div>
        </div>
        <base-input-check
          v-model="selectedContacts"
          :value="contact"
          input-key="_id"
        />
      </div>
    </div>
    <template #footer>
      <div class="bg-gray-300 py-1 pr-2 flex items-center">
        <button
          v-if="activeTab === 'assigned' && selectedContacts.length > 0"
          class="py-4 mx-auto bg-white w-16 text-center rounded-lg focus:outline-none"
          @click="unAssignContacts"
        >
          <base-icon name="dismiss" />
        </button>
        <button
          class="ml-3 py-4 mx-auto bg-white w-full text-center rounded-lg focus:outline-none"
          @click="$refs.modal.show()"
        >
          {{ activeTab === "assigned" ? "RE-ASSIGN" : "ASSIGN" }}
        </button>
      </div>
    </template>
    <cw-contact-reassign-modal
      ref="modal"
      v-bind="{ businessUsers, profile, selectedContacts }"
      @done="contactsUpdated"
    />
  </base-main-card>
</template>

<script>
export default {
  props: {
    businessUsers: { type: Array, required: true },
    profile: { type: Object, required: true },
    unassignedContacts: { type: Array, required: true }
  },
  data: () => ({
    activeTab: 'assigned',
    currentRole: null,
    keywords: '',
    selectedContacts: []
  }),
  computed: {
    displayedContacts () {
      if (!this.user) {
        return []
      }
      const contacts =
        this.activeTab === 'assigned'
          ? this.user.assigned
          : this.unassignedContacts
      return contacts.filter(contact =>
        contact.displayName.toLowerCase().match(this.keywords.toLowerCase())
      )
    },
    tabs () {
      return [
        { title: `Assigned (${this.user.assigned.length})`, name: 'assigned' },
        { title: 'Others', name: 'others' }
      ]
    },
    user () {
      return this.businessUsers.find(
        user => user._id === this.$route.params.authContactId
      )
    },
    roles () {
      return (
        this.user?.roles.filter(role => ['SA', 'TR'].includes(role.value)) ||
        []
      )
    }
  },
  watch: {
    roles: {
      immediate: true,
      deep: true,
      handler (roles) {
        [this.currentRole] = roles
      }
    }
  },
  methods: {
    contactsUpdated () {
      this.selectedContacts = []
      this.$emit('updated')
    },
    unAssignContacts () {
      this.$confirm(
        `${this.$t('profile.actions.unassign_contacts')}?`,
        async () => {
          const unassignments = []
          for (const contact of this.selectedContacts) {
            unassignments.push(
              this.$repos.contactsRepo.unassignProfile({
                gymId: this.profile._id,
                toProfile: this.user._id,
                profileId: contact._id
              })
            )
          }
          await Promise.all(unassignments)
          this.contactsUpdated()
        }
      )
    }
  }
}
</script>
