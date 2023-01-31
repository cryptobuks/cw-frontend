<template>
  <base-modal ref="modal" @done="submit">
    <div class="flex flex-col justify-between max-w-md mx-auto h-full">
      <div class="flex flex-col items-center space-y-10">
        <div class="py-2 w-full bg-white flex justify-center rounded-lg">
          <base-multiple-avatars v-bind="{ avatars, count: 7, size: 'sm' }" />
        </div>
        <span class="text-white font-bold">
          {{ $t("profile.assign_contact.assigned_to") }}
        </span>
        <input
          v-model="keywords"
          type="text"
          :placeholder="$t('profile.assign_contact.search_delegates')"
          class="w-64 bg-white text-gray-600 p-2 rounded"
        >
        <div class="flex flex-col space-y-2 w-full">
          <div
            class="flex justify-between items-center bg-white text-gray-700 p-3 w-full rounded-lg"
          >
            <span class="">
              {{ $t("profile.assign_contact.first_replier") }}
            </span>
            <base-input-check v-model="assignToFirst" />
          </div>
          <div
            v-for="(user, index) in displayedUsers"
            :key="`contact-assign-${index}`"
            class="flex justify-between items-center bg-white text-gray-700 py-3 px-5 w-full rounded-lg"
          >
            <div class="flex space-x-5 items-center">
              <img
                :src="$utils.getAvatarUrl(user.avatar)"
                :alt="user.displayName"
                class="w-10 h-10 rounded-full"
              >
              <span class="text-sm font-bold">{{ user.displayName }}</span>
            </div>
            <base-input-check v-model="assignedTo" :value="user" />
          </div>
        </div>
      </div>
    </div>
    <template #actions>
      <base-button
        :disabled="false"
        :loading="assigning"
        lg
        class="capitalize"
        @click="submit"
      >
        {{ $t("global.assign") }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
export default {
  props: {
    profile: { type: Object, required: true },
    selectedContacts: { type: Array, required: true },
    businessUsers: { type: Array, required: true }
  },
  data: () => ({
    assignedTo: [],
    assigning: false,
    assignToFirst: true,
    keywords: '',
    roles: {
      DI: 'director',
      OP: 'operator',
      TR: 'trainer',
      SA: 'salesman'
    }
  }),
  computed: {
    avatars () {
      return this.selectedContacts.map(contact =>
        this.$utils.getAvatarUrl(contact.avatar)
      )
    },
    displayedUsers () {
      return this.businessUsers.filter(
        user =>
          this.canView(user) &&
          user.displayName.toLowerCase().match(this.keywords.toLowerCase())
      )
    }
  },
  methods: {
    canView (user) {
      const canView = false
      for (const role of ['trainer', 'salesman']) {
        for (const userRole of user.roles) {
          if (role === this.roles[userRole.role]) {
            return true
          }
        }
      }
      return canView
    },
    done () {
      this.assignedTo = []
      this.keywords = ''
      this.assignToFirst = true
      this.$refs.modal.hide()
      this.$emit('done')
    },
    show () {
      this.$refs.modal.show()
    },
    async submit () {
      this.assigning = true
      const profileAssignments = []

      for (const contact of this.selectedContacts) {
        for (const user of this.assignedTo) {
          profileAssignments.push(
            this.$repos.contactsRepo.assignContact({
              gymId: this.profile._id,
              toProfile: user._id,
              profileId: contact._id
            })
          )
        }
      }

      await Promise.all(profileAssignments)
      this.assigning = false
      this.done()
    }
  }
}
</script>

<style></style>
