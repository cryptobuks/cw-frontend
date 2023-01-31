<template>
  <base-input-wrapper
    :value="tmpValue"
    class="base-select"
    v-bind="$attrs"
    :clearable="clearable"
    :light="light"
    event=""
    v-on="{
      ...$listeners,
      clear: onClear
    }"
  >
    <template #default="{ inputAttrs, inputListeners, inputClass }">
      <transition-group
        name="base-select__zoom-fade"
        tag="div"
        class="base-select__body"
      >
        <base-chip
          v-for="(item, index) in selectedItems"
          :key="index + ''"
          :dismissible="!inputAttrs.disabled || inputAttrs.readonly"
          :light="light"
          :danger="item.value.danger"
          class="base-select__selected-item"
          @dismiss="deselectItem(item.index)"
          @click.native.stop="focus"
        >
          <slot name="selected-item-text" :item="item.value">
            {{ getItemText(item.value) }}
          </slot>
        </base-chip>

        <base-menu
          ref="popover"
          key="_popover"
          :items="searchedItems"
          :disabled="inputAttrs.readonly || inputAttrs.disabled"
          :active-index="activeIndex"
          :light="light"
          :match-activator-wdith="matchActivatorWidth"
          show-on-focus
          :keep-alive="keepAlive"
          class="base-select__popover"
          body-class="base-select__popover__body"
          @item-click="selectItem"
          @footer-click="onFooterClick"
          @shown="keepAlive = true"
        >
          <template #activator>
            <input
              v-if="
                inputAttrs.autocomplete &&
                  inputAttrs.autocomplete.includes('off')
              "
              :autocomplete="inputAttrs.autocomplete"
              :name="inputAttrs.name"
              :type="inputAttrs.type"
              :placeholder="inputAttrs.placeholder"
              class="hidden"
            >

            <slot
              :name="
                !isArrayValue && selectedItem ? 'selected-item-text' : '_off'
              "
              :item="selectedItem"
            >
              <input
                ref="input"
                v-auto-resize-text
                :class="[inputClass]"
                class="base-select__input"
                v-bind="{
                  ...inputAttrs,
                  value:
                    isArrayValue || (isSearchable && focusing)
                      ? searchText
                      : getItemText(selectedItem),
                  type: isSearchable ? 'search' : 'text',
                  readonly: !isSearchable || inputAttrs.readonly,
                  placeholder:
                    selectedItems.length === 0 ? inputAttrs.placeholder : ''
                }"
                v-on="{
                  ...inputListeners,
                  blur: () => onBlur(inputListeners.blur),
                  input: e => onSearchTextChange(e.target.value, true)
                }"
                @focus="onFocus"
                @keyup.esc.stop
              >
            </slot>
          </template>

          <template v-if="$scopedSlots.items" #items="props">
            <slot name="items" v-bind="props" />
          </template>

          <template v-if="$scopedSlots.item" #item="props">
            <slot name="item" v-bind="props" />
          </template>

          <template #item-text="props">
            <slot name="item-text" v-bind="props">
              <span class="px-2 py-1">
                {{ getItemText(props.item) }}
              </span>
            </slot>
          </template>

          <template
            v-if="$scopedSlots['no-exact-match'] && hasNoExactMatch"
            #footer-text
          >
            <slot name="no-exact-match" :search-text="searchText" />
          </template>

          <template
            v-if="$scopedSlots.empty || $scopedSlots['not-found']"
            #empty
          >
            <slot
              v-if="isSearchable && searchText"
              name="not-found"
              :search-text="searchText"
            />
            <slot v-else name="empty" />
          </template>
        </base-menu>
      </transition-group>
    </template>

    <!-- Pass all $scopedSlots to base-input-wrapper -->
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    // eslint-disable-next-line vue/require-prop-types
    value: { default: null },

    // Available options
    items: { type: Array, default: () => [] },

    // If an item is {text: 'Option1', value: '1'} itemText should be "text"
    itemText: { type: [String, Function], default: 'text' },

    // If an item is {text: 'Option1', value: '1'} itemText should be "value"
    itemValue: { type: String, default: 'value' },

    // Set value = item instead of value = item[itemValue]
    returnObject: Boolean,

    // Hide the selected item
    hideSelected: Boolean,

    light: Boolean,

    // For popover
    matchActivatorWidth: Boolean,

    // Whether should enable search input
    searchable: { type: Boolean, default: true },

    // For an async search operation, debounce is recommended to be used to
    // reduce the number of network requests
    debounceDuration: { type: Number, default: 0 },

    // Sort the items by item[itemText]
    sortByText: Boolean,

    // Order descending or ascending of the sort function
    desc: Boolean,

    // Custom sort function
    sort: { type: Function, default: null },

    // Custom getItemText function used in searching operation.
    // To support cases such as searching against multiple fields of an item
    getItemSearchedText: { type: Function, default: null },

    // If isArrayValue, turn searchText into a value item on input blur
    selectOnBlur: Boolean,

    autoSelect: { type: Function, default: null }
  },
  data () {
    return {
      tmpValue: this.value,
      searchText: null,
      sortedItems: [],
      keepAlive: false,
      focusing: false
    }
  },
  computed: {
    _allItems () {
      if (!this.isArrayValue || !this.selectOnBlur) {
        return this.sortedItems
      }

      const newItems = this.value.filter(item => !this._findItemByValue(item, true, this.items))
      return this.sortedItems.concat(newItems)
    },

    _notHiddenItems () {
      if (
        !this.hideSelected ||
        (!this.selectedItem && !this.selectedItems.length)
      ) {
        return this._allItems
      }

      const filter = this.isArrayValue
        ? item => !this._findSelectedItemByValue(item)
        : item => !this._isIdentical(this.tmpValue, item)
      return this._allItems.filter(filter)
    },

    searchedItems () {
      if (!this._shouldHandleSearch || !this.searchText) {
        return this._notHiddenItems
      }

      const searchText = this.searchText.toLowerCase()
      const getText = this.getItemSearchedText || this.getItemText
      const selectedText = this.getItemText(this.selectedItem)
      if (searchText === selectedText?.toLowerCase()) {
        return this._notHiddenItems
      }

      return this._notHiddenItems.filter((item) => {
        const text = getText(item)
        return text?.toLowerCase().includes(searchText)
      })
    },

    activeIndex () {
      return this.isArrayValue
        ? -1
        : this.searchedItems.indexOf(this.selectedItem)
    },

    // For primitive type value
    selectedItem () {
      return this._findItemByValue(this.tmpValue)
    },

    // For array type value
    selectedItems () {
      if (!this.isArrayValue) {
        return []
      }

      const selectedItems = this.tmpValue.map((val, index) => ({
        value: this._findItemByValue(val) ?? val,
        index
      }))

      if (this.isSortable) {
        const sortFunc = this.sort || this._defaultSort
        selectedItems.sort((a, b) => sortFunc(a.value, b.value))
      }

      return selectedItems
    },

    clearable () {
      return (
        this.$attrs.clearable !== false &&
        (!this.isArrayValue || (this.isSearchable && !!this.searchText))
      )
    },

    // Value can be either array or of a primitive type thus the component behaves differently
    isArrayValue () {
      return Array.isArray(this.tmpValue)
    },

    // Enable search input by either prop "searchable" or event "search"
    isSearchable () {
      return this.searchable || !!this.$listeners.search
    },

    // Whether should sort the items and the selected items
    isSortable () {
      return this.sortByText || typeof this.sort === 'function'
    },

    // Whether should automatically filter this.items or leave the job to the parent component
    _shouldHandleSearch () {
      return this.isSearchable && !this.$listeners.search
    },

    hasNoExactMatch () {
      const text = this.searchText
      return (
        text &&
        !this.selectedItems.some(item => this.getItemText(item.value) === text) &&
        !this.searchedItems.some(item => this.getItemText(item) === text)
      )
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (v !== this.tmpValue) {
          this.tmpValue = v
          this.resetSearchText()
        }
      }
    },
    itemText () {
      if (this.focusing) {
        this.resetSearchText()
      }
    },
    items: {
      immediate: true,
      handler (items) {
        // Prevent blocking UI rendering
        setTimeout(() => {
          if (this.isSortable) {
            const sortFunc = this.sort || this._defaultSort
            this.sortedItems = [...items].sort((a, b) => sortFunc(a, b))
          } else {
            this.sortedItems = items
          }
        })
      }
    }
  },
  methods: {
    focus () {
      this.$refs.input?.focus()
    },

    onFocus () {
      this.resetSearchText()
      if (this.searchText) {
        this.$nextTick(() => this.$refs.input.select())
      }
      this.focusing = true
    },

    onBlur (cb) {
      setTimeout(() => {
        this.focusing = document.activeElement === this.$refs.input
        !this.focusing && cb && cb()

        if (!this.searchText || this.focusing) {
          return
        }

        // Auto select if match with an existing item
        if (this.selectOnBlur) {
          const searchText = this.searchText.toLowerCase().trim()
          const item = typeof this.autoSelect === 'function'
            ? this.searchedItems.find(item => this.autoSelect(item, searchText))
            : this.isArrayValue
              ? this._findItemByValue(searchText, true, this.searchedItems)
              : this.searchedItems[0] &&
                this.searchedItems[0] !== this.selectedItem &&
                this.getItemText(this.searchedItems[0])?.toLowerCase() === searchText &&
                this.searchedItems[0]

          if (!item) {
            this.$emit('new-item', searchText)
          } else if (!this.isArrayVlue || !this._findSelectedItemByValue()) {
            const value = this.returnObject || !this._isObject(item)
              ? item
              : item[this.itemValue]
            this._setValue(this.isArrayValue ? [...this.value, value] : value)
            this.$emit('item-select', item)
          }
        }

        this.onSearchTextChange(this.getItemText(this.selectedItem))
      }, 200)
    },

    resetSearchText () {
      this.searchText = this.isArrayValue ? '' : this.getItemText(this.selectedItem)
    },

    onSearchTextChange (text, fromInput = false) {
      if (!this.isSearchable || text === this.searchText) {
        return
      }

      this.searchText = text || ''

      if (fromInput && text && this.$refs.popover) {
        this.$refs.popover.show()
      }

      if (!this._shouldHandleSearch && !!this.$listeners.search) {
        this.$utils.debounce(
          () => this.$emit('search', this.searchText.trim()),
          this.debounceDuration
        )
      }
    },

    onClear () {
      if (this.isSearchable) {
        this.onSearchTextChange(null)
      } else if (!this.isArrayValue) {
        this._setValue(null)
      }
    },

    selectItem (item) {
      const value = this.returnObject || !this._isObject(item)
        ? item
        : item[this.itemValue]

      if (!this.isArrayValue) {
        this._setValue(value)
      } else if (!this._findSelectedItemByValue(value)) {
        this._setValue([...this.tmpValue, value])
      }

      this.focus()

      this.$emit('item-select', item)
    },

    deselectItem (index) {
      const items = [...this.tmpValue]
      const item = items.splice(index, 1)[0]

      this._setValue(items)
      this.$refs.popover.hide()

      this.$emit('item-deselect', item)
    },

    onFooterClick () {
      this.$emit('no-exact-match-click', this.searchText)
      this.searchText = ''
    },

    getItemText (item) {
      return item
        ? typeof this.itemText === 'function'
          ? this.itemText(item)
          : (item?.[this.itemText] ?? item) || ''
        : ''
    },

    _setValue (val) {
      this.tmpValue = val
      this.$emit('input', val)
    },

    _findItemByValue (value, ignoreCase = false, items) {
      return (
        this._isNotEmpty(value) &&
        (items || this._allItems).find(item => this._isIdentical(value, item, ignoreCase))
      ) || null
    },

    _findSelectedItemByValue (value) {
      const itemValue = this.itemValue
      const parsedValue = value[itemValue] ?? value
      return (
        this._isNotEmpty(parsedValue) &&
        this.tmpValue.find(
          selectedVal => parsedValue === (selectedVal[itemValue] ?? selectedVal)
        )
      )
    },

    _defaultSort (a, b) {
      const orderNum = this.desc ? -1 : 1

      return orderNum * (this.getItemText(a) > this.getItemText(b) ? 1 : -1)
    },

    _isIdentical (value, item, ignoreCase = false) {
      const itemValue = this.itemValue
      return this.returnObject || !this._isObject(item)
        ? this._compareWithCase(value, item, ignoreCase) ||
            (this._isObject(item) &&
              this._isObject(value) &&
              Object.hasOwnProperty.call(item, itemValue) &&
              Object.hasOwnProperty.call(value, itemValue) &&
              this._compareWithCase(value[itemValue], item[itemValue], ignoreCase))
        : this._compareWithCase(value, item[itemValue], ignoreCase)
    },

    _compareWithCase (val1, val2, ignoreCase = false) {
      return val1 === val2 ||
        (ignoreCase &&
          typeof val1 === 'string' &&
          typeof val2 === 'string' &&
          val1.toLowerCase() === val2.toLowerCase())
    },

    _isNotEmpty (v) {
      return !!v || typeof v === 'boolean' || typeof v === 'number'
    },

    _isObject (v) {
      return Object.prototype.toString.call(v) === '[object Object]'
    }
  }
}
</script>

<style lang="scss">
.base-select {
  &.has-value {
    .base-select__input {
      input::placeholder {
        opacity: 0;
      }
    }
  }

  &:not(.has-value) {
    .base-select__input {
      input:focus + svg {
        left: 0 !important;
      }
    }
  }

  &__body {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  &__zoom-fade {
    &-leave-to {
      opacity: 0;
    }

    &-leave-active {
      position: absolute;
    }
  }

  &__selected-item {
    flex-shrink: 0;
    margin: 5px;
    transition: 0.4s;
  }

  &__popover {
    flex-grow: 1;
    flex-shrink: 0;
    width: 0;

    &__body {
      max-width: 480px !important;
    }
  }

  &__input {
    transition: none !important;
    max-width: 100%;
    padding-right: 0;

    &:focus {
      &::placeholder {
        color: white;
      }
    }

    &[readonly] {
      cursor: default;

      &::placeholder {
        opacity: 1 !important;
      }
    }
  }
}
</style>
