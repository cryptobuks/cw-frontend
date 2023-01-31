<template>
  <base-popover
    ref="popover"
    :active="expanded && expandable"
    class="base-advanced-filter flex rounded-xl bg-white min-h-10 text-black text-base"
    :class="{
      'rounded-b-none': expanded && expandable,
      'min-h-14': !sm,
      'px-1': !sm,
      'text-lg': !sm,
      border
    }"
    :disabled="!expandable"
    :offset-y="-1"
    show-on-focus
    match-activator-width
    @active-change="onPopoverActiveChange"
  >
    <template #activator>
      <!-- Prefix -->
      <div v-if="$slots.prefix" :class="[sm ? 'h-10' : 'h-14']" class="flex flex-shrink-0 items-center pl-2">
        <slot name="prefix" />

        <div class="w-0 border-l border-gray-400 h-6 ml-2" />
      </div>

      <!-- Body -->
      <div class="flex flex-row-reverse flex-wrap flex-grow">
        <div
          class="flex items-end flex-shrink-0 flex-grow max-w-full"
          :class="[sm ? 'h-9' : 'h-11']"
        >
          <!-- Icon search -->
          <span
            v-if="!combinedSelectedItems.length"
            class="h-8 max-h-full inline-flex items-center mr-auto select-none flex-shrink-0 pl-2"
          >
            <base-icon
              name="search"
              class="cursor-default text-gray-500"
            />
          </span>

          <!-- Input text -->
          <input
            ref="input"
            v-bind="$attrs"
            :value="value[textOption.attr]"
            :readonly="showAllFilters"
            placeholder="Search"
            class="base-advanced-filter__input flex-grow h-8 max-h-full py-1 px-2"
            @input="setText"
          >

          <!-- Icon clear -->
          <span
            v-show="!showAllFilters && value[textOption.attr]"
            class="h-8 max-h-full inline-flex items-center flex-shrink-0 select-none"
          >
            <base-icon
              name="time-circle"
              class="text-xl flex-shrink-0 cursor-pointer mr-3"
              @click.stop="setAttrValue(textOption.attr, '')"
            />
          </span>

          <!-- Icon filter -->
          <span class="h-8 max-h-full inline-flex items-center flex-shrink-0 select-none pr-2">
            <base-icon
              name="filter"
              class="cursor-pointer text-xl"
              :class="{ 'ml-auto': showAllFilters }"
              @click.stop="toggleFilters"
            />
          </span>
        </div>

        <!-- Selected chips -->
        <div
          v-if="combinedSelectedItems.length"
          class="mr-auto inline-flex items-center flex-wrap p-1 self-center"
        >
          <base-chip
            v-for="selectedItem in combinedSelectedItems"
            :key="selectedItem.attr + ':' + selectedItem.value"
            light
            dismissible
            class="m-1 flex-shrink-0"
            @dismiss="deselectItem(selectedItem)"
          >
            <slot name="selected-item-text" :item="selectedItem">
              {{ selectedItem.text }}
            </slot>
          </base-chip>
        </div>
      </div>

      <!-- Affix -->
      <div v-if="$slots.affix" :class="[sm ? 'h-10' : 'h-14']" class="flex flex-shrink-0 items-center pr-2">
        <div class="w-0 border-l border-gray-400 mr-2 h-6" />

        <slot name="affix" />
      </div>
    </template>

    <template #default>
      <base-scroll
        class="bg-white rounded-b-xl shadow-lg border-t-0 relative overflow-hidden"
        :class="{ border, 'max-h-80': !showAllFilters }"
      >
        <div class="mx-4 border-t absolute top-0 left-0 right-0" />

        <template v-if="!showAllFilters">
          <div
            v-for="item in availableItems"
            :key="item.value"
            class="px-4 py-2 cursor-pointer text-black hover:bg-gray-100 select-none"
            @click="selectItem(item)"
          >
            <slot name="item">
              {{ item.text }}
            </slot>
          </div>
        </template>

        <div v-else class="p-4">
          <div v-if="textOption" class="mb-4">
            <slot :name="textOption.attr">
              <base-input-text
                light
                v-bind="textOption"
                :value="value[textOption.attr]"
                @input="setAttrValue(textOption.attr, $event)"
              >
                <template v-for="name in filterSlots($scopedSlots, 'text')" v-slot:[name]="props">
                  <slot :name="`text:${name}`" v-bind="props" />
                </template>
              </base-input-text>
            </slot>
          </div>

          <div v-for="(select, i) in selectsOption" :key="select.attr" :class="{ 'mt-4': !!i }">
            <slot
              :name="select.attr"
              :input-attrs="buildSelectOpts(select)"
              :set-value="items => setAttrValue(select.attr, items)"
            >
              <base-select
                v-bind="buildSelectOpts(select)"
                @input="setAttrValue(select.attr, $event)"
              >
                <!-- Register all slots that have name started by "select:". E.g. select:item-text -->
                <template v-for="name in filterSlots($scopedSlots, 'select')" v-slot:[name]="props">
                  <slot :name="`select:${select.attr}:${name}`">
                    <slot :name="`select:${name}`" v-bind="props" />
                  </slot>
                </template>
              </base-select>
            </slot>
          </div>
        </div>
      </base-scroll>
    </template>
  </base-popover>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    /**
     * { [attr | textOption.attr]: [selectOption.item.value] }
     */
    value: { type: Object, required: true },

    /**
     * [{
     *   attr: string,
     *   ...(InputText or Select props)
     * }]
     */
    selectsOption: { type: Array, default: () => [] },

    // pass null to disable text search
    textOption: {
      type: Object,
      default: () => ({
        attr: 'text',
        label: 'Search',
        tooltip: 'Search'
      })
    },

    // Enable usage of url search params
    synWithRoute: Boolean,

    border: Boolean,

    autofocus: Boolean,

    sm: Boolean
  },
  data () {
    return {
      expanded: false,
      showAllFilters: false
    }
  },
  computed: {
    expandable () {
      return this.showAllFilters || !!this.availableItems.length
    },

    combinedItems () {
      return this.selectsOption.reduce((arr, selectOption) => {
        const { itemText = 'text', itemValue = 'value' } = selectOption || {}
        return !selectOption?.items?.length
          ? arr
          : arr.concat(selectOption.items.map(item => ({
            ...item,
            attr: selectOption.attr,
            itemText: 'text',
            itemValue: 'value',
            text: typeof itemText === 'function' ? itemText(item) : item[itemText],
            value: item[itemValue]
          })))
      }, [])
    },

    availableItems () {
      const items = this.combinedItems.filter(item => !this.value[item.attr]?.includes?.(item.value))

      const text = this.value[this.textOption?.attr]?.toLowerCase?.()?.trim()
      return text
        ? items.filter(c => c.text?.toLowerCase?.()?.includes(text))
        : items
    },

    combinedSelectedItems () {
      const items = []
      Object.entries(this.value).forEach(([attr, itemValues]) => {
        if (attr === this.textOption.attr) {
          return
        }
        const selectOption = this.selectsOption.find(f => f.attr === attr)
        if (!selectOption?.items?.length) {
          return
        }
        const itemValueAttr = selectOption.itemValue || 'value'
        const itemTextAttr = selectOption.itemText || 'text'
        const selectedselectOptionItems = itemValues
          .map(itemValue => selectOption.items.find(item => item[itemValueAttr] === itemValue))
          .filter(Boolean)
        items.push(...selectedselectOptionItems.map(item => ({
          original: item,
          attr: selectOption.attr,
          text: typeof itemTextAttr === 'function' ? itemTextAttr(item) : item[itemTextAttr],
          value: item[itemValueAttr]
        })))
      })
      return items
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler (query) {
        if (!this.synWithRoute) {
          return
        }

        const value = {}
        this.selectOption.forEach((selectOption) => {
          if (query[selectOption.attr]) {
            value[selectOption.attr] = this.$utils.parseJSON(decodeURIComponent(query[selectOption.attr])) ||
              (selectOption.type === 'text' ? '' : [])
          }
        })

        if (this.textOption) {
          value[this.textOption.attr] = this.$utils.parseJSON(decodeURIComponent(query[this.textOption.attr]))
        }

        this.$emit('input', value)
      }
    }
  },
  mounted () {
    if (this.autofocus) {
      this.$refs.input?.focus?.()
    }
  },
  methods: {
    deselectItem (selectedItem) {
      this.setAttrValue(
        selectedItem.attr,
        (this.value[selectedItem.attr] || []).filter(v => v !== selectedItem.value)
      )
    },

    setAttrValue (attr, value) {
      return this.setValue({
        ...this.value,
        [attr]: value
      })
    },

    setValue (newValue) {
      if (this.synWithRoute) {
        const query = {}
        Object.entries(newValue).forEach((attr, selectOptionValue) => {
          if (selectOptionValue?.length) {
            query[attr] = encodeURIComponent(JSON.stringify(selectOptionValue))
          }
        })
        this.$router.replace({
          path: this.$route.path,
          query
        })
      } else {
        this.$emit('input', newValue)
      }
      this.positionPopover()
    },

    setText (e) {
      this.setAttrValue(this.textOption.attr, e.target.value)
      setTimeout(() => {
        this.expanded = !!this.combinedItems.length
      })
    },

    selectItem (combinedItem) {
      setTimeout(() => this.setValue({
        ...this.value,
        [this.textOption.attr]: '',
        [combinedItem.attr]: (this.value[combinedItem.attr] || []).concat(combinedItem.value)
      }))

      this.expanded = false
    },

    buildSelectOpts (selectOpt) {
      const { attr, ...opts } = selectOpt
      return {
        ...opts,
        matchActivatorWidth: true,
        value: this.value[attr] || [],
        hideSelected: true,
        light: true
      }
    },

    filterSlots (scopedSlots, prefix) {
      return Object.keys(scopedSlots)
        .filter(key => key?.startsWith?.(prefix))
        .map(key => key.split(':').slice(-1)[0])
    },

    toggleFilters () {
      this.showAllFilters = !this.showAllFilters
      this.expanded = this.showAllFilters
      this.positionPopover()
    },

    onPopoverActiveChange (active) {
      this.expanded = active
      if (this.showAllFilters) {
        this.showAllFilters = false
      }
      this.positionPopover()
    },

    positionPopover () {
      this.$utils.debounce(() => this.$refs.popover.popper.update(), 50)
    }
  }
}
</script>

<style lang="scss">
.base-advanced-filter {
  &__input {
    &::placeholder {
      @apply text-black opacity-50;
    }
  }
}
</style>
