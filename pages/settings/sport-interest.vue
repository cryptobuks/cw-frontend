<template>
  <base-main-card
    :title="$t('nav.sport_interest')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => createSportInterest(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredSports">
      <template #item="{ item: sport }">
        <base-swipe-card
          :title="sport.name"
          body-class="sport-interest-item-content"
          :hide-remove="
            filteredSports.filter((s) => s.parentId === sport._id).length > 0
          "
          @remove="confirmDelete(sport)"
          @edit="openEditModal(sport)"
        >
          <div v-if="sport.parentId" class="text-gray-500">
            {{
              getSport(sport.parentId) ? getSport(sport.parentId)["name"] : ""
            }}
          </div>

          <template #footer>
            <cw-translations-status :translations="sport.translations" />

            <div
              v-if="getCount(sport._id)"
              class="profiles-number text-white inline-flex items-center"
            >
              <base-icon name="person" size="14" class="mr-1" />
              {{ getCount(sport._id) }}
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-sport-interest-maker ref="sportInterestMaker" />
  </base-main-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'SportInterest',
  meta: {
    permission: 'settings.sportInterest'
  },
  data () {
    return {
      keywords: '',
      isSearchOpened: false,
      stats: []
    }
  },
  computed: {
    ...mapGetters({
      sportInterests: 'settings/sportInterests',
      getSport: 'settings/getSport',
      languages: 'settings/languages'
    }),
    getCount () {
      return function (id) {
        const count = this.stats.find((item) => {
          return item.sportInterestId === id
        })
        return count?.count
      }
    },
    filteredSports () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        const sports = this.sportInterests.filter((sport) => {
          const translation = Object.values(sport.translations)
          return (
            sport.name.toLowerCase().includes(keywords) ||
            translation.some(
              trans => trans && trans.toLowerCase().includes(keywords)
            )
          )
        })
        return this.$utils.sortBy(sports, 'name')
      }

      return this.sortSports([...this.sportInterests])
    }
  },
  async mounted () {
    this.getSportInterests()
    this.getLanguages()
    this.stats = await this.$repos.statRepo.getSportInterestStats() || []
  },
  methods: {
    confirmDelete (sport) {
      this.$confirm(
        {
          text: this.$t('sport.confirm_remove')
        },
        () => {
          this.deleteSportInterest(sport._id).then((response) => {
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
    openEditModal (sport) {
      const isParent = this.sportInterests.some(
        s => s.parentId === sport._id
      )
      this.$refs.sportInterestMaker.show(sport, isParent)
    },
    createSportInterest () {
      this.$refs.sportInterestMaker.show()
    },

    // Sort sports by parent and by name
    sortSports (sports) {
      const sportsInterest = this.$utils.sortBy(sports, 'name')
      const sportsObject = {}
      const list = []

      sportsInterest.forEach((sport) => {
        if (sport.parentId) {
          if (sportsObject[sport.parentId]) {
            sportsObject[sport.parentId].push(sport)
          } else {
            sportsObject[sport.parentId] = [sport]
          }
        } else {
          list.push(sport)
        }
      })

      const allData = []

      list.forEach((element) => {
        allData.push(element)

        if (sportsObject[element._id]) {
          allData.push(...sportsObject[element._id])
        }
      })

      return allData
    },
    ...mapActions({
      getSportInterests: 'settings/getSportInterests',
      deleteSportInterest: 'settings/deleteSportInterest',
      getLanguages: 'settings/getLanguages'
    })
  }
}
</script>
