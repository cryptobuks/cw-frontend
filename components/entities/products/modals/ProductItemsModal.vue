<template>
  <base-modal
    ref="modal"
    :title="
      $t('global.manage') +
        ' ' +
        (product.name || '') +
        ' ' +
        $t('product_item.items')
    "
    :disabled="!canSave"
    @done="done"
  >
    <base-form>
      <base-progressive-fields-container
        :fields="fields"
        :data="draft"
        :show-all-fields="!!product.items.length"
        :hidden-fields="isTemplate ? ['vatRateId'] : []"
        @can-save-change="canSave = $event"
      >
        <template #target="{ inputAttrs }">
          <base-select
            v-model="draft.target"
            :items="targets"
            v-bind="inputAttrs"
          />
        </template>

        <template #sizes="{ inputAttrs }">
          <base-select
            v-model="draft.sizes"
            v-bind="inputAttrs"
            :items="sizes.map((s) => s.name)"
            select-on-blur
            hide-selected
            @new-item="addNewSize"
            @item-select="addCombination({ size: $event })"
            @item-deselect="removeCombination({ size: $event })"
          />
        </template>

        <template #colors="{ inputAttrs }">
          <base-select
            v-model="draft.colors"
            v-bind="inputAttrs"
            :items="colors.map((c) => c.name)"
            select-on-blur
            hide-selected
            @new-item="addNewColor"
            @item-select="addCombination({ color: $event })"
            @item-deselect="removeCombination({ color: $event })"
          />
        </template>

        <template v-if="!isTemplate" #vatRateId="{ inputAttrs }">
          <cw-input-vat-rate
            v-model="draft.vatRateId"
            :country-code="$auth.countryCode"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <div class="mt-20 list-none">
      <template v-for="color in draft.colors">
        <template v-for="size in draft.sizes">
          <base-checkbox
            :key="color + ':' + size"
            v-model="combinations"
            :label="`${color} ${size}`"
            :value="color + '::' + size"
            class="mb-6"
          />
        </template>
      </template>
    </div>
  </base-modal>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: {
    product: { type: Object, required: true },
    isTemplate: Boolean
  },
  data () {
    const fields = [
      { name: 'target', requried: true },
      { name: 'sizes', required: true, default: [] },
      { name: 'colors', required: true, default: [] },
      { name: 'vatRateId', required: true }
    ].map(f =>
      Object.assign(f, {
        label: this.$t(`product_item.${f.name}.label`),
        tooltip: this.$t(`product_item.${f.name}.tooltip`),
        default: 'default' in f ? f.default : null
      })
    )

    return {
      fields,
      draft: this.$utils.extract(
        {},
        fields.map(f => ({
          from: f.name,
          default: f.default
        }))
      ),

      // color::size[]
      combinations: [],

      canSave: true,

      targets: ['male', 'female', 'unisex', 'children'].map(value => ({
        value,
        text: this.$t('product_item.target.' + value)
      }))
    }
  },
  computed: {
    ...mapState('product', ['sizes', 'colors']),
    ...mapGetters('product', ['sizesById', 'colorsById'])
  },
  methods: {
    show () {
      const items = this.product.items
      this.draft = {
        target: items[0]?.target || null,
        vatRateId: items[0]?.vatRateId || null,
        sizes: Array.from(
          new Set(
            items
              .map(item => this.sizesById[item.sizeId]?.name)
              .filter(Boolean) || []
          )
        ),
        colors: Array.from(
          new Set(
            items
              .map(item => this.colorsById[item.colorId]?.name)
              .filter(Boolean) || []
          )
        )
      }

      this.combinations =
        items.map(item => item.color.name + '::' + item.size.name) || []

      this.$refs.modal.show()
    },

    addNewSize (size) {
      this.draft.sizes.push(size)
      this.addCombination({ size })
    },

    addNewColor (color) {
      this.draft.sizes.push(color)
      this.addCombination({ color })
    },

    addCombination ({ color, size } = {}) {
      const newCombinations = color
        ? this.draft.sizes.map(s => color + '::' + s)
        : this.draft.colors.map(c => c + '::' + size)

      this.combinations = Array.from(
        new Set(this.combinations.concat(newCombinations))
      )
    },

    removeCombination ({ color, size } = {}) {
      this.combinations = color
        ? this.combinations.filter(c => !c.startsWith(color + '::'))
        : this.combinations.filter(c => !c.endsWith('::' + size))
    },

    done () {
      const colorsByName = {}
      this.colors.forEach(c =>
        Object.assign(colorsByName, { [c.name.toLowerCase()]: c })
      )

      const sizesByName = {}
      this.sizes.forEach(s =>
        Object.assign(sizesByName, { [s.name.toLowerCase()]: s })
      )

      const { target, vatRateId } = this.draft

      const products = this.combinations.map((combination) => {
        const [colorName, sizeName] = combination.split('::')
        const color = colorsByName[colorName.toLowerCase()]
        const size = sizesByName[sizeName.toLowerCase()]
        return {
          key: combination,
          colorId: color?._id,
          color: color || { name: colorName },
          sizeId: size?._id,
          size: size || { name: sizeName },
          target,
          vatRateId
        }
      })

      this.$emit('done', products)

      this.$refs.modal.hide()
    }
  }
}
</script>
