<template>
  <base-main-card
    :title="$t('nav.categories')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => createSportInterest(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredCategories">
      <template v-slot:item="{ item: category, index }">
        <base-swipe-card
          :title="category.name"
          body-class="sport-interest-item-content"
          :hide-remove="category.onlyForGymId !== null"
          :hide-edit="category.onlyForGymId !== null"
          class="relative"
          @click="getIndex(index, true)"
          @remove="confirmDelete(category)"
          @edit="openEditModal(category)"
        >
          <template #header>
            <div class="flex justify-between">
              <h3 class="text-lg">
                {{ category.name }}
              </h3>
              <button
                v-show="
                  isExpanded[index] &&
                    category.colors.length &&
                    category.sizes.length
                "
                @click.stop="getIndex(index, false)"
              >
                <base-icon :name="'chevron-up'" />
              </button>
            </div>
          </template>
          <div v-if="category.parentId" class="text-gray-500">
            {{
              getCategory(category.parentId)
                ? getCategory(category.parentId)["name"]
                : ""
            }}
          </div>

          <div v-show="isExpanded[index]" class="mt-2">
            <div v-if="category.colors && category.colors.length">
              <base-chip
                v-for="(item, colorIndex) in category.colors"
                :key="colorIndex"
                dismissible
                class="mr-1"
              >
                {{ item.name }}
              </base-chip>
            </div>

            <div v-if="category.sizes && category.sizes.length" class="mt-2">
              <base-chip
                v-for="(item, sizeIndex) in category.sizes"
                :key="sizeIndex"
                dismissible
                class="mr-1"
              >
                {{ item.name }}
              </base-chip>
            </div>
          </div>

          <div
            v-if="category.onlyForGymId !== null"
            :class="{
              private: category.onlyForGymId !== null,
            }"
            class="flex justify-center items-center"
          >
            <h1
              class="underline text-black mr-1"
              @click="openEditModal(category, 'manage')"
            >
              MANAGE
            </h1>
            <base-icon name="play" class="text-black" />
          </div>

          <template #footer>
            <cw-translations-status
              :translations="category.translations"
            />

            <div class="profiles-number text-white inline-flex items-center">
              <base-icon name="product" size="14" class="mr-1 text-white" />
              10.001
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-categories-modal ref="categoriesModal" />
  </base-main-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Categories',
  async fetch () {
    await Promise.all([
      this.getColors(),
      this.getSizes(),
      this.getCategories(),
      this.getLanguages()
    ])
  },
  data () {
    return {
      keywords: '',
      isSearchOpened: false,
      isExpanded: []
    }
  },
  computed: {
    ...mapGetters({
      categories: 'product/categories',
      getCategory: 'product/getCategory',
      languages: 'settings/languages'
    }),
    filteredCategories () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        const allCategories = this.categories.filter((category) => {
          const translation = Object.values(category.translations)
          return (
            category.name.toLowerCase().includes(keywords) ||
            translation.some(
              trans => trans && trans.toLowerCase().includes(keywords)
            )
          )
        })
        return this.$utils.sortBy(allCategories, 'name')
      }

      return this.sortCategories([...this.categories] || [])
    }
  },
  watch: {
    categories: {
      handler () {
        this.isExpanded = Array(this.categories?.length).fill(false)
      }
    }
  },
  methods: {
    confirmDelete ({ _id, name }) {
      this.$confirm(
        {
          text: this.$t('color.confirm_remove', { name })
        },
        () => {
          this.deleteCategory({ categoryId: _id }).then((response) => {
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
    openEditModal (category, payload) {
      // const isParent = this.categories.some(s => s.parentId === category._id)
      this.$refs.categoriesModal.show(category, payload)
    },
    createSportInterest () {
      this.$refs.categoriesModal.show()
    },

    // Sort sports by parent and by name
    sortCategories (category) {
      const allCategories = this.$utils.sortBy(category, 'name')
      const categoryObject = {}
      const list = []

      allCategories.forEach((category) => {
        if (category.parentId) {
          if (categoryObject[category.parentId]) {
            categoryObject[category.parentId].push(category)
          } else {
            categoryObject[category.parentId] = [category]
          }
        } else {
          list.push(category)
        }
      })

      const allData = []

      list.forEach((element) => {
        allData.push(element)

        if (categoryObject[element._id]) {
          allData.push(...categoryObject[element._id])
        }
      })

      return allData
    },
    ...mapActions({
      getCategories: 'product/getCategories',
      getColors: 'product/getColors',
      deleteCategory: 'product/deleteCategory',
      getSizes: 'product/getSizes',
      getLanguages: 'settings/getLanguages'
    }),
    getIndex (index, payload) {
      this.$set(this.isExpanded, index, payload)
    }
  },
  head () {
    return {
      title: this.$t('nav.categories')
    }
  }
}
</script>
<style scoped>
.private {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  opacity: 0.9;
  transition: 0.5s ease;
  background-color: white;
}
</style>
