<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-full',
      title: $t('profile.entities.relationships'),
    }"
    v-on="$listeners"
  >
    <base-card-loading v-if="loading" />
    <div v-else>
      <div class="bg-white px-3 flex flex-col">
        <div
          v-for="relationship in activeRelationships"
          :key="relationship.name"
          class="flex items-center justify-between border-b py-4"
        >
          <div class="flex items-center">
            <span class="font-bold">{{ relationship.name }}:</span>
            <div class="flex items-center flex-wrap ml-2 space-x-1 space-y-1">
              <nuxt-link
                v-for="(person, personIndex) in relationship.people"
                :key="`person-${personIndex}`"
                :to="
                  $auth.isBusiness()
                    ? `/chat/${$auth.user._id}/business/contracts/role/${relationship.role}?from=${$route.path}`
                    : $route.path
                "
                class="bg-gray-800 rounded-md text-white px-2 py-1 flex items-center text-xs"
              >
                {{ person }}
              </nuxt-link>
            </div>
          </div>
          <base-icon
            v-if="relationship.action"
            :name="relationship.action.icon"
            size="20"
          />
        </div>
      </div>

      <cw-profile-section-item v-bind="action" @click="addProfile" />
      <cw-add-relationship-modal
        ref="modal"
        v-bind="{
          action,
          profile,
        }"
      />
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    loading: true
  }),
  computed: {
    action () {
      const actionMap = {
        IN: {
          title: this.$t('profile.actions.add_tutored'),
          type: 'IN',
          role: 'TTD'
        },
        TU: {
          title: this.$t('profile.actions.add_tutor'),
          type: 'TU',
          role: 'TT'
        },
        CO: {
          title: this.$t('profile.actions.add_referent'),
          type: 'RE',
          role: 'RE'
        }
      }
      return { ...actionMap[this.profile.typeCode], icon: 'person' }
    },
    activeRelationships () {
      return this.relationships.filter(
        relationship => relationship.people.length > 0
      )
    },
    relationships () {
      return [
        {
          name: this.$t('roles.of', { role: this.$t('roles.TT') }),
          people: [],
          role: 'TT'
        },
        {
          name: this.$t('roles.of', { role: this.$t('roles.RE') }),
          people: [],
          role: 'RE'
        },
        {
          name: this.$t('global.my', { name: this.$t('roles.SP') }),
          people: [],
          role: 'SP',
          action: { icon: 'rotate-cw' }
        },
        {
          name: this.$t('global.my', { name: this.$t('roles.CT') }),
          people: [],
          role: 'CT',
          action: { icon: 'person' }
        },
        {
          name: this.$t('global.my', { name: this.$t('roles.PT') }),
          people: [],
          role: 'PT',
          action: { icon: 'person' }
        }
      ]
    }
  },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      handler () {
        this.getRelationships()
      }
    }
  },
  methods: {
    addProfile () {
      this.$refs.modal.show()
    },
    async getRelationships () {
      this.loading = true
      const people = await this.$repos.profileRepo.individual.getRelationships(
        this.profile._id
      )

      for (const person of people) {
        for (const role of person.roles) {
          const relationship = this.relationships.find(
            relationship => relationship.role === role.role
          )
          if (relationship) {
            relationship.people.push(
              `${person.person.firstname} ${person.person.lastname || ''}`
            )
          }
        }
      }
      this.loading = false
    }
  }
}
</script>
