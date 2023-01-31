<template>
  <base-main-card
    :actions="actions"
    hide-search
  >
    <!-- Header -->
    <template #title-text>
      <div class="flex items-center">
        <span class="mr-4">
          {{ $t('nav.products') }}
        </span>

        <div class="text-base font-normal">
          <span>
            <!-- Number of available all listed product items -->
            {{ products.reduce((sum, p) => sum + p.items.filter(item => item.isActive).length, 0).toLocaleString() }}
          </span>
          <span> | </span>
          <span class="text-red">
            <!-- Number of out of stock product items -->
            {{ products.reduce((sum, p) => sum + p.items.filter(item => !item.quantity), 0).toLocaleString() }}
          </span>
          <span> {{ $t('products.out_of_stock') }} </span>
        </div>
      </div>
    </template>

    <template #action:advanced-filter>
      <base-advanced-filter
        v-model="filters"
        sync-with-route
        class="min-h-full w-full max-w-lg"
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

    <template #action:available>
      <span
        class="text-3xl p-2 rounded-lg flex"
        :class="[filters.available === true ? 'bg-red text-white' : 'bg-white text-black']"
      >
        <base-icon name="product-available" />
      </span>
    </template>

    <template #action:unavailable>
      <span
        class="text-3xl p-2 rounded-lg flex -ml-3"
        :class="[filters.available === false ? 'bg-red text-white' : 'bg-white text-black']"
      >
        <base-icon name="product-unavailable" />
      </span>
    </template>

    <template #action:delisted>
      <span
        class="text-3xl p-2 rounded-lg flex -ml-3"
        :class="[filters.isActive === false ? 'bg-red text-white' : 'bg-white text-black']"
      >
        <base-icon name="product-delisted" />
      </span>
    </template>

    <!-- Main -->
    <template #default>
      <cw-product-modal ref="modal" />

      <cw-product-pictures-viewer ref="picturesViewer" />

      <base-card-list-container :items="productsFilteredByText" min-item-width="248">
        <template #item="{ item: product }">
          <cw-product-swipe-card
            :product="product"
            @edit="showProductModal(product)"
            @view-pictures="$refs.picturesViewer.show($event.pictures)"
            @remove="confirmRemoveProduct(product)"
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
      store.dispatch('product/getProducts'),
      store.dispatch('product/getCategories'),
      store.dispatch('product/getSizes'),
      store.dispatch('product/getColors')
    ])
  },
  data () {
    return {
      actions: [
        {
          name: 'advanced-filter'
        },
        {
          name: 'available',
          tooltip: this.$t('products.status.available'),
          handler: () => this.setFilter({ available: true })
        },
        {
          name: 'unavailable',
          tooltip: this.$t('products.status.unavailable'),
          handler: () => this.setFilter({ available: false })
        },
        {
          name: 'delisted',
          tooltip: this.$t('products.status.delisted'),
          handler: () => this.setFilter({ isActive: false })
        },
        {
          icon: 'add',
          tooltip: this.$t('global.action_add_tooltip'),
          handler: () => this.showProductModal()
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
    ...mapState('product', ['products', 'categories', 'sizes', 'colors']),

    productsText () {
      const products = {}
      for (const product of this.products) {
        products[product._id] = [
          product.name.toLowerCase(),
          product.description.toLowerCase(),
          product.items.map(item => item.barCode).join('  ')
        ].join('  ')
      }
      return products
    },

    productsFilteredByIsActive () {
      const isActive = this.filters.isActive
      return this.products.filter(p => p.isActive === isActive)
    },

    productsFilteredByAvailability () {
      const available = this.filters.available
      return available === undefined
        ? this.productsFilteredByIsActive
        : available
          ? this.productsFilteredByIsActive.filter(p => p.items.some(item => item.quantity))
          : this.productsFilteredByIsActive.filter(p => !p.items.some(item => item.quantity))
    },

    productsFilteredByCategories () {
      const categoryIds = this.filters.categoryIds
      return !categoryIds.length ? this.productsFilteredByAvailability : this.productsFilteredByAvailability.filter(
        p => categoryIds.every(c => p.categoryIds.includes(c))
      )
    },

    productsFilteredBySizes () {
      const sizeIds = this.filters.sizeIds
      return !sizeIds.length ? this.productsFilteredByCategories : this.productsFilteredByCategories.filter(
        p => sizeIds.every(s => p.items.some(item => item.sizeId === s))
      )
    },

    productsFilteredByColors () {
      const colorIds = this.filters.colorIds
      return !colorIds.length ? this.productsFilteredByCategories : this.productsFilteredByCategories.filter(
        p => colorIds.every(c => p.items.some(item => item.sizeId === c))
      )
    },

    productsFilteredByText () {
      const keyword = this.filters.text?.toLowerCase?.().trim?.()
      return !keyword ? this.productsFilteredByColors : this.productsFilteredByColors.filter(
        p => this.productsText[p._id].includes(keyword)
      )
    },

    filterSelectOptions () {
      return [
        {
          attr: 'manufacturers',
          items: Array.from(new Set(this.products.map(p => p.manufacturer).filter(Boolean)))
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
    showProductModal (product) {
      this.$refs.modal.show(product)
    },

    setFilter ({ available, isActive }) {
      if (available !== undefined) {
        this.filters.isActive = true
        this.filters.available = available
      } else {
        this.filters.available = undefined
        this.filters.isActive = isActive
      }
    },

    confirmRemoveProduct (product) {
      this.$confirm('products.remove_confirm', () => {
        this.$store.dispatch('product/deleteProduct', product._id)
      })
    }
  },
  head () {
    return {
      title: this.$t('nav.products')
    }
  }
}
</script>
