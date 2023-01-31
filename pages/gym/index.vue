<template>
  <base-main-card
    :title="$t('nav.gym')"
    :actions="actions"
    :items="filteredGyms"
    :item-text="getItemText"
  >
    <template #action:filter>
      <base-icon :name="nonActiveOnly ? 'filter-active' : 'filter-inactive'" size="48" />
    </template>

    <template #default="{ items }">
      <base-card-list-container :items="items">
        <template #item="{ item }">
          <cw-gym-swipe-card
            :gym="item"
            :group="groups[item._id]"
            @edit="showModal(item)"
            @suspend="confirmSuspendGym(item)"
            @remove="confirmRemoveGym(item)"
            @activate="activateGym(item)"
          />
        </template>
      </base-card-list-container>

      <cw-gym-modal ref="modal" />
    </template>
  </base-main-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  layout: 'business',
  meta: {
    permission: 'gym.read'
  },
  async fetch () {
    await this.fetchGyms()
  },
  data () {
    return {
      nonActiveOnly: false
    }
  },
  computed: {
    ...mapState('profile', ['gyms']),

    canAddGym () {
      return !!this.$auth.user?.permission?.gym?.create
    },

    actions () {
      return [
        {
          name: 'filter',
          tooltip: 'Filter',
          handler: () => {
            this.nonActiveOnly = !this.nonActiveOnly
          }
        },
        this.canAddGym
          ? {
            name: 'add',
            icon: 'add',
            tooltip: this.$t('global.action_add_tooltip'),
            handler: () => this.showModal()
          }
          : null
      ].filter(Boolean)
    },

    filteredGyms () {
      return this.nonActiveOnly ? this.gyms.filter(g => g.status !== 'active') : this.gyms
    },

    groups () {
      // { [gym._id]: headquaters[headquater._id] }
      const output = {}

      // { [gym._id]: gym }
      const gymByIds = {}

      // { parent: headquater, children: gym[] }
      const headquaters = {}

      for (const gym of this.gyms) {
        gymByIds[gym._id] = gym
      }

      for (const gym of this.gyms) {
        const parent = gymByIds[gym.parentId]
        if (parent) {
          const headquaterId = parent.parentId || parent._id
          const headquater = gymByIds[headquaterId]
          if (headquater) {
            if (!headquaters[headquaterId]) {
              headquaters[headquaterId] = { parent: headquater, children: [gym] }
            } else {
              headquaters[headquaterId].children.push(gym)
            }
            output[gym._id] = headquaters[headquaterId]
          }
        } else {
          output[gym._id] = headquaters[gym._id] = headquaters[gym._id] || { parent: gym, children: [] }
        }
      }

      return output
    }
  },
  methods: {
    ...mapActions('profile', ['fetchGyms', 'mutateGym', 'removeGym', 'changeCompanyStatus', 'reactivateGym']),

    getItemText (item) {
      const { name, brand, vat, fiscal, pec, mobiles: [mobile] = [], address } = item
      return [
        name,
        brand,
        pec,
        vat && (vat.coutryCode + vat.value),
        fiscal && (fiscal.countryCode + fiscal.value),
        mobile && (mobile.prefixNumber + mobile.phoneNumber),
        address && address.fulladdress
      ].filter(Boolean).join('   ')
    },

    async showModal (gym) {
      const gymDetail = gym?._id && await this.$repos.profileRepo.getGymById(gym._id)
      this.$refs.modal.show(gymDetail)
    },

    confirmSuspendGym (gym) {
      this.$confirm(this.$t('gym.confirm.suspend'), () => {
        this.changeCompanyStatus({ id: gym._id, status: 'suspended' })
      })
    },

    confirmRemoveGym (gym) {
      this.$confirm(this.$t('gym.confirm.remove'), () => {
        this.removeGym(gym)
      })
    },

    activateGym (gym) {
      this.reactivateGym(gym._id)
    }
  }
}
</script>
