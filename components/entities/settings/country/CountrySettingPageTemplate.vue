<template>
  <base-main-groups-card
    v-if="!selectedItem"
    :title="title"
    show-back-button
    :groups="searchedAreas"
    :hide-group-actions="hideGroupActions"
    :actions="hideActions ? [] : [{ icon: 'add', tooltip: $t('global.action_add_tooltip'), handler: () => createItem() }]"
    previous-page="/settings/countries"
    @search="keywords = $event"
    @add-group-item="group => createItem(group)"
  >
    <template #item="{ group: area, item }">
      <slot name="item" :area="area" :item="item">
        <cw-country-swipe-card
          :entity="item"
          @edit="editItem(area, item)"
          @remove="removeItem(area, item)"
          @view="viewItem(area, item)"
          @clone="cloneItem(area, item)"
          @activate="activateItem(area, item)"
        >
          <template #title>
            {{ itemsTitle[item._id] }}
          </template>

          <template v-if="$scopedSlots['item-body']" #default>
            <slot name="item-body" :area="area" :item="item" />
          </template>
        </cw-country-swipe-card>
      </slot>
    </template>

    <template #extended-modal>
      <slot name="modals" :done="closeItemView" />
    </template>
  </base-main-groups-card>

  <cw-country-document-detail
    v-else
    :entity="selectedItem"
    :title="itemsTitle[selectedItem._id]"
    :print-title="selectedItem.progressive + ' ' + selectedArea.title"
    @back="closeItemView"
    @edit="editItem(selectedArea, selectedItem)"
    @duplicate="cloneItem(selectedArea, selectedItem)"
  >
    <slot name="detail" :item="selectedItem" :area="selectedArea">
      <cw-editor-text-viewer v-if="selectedItem.intro" :value="selectedItem.intro" class="mb-5" />
      <cw-editor-text-viewer :value="selectedItem.content" />
    </slot>

    <slot name="modals" :done="closeItemView" />
  </cw-country-document-detail>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
    areas: { type: Array, default: () => [] },
    hideActions: Boolean,
    hideGroupActions: Boolean
  },
  data () {
    return {
      keywords: null,
      selectedItem: null,
      selectedArea: null
    }
  },
  computed: {
    searchedAreas () {
      if (!this.keywords) {
        return this.areas
      }

      const areas = []
      const keywords = this.keywords.toLowerCase().trim()

      this.areas.forEach((area) => {
        if (area.prefix.toLowerCase().includes(keywords) || area.title.toLowerCase().includes(keywords)) {
          return areas.push(area)
        }

        const items = area.items.filter((item) => {
          return this.itemsTitle[item._id].toLowerCase().includes(keywords)
        })

        if (items.length) {
          areas.push({ ...area, items })
        }
      })

      return areas
    },

    itemsTitle () {
      const itemsTitle = {}
      for (const area of this.areas) {
        for (const item of area.items) {
          itemsTitle[item._id] = item.progressive + ' ' + area.prefix
        }
      }
      return itemsTitle
    }
  },
  methods: {
    createItem (area = null) {
      this.$emit('mutate', { area })
    },

    editItem (area, item) {
      this.$emit('mutate', { area, item, name: this.itemsTitle[item._id] })
    },

    viewItem (area, item) {
      this.selectedItem = item
      this.selectedArea = area
      this.$emit('view', { area, item, name: this.itemsTitle[item._id] })
    },

    closeItemView () {
      this.selectedItem = this.selectedArea = null
    },

    removeItem (area, item) {
      this.$emit('remove', { area, item, name: this.itemsTitle[item._id] })
    },

    cloneItem (area, item) {
      const newItem = { ...item }
      delete newItem._id
      this.$emit('mutate', { area, item: newItem })
    },

    activateItem (area, item) {
      this.$emit('activate', { area, item, name: this.itemsTitle[item._id] })
    }
  }
}
</script>
