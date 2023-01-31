<template>
  <base-main-card
    :title="$t('nav.activities')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => createActivity(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredActivities">
      <template v-slot:item="{ item: activity }">
        <base-swipe-card
          :title="activity.name"
          body-class="sport-interest-item-content"
          class="relative"
          bg-color="gray"
          @remove="confirmDelete(activity)"
          @edit="openEditModal(activity)"
        >
          <template #header>
            <div class="flex justify-between">
              <h3 class="text-lg uppercase">
                {{ activity.name }}
              </h3>
            </div>
          </template>
          <p>
            {{ activity.visibility }}
          </p>
          <div v-if="activity.assets" class="mt-2 flex">
            <span>
              <base-icon name="door" size="20" />
            </span>
            <div class="truncate">
              <span
                v-for="(item, index) in activity.assets"
                :key="index"
                class="text-center p-1 border-r border-white"
              >
                {{ getAsset(item) ? getAsset(item)["name"] : "" }}</span>
            </div>
          </div>
          <div v-if="activity.sports" class="mt-2 flex">
            <span>
              <base-icon name="sports-rotated" size="20" />
            </span>
            <div class="truncate">
              <span
                v-for="(item, index) in activity.sports"
                :key="index"
                class="text-center p-1 border-r border-white"
              >
                {{ getSport(item) ? getSport(item)["name"] : "" }}</span>
            </div>
          </div>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-activity-modal ref="activityModal" />
  </base-main-card>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
export default {
  name: 'Activities',
  async fetch () {
    await Promise.all([
      this.getActivities(),
      this.getGymAssets(this.$auth.user._id),
      this.getSportInterests()
    ])
  },
  data () {
    return {
      keywords: '',
      isSearchOpened: false
    }
  },
  computed: {
    ...mapGetters({
      getAsset: 'calendar/getAsset',
      getSport: 'settings/getSport'
    }),
    ...mapState('calendar', ['activities']),
    filteredActivities () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        return this.activities.filter((category) => {
          return category.name.toLowerCase().includes(keywords)
        })
      }

      return this.activities
    }
  },
  methods: {
    confirmDelete ({ _id, name }) {
      this.$confirm(
        {
          text: this.$t('color.confirm_remove', { name })
        },
        () => {
          this.deleteActivity({ activityId: _id }).then((response) => {
            response.success
              ? this.$notifier.success(response.message)
              : this.$notifier.error(response.message)
          })
        }
      )
    },
    toggleSearchInput () {
      this.isSearchOpened = !this.isSearchOpened
    },
    openEditModal (category) {
      this.$refs.activityModal.show(category)
    },
    createActivity () {
      this.$refs.activityModal.show()
    },

    ...mapActions({
      getActivities: 'calendar/getActivities',
      getGymAssets: 'calendar/getGymAssets',
      getSportInterests: 'settings/getSportInterests',
      deleteActivity: 'calendar/deleteActivity'
    }),
    getIndex (index) {
      this.$set(this.isExpanded, index, !this.isExpanded[index])
    }
  }
}
</script>
<style lang="scss" scoped>
.truncate {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  span:last-child {
    border-right: none;
  }
}
</style>
