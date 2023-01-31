<template>
  <base-main-card
    :title="$t('nav.measures')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => createProductSize(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredSize">
      <template #item="{ item: size }">
        <base-swipe-card
          :title="size.name"
          body-class="sport-interest-item-content"
          :hide-remove="
            filteredSize.filter((s) => s.parentId === size._id).length > 0
          "
          @remove="confirmDelete(size)"
          @edit="openEditModal(size)"
        >
          <div v-if="size.parentId" class="text-gray-500">
            {{ getSport(size.parentId) ? getSport(size.parentId)["name"] : "" }}
          </div>

          <template #footer>
            <cw-translations-status
              :translations="size.translations"
            />

            <div class="profiles-number text-white inline-flex items-center">
              <base-icon name="product" size="14" class="mr-1 text-white" />
              10.001
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-measure-modal ref="colorModal" />
  </base-main-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Size',
  data () {
    return {
      keywords: '',
      isSearchOpened: false
    }
  },
  computed: {
    ...mapGetters({
      sizes: 'product/sizes',
      languages: 'settings/languages'
    }),
    filteredSize () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        const sizes = this.sizes.filter((size) => {
          const translation = Object.values(size.translations)
          return (
            size.name.toLowerCase().includes(keywords) ||
            translation.some(
              trans => trans && trans.toLowerCase().includes(keywords)
            )
          )
        })
        return this.$utils.sortBy(sizes, 'name')
      }

      return this.sortSizes([...this.sizes] || [])
    }
  },
  mounted () {
    this.getSizes()
    this.getLanguages()
  },
  methods: {
    confirmDelete ({ name, _id }) {
      this.$confirm(
        {
          text: this.$t('measure.confirm_remove', { name })
        },
        () => {
          this.deleteSize({ sizeId: _id }).then((response) => {
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
    openEditModal (size) {
      this.$refs.colorModal.show(size)
    },
    createProductSize () {
      this.$refs.colorModal.show()
    },

    // Sort sports by parent and by name
    sortSizes (sizes) {
      const allSizes = this.$utils.sortBy(sizes, 'name')
      const sizeObject = {}
      const list = []

      allSizes.forEach((sport) => {
        if (sport.parentId) {
          if (sizeObject[sport.parentId]) {
            sizeObject[sport.parentId].push(sport)
          } else {
            sizeObject[sport.parentId] = [sport]
          }
        } else {
          list.push(sport)
        }
      })

      const allData = []

      list.forEach((element) => {
        allData.push(element)

        if (sizeObject[element._id]) {
          allData.push(...sizeObject[element._id])
        }
      })

      return allData
    },
    ...mapActions({
      getSizes: 'product/getSizes',
      deleteSize: 'product/deleteSize',
      getLanguages: 'settings/getLanguages'
    })
  },
  head () {
    return {
      title: this.$t('nav.measures')
    }
  }
}
</script>
