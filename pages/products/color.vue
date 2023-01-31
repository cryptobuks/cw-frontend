<template>
  <base-main-card
    :title="$t('nav.colors')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => createColor(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredColors">
      <template #item="{ item: sport }">
        <base-swipe-card
          :title="sport.name"
          body-class="sport-interest-item-content"
          :hide-remove="
            filteredColors.filter((s) => s.parentId === sport._id).length > 0
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
            <cw-translations-status
              :translations="sport.translations"
            />

            <div class="profiles-number text-white inline-flex items-center">
              <base-icon name="product" size="14" class="mr-1 text-white" />
              10.001
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-colors-modal ref="colorModal" />
  </base-main-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Colors',
  data () {
    return {
      keywords: '',
      isSearchOpened: false
    }
  },
  computed: {
    ...mapGetters({
      colors: 'product/colors',
      languages: 'settings/languages'
    }),
    filteredColors () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        const colors = this.colors.filter((color) => {
          const translation = Object.values(color.translations)
          return (
            color.name.toLowerCase().includes(keywords) ||
            translation.some(
              trans => trans && trans.toLowerCase().includes(keywords)
            )
          )
        })
        return this.$utils.sortBy(colors, 'name')
      }

      return this.sortColors([...this.colors] || [])
    }
  },
  mounted () {
    this.getColors()
    this.getLanguages()
  },
  methods: {
    confirmDelete ({ _id, name }) {
      this.$confirm(
        {
          text: this.$t('color.confirm_remove', { name })
        },
        () => {
          this.deleteColor({ colorId: _id }).then((response) => {
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
      this.$refs.colorModal.show(sport)
    },
    createColor () {
      this.$refs.colorModal.show()
    },

    // Sort sports by parent and by name
    sortColors (colors) {
      const sportsInterest = this.$utils.sortBy(colors, 'name')
      const colorObject = {}
      const list = []

      sportsInterest.forEach((color) => {
        if (color.parentId) {
          if (colorObject[color.parentId]) {
            colorObject[color.parentId].push(color)
          } else {
            colorObject[color.parentId] = [color]
          }
        } else {
          list.push(color)
        }
      })

      const allData = []

      list.forEach((element) => {
        allData.push(element)

        if (colorObject[element._id]) {
          allData.push(...colorObject[element._id])
        }
      })

      return allData
    },
    ...mapActions({
      getColors: 'product/getColors',
      deleteColor: 'product/deleteColor',
      getLanguages: 'settings/getLanguages'
    })
  },
  head () {
    return {
      title: this.$t('nav.colors')
    }
  }
}
</script>
