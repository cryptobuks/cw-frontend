<template>
  <base-main-card
    :actions="actions"
    hide-search
  >
    <!-- Header -->
    <template #title-text>
      <div class="flex items-center font-normal">
        <span class="mr-6">
          {{ $t('product_templates.title') }}
        </span>

        <span v-if="productTemplates.length" class="text-base">
          {{ productTemplates.length }}
        </span>
      </div>
    </template>

    <template #action:advanced-filter>
      <base-advanced-filter
        v-model="filters"
        sync-with-route
        class="w-full max-w-lg"
        :selects-option="filterSelectOptions"
        :text-option="{
          attr: 'text',
          label: 'Search',
          placeholder: 'Name, description, barcode',
          tooltip: 'Search by name, description, barcode'
        }"
      >
        <template #affix>
          <cw-scan-barcode-modal @click.stop @detected="filters.text = $event">
            <template #activator>
              <base-icon name="barcode-scanner" />
            </template>
          </cw-scan-barcode-modal>
        </template>
      </base-advanced-filter>
    </template>

    <!-- Main -->
    <template #default>
      <cw-product-modal ref="modal" is-template />

      <cw-product-pictures-viewer ref="picturesViewer" />

      <base-card-list-container :items="itemsFilteredByText" min-item-width="248">
        <template #item="{ item }">
          <cw-product-swipe-card
            :product="item"
            is-template
            @edit="showModal(item)"
            @view-pictures="$refs.picturesViewer.show($event.pictures)"
            @remove="confirmRemove(item)"
          />
        </template>
      </base-card-list-container>
    </template>
  </base-main-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  auth: 'business',
  fetch ({ store }) {
    return Promise.all([
      store.dispatch('product/getProductTemplates'),
      store.dispatch('product/getCategories'),
      store.dispatch('product/getSizes'),
      store.dispatch('product/getColors'),
      store.dispatch('settings/getLanguages')
    ])
  },
  data () {
    return {
      actions: [
        {
          name: 'advanced-filter'
        },
        {
          icon: 'add',
          tooltip: this.$t('global.action_add_tooltip'),
          handler: () => this.showModal()
        }
      ],

      filters: {
        text: '',
        manufacturers: [],
        categoryIds: [],
        sizeIds: [],
        colorIds: [],
        available: true,
        isActive: true
      }
    }
  },
  computed: {
    ...mapState('product', ['productTemplates', 'categories', 'sizes', 'colors']),

    itemsText () {
      const items = {}
      for (const product of this.productTemplates) {
        items[product._id] = [
          product.name.toLowerCase(),
          product.description.toLowerCase(),
          product.items.map(item => item.barCode).join('  ')
        ].join('  ')
      }
      return items
    },

    itemsFilteredByCategories () {
      const categoryIds = this.filters.categoryIds
      return !categoryIds.length ? this.productTemplates : this.productTemplates.filter(
        p => categoryIds.every(c => p.categoryIds.includes(c))
      )
    },

    itemsFilteredBySizes () {
      const sizeIds = this.filters.sizeIds
      return !sizeIds.length ? this.itemsFilteredByCategories : this.itemsFilteredByCategories.filter(
        p => sizeIds.every(s => p.items.some(item => item.sizeId === s))
      )
    },

    itemsFilteredByColors () {
      const colorIds = this.filters.colorIds
      return !colorIds.length ? this.itemsFilteredByCategories : this.itemsFilteredByCategories.filter(
        p => colorIds.every(c => p.items.some(item => item.sizeId === c))
      )
    },

    itemsFilteredByText () {
      const keyword = this.filters.text?.toLowerCase?.().trim?.()
      return !keyword ? this.itemsFilteredByColors : this.itemsFilteredByColors.filter(
        p => this.itemsText[p._id].includes(keyword)
      )
    },

    filterSelectOptions () {
      return [
        {
          attr: 'manufacturers',
          items: Array.from(new Set(this.productTemplates.map(p => p.manufacturer).filter(Boolean)))
            .map(text => ({ text, value: text })),
          label: 'Manufacturer',
          tooltip: 'Select manufacturer'
        },
        {
          attr: 'categoryIds',
          items: this.categories,
          itemValue: '_id',
          itemText: 'name',
          label: 'Category',
          tooltip: 'Select category'
        },
        {
          attr: 'sizeIds',
          items: this.sizes,
          itemValue: '_id',
          itemText: 'name',
          label: 'Measures',
          tooltip: 'Select measures'
        },
        {
          attr: 'colorIds',
          items: this.colors,
          itemValue: '_id',
          itemText: 'name',
          label: 'Colors/Flavors',
          tooltip: 'Select colors/flavors'
        }
      ]
    }
  },
  methods: {
    showModal (item) {
      this.$refs.modal.show(item)
    },

    confirmRemove (item) {
      this.$confirm('items.remove_confirm', () => {
        this.$store.dispatch('product/deleteProductTemplate', item._id)
      })
    }
  },
  head () {
    return {
      title: this.$t('nav.product_templates')
    }
  }
}
</script>
