<template>
  <div>
    <base-select
      v-if="!value"
      v-bind="$attrs"
      :value="value"
      :items="
        suggestedProfiles
          .concat(newProfile ? [newProfile] : [])
          .concat(isDirector ? { displayName: $t('input.individual_profile.new_contact') } : [])
      "
      item-text="displayName"
      item-value="_id"
      v-on="$utils.except($listeners, 'input')"
      @item-select="onProfileSelected"
    />

    <template v-else-if="selectedProfile">
      <div
        v-if="$attrs.label"
        :tabindex="$attrs.tabindex || 0"
        class="flex items-center text-xl focus:opacity-100 mb-4"
        :class="{
          'opacity-50': ($attrs.inactive || !value) && !$attrs.active,
        }"
      >
        <label class="mr-5 uppercase cursor-default">{{ $attrs.label }}</label>

        <base-icon v-if="$attrs.tooltip" v-tippy="$attrs.tooltip" name="question-circle" />

        <base-icon
          v-if="!value && $attrs.listeners && $attrs.listeners.skip"
          name="skip"
          class="ml-auto"
          @click.native="$attrs.listeners.skip($event)"
        />
      </div>

      <base-swipe-card
        :title="selectedProfile.displayName"
        bg-color="#404040"
        auto-height
        class="mb-4"
        hide-edit
        @remove="setProfile(null)"
      />
    </template>

    <assign-role-modal
      v-if="isDirector"
      ref="roleModal"
      role="SP"
      :company-id="gym && gym._id"
      :countr-code="countryCode"
      :hidden-profiles-id="suggestedProfiles.map(p => p._id)"
      @done="onRoleModalDone"
    />
  </div>
</template>

<script>
export default {
  components: {
    AssignRoleModal: () => import('~/components/entities/role/AssignRoleModal')
  },
  inheritAttrs: false,
  props: {
    // cwSalesman profile._id or profile
    value: { type: [Object, String], default: null },
    countryCode: { type: String, default: null },
    gym: { type: Object, required: true }
  },
  data () {
    return {
      suggestedProfiles: [],
      newProfile: null,
      searchText: ''
    }
  },
  computed: {
    selectedProfile () {
      const id = this.value?._id
      return id
        ? id === this.newProfile?._id
          ? this.newProfile
          : this.suggestedProfiles.find(p => p._id === id)
        : null
    },

    isDirector () {
      return this.$auth.user?.roles?.includes('DI')
    }
  },
  watch: {
    'gym._id': {
      immediate: true,
      async handler (gymId) {
        this.suggestedProfiles = gymId
          ? await this.$repos.contactsRepo.getBusinessUsers(gymId)
            .then(profiles => profiles.filter(p => p.roles?.some(r => r.role === 'SP')))
          : []

        const id = this.value?._id || this.value
        const profile = id && this.suggestedProfiles.find(p => p._id === id)
        this.$emit('input', profile || null)
      }
    }
  },
  methods: {
    onProfileSelected (profile) {
      if (profile?._id) {
        this.setProfile(profile)
      } else {
        this.showProfileModal()
      }
    },

    showProfileModal (_id) {
      this.$refs.roleModal.show()
    },

    onRoleModalDone (role) {
      this.setProfile({
        _id: role.profile._id,
        displayName: role.profile.displayName,
        startAt: role.startAt,
        endAt: role.endAt
      })
    },

    setProfile (profile = null) {
      const newProfile = profile && {
        _id: profile._id,
        displayName: profile.displayName,
        startAt: profile.startAt,
        endAt: profile.endAt
      }

      if (profile) {
        const existingProfile = this.suggestedProfiles.find(p => p._id === profile._id)
        if (!existingProfile) {
          if (this.gym?._id) {
            this.suggestedProfiles.push(newProfile)
          } else {
            this.newProfile = newProfile
          }
        }
      }

      this.$emit('input', newProfile || null)
    }
  }
}
</script>
