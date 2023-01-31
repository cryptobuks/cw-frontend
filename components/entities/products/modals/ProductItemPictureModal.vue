<template>
  <cw-product-item-metadata-modal-wrapper
    ref="modal"
    v-bind="$attrs"
    :product="product"
    :metadata-type="$t('product_item.pictures')"
    :fields="[
      { name: 'pictures', default: [] },
    ]"
    @done="onDone"
    @change="onChange"
  >
    <template #item="{ productItem, itemMetadata, replicate }">
      <div v-if="itemMetadata.pictures" class="w-full">
        <label class="flex items-center mb-3">
          <base-icon
            v-tippy="$t('product_item.pictures.tooltip')"
            name="question-circle"
            class="mr-2"
          />

          {{ productItem.color.name }} {{ productItem.size.name }}
        </label>

        <div class="flex -mx-3 cursor-pointer" @click="uploadPictures(itemMetadata, replicate)">
          <div
            class="w-1/5 mx-3"
          >
            <div class="relative pb-full select-none rounded border-gray-400 border-dashed border-2">
              <base-icon
                name="camera"
                class="text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div
            v-for="i in 4"
            :key="productItem.key + i"
            class="w-1/5 mx-3 bg-cover bg-center bg-no-repeat"
            :style="{
              backgroundImage: itemMetadata.pictures[i - 1]
                ? `url(${ pictures[itemMetadata.pictures[i - 1]].src })`
                : ''
            }"
          >
            <div
              class="pb-full select-none rounded"
              :class="{ 'border-gray-400 border-dashed border-2': !itemMetadata.pictures[i - 1] }"
            />
          </div>
        </div>
      </div>
    </template>
  </cw-product-item-metadata-modal-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    product: { type: Object, required: true }
  },
  data () {
    return {
      pictures: {}
    }
  },
  methods: {
    show () {
      this.pictures = this.$utils.clone(this.product.pictures)
      this.$refs.modal.show()
    },
    async uploadPictures (productItem, cb) {
      const files = await this.$inputFile({ multiple: true, accept: 'image/*' })
        .then(selectedFiles => selectedFiles.slice(0, 5))

      if (files?.length) {
        const srcs = await Promise.all(files.map(file => this.$utils.readFile(file, 'base64')))
        const now = Date.now() + ''
        const ids = files.map((_, i) => now + i)

        files.forEach((file, i) => Object.assign(this.pictures, {
          [ids[i]]: {
            isNew: true,
            filename: file.name,
            src: srcs[i],
            items: [productItem.key]
          }
        }))

        productItem.pictures.forEach(picId => Object.assign(this.pictures, {
          [picId]: {
            ...this.pictures[picId],
            items: this.pictures[picId].items.filter(productItemKey => productItemKey !== productItem.key)
          }
        }))

        productItem.pictures = ids

        cb()
      }
    },
    // On replicated
    onChange (productItems) {
      const pictures = {}
      productItems.forEach(item => item?.pictures?.forEach?.((imageId) => {
        if (!pictures[imageId]) {
          pictures[imageId] = { ...this.pictures[imageId], items: [item.key] }
        } else {
          pictures[imageId].items.push(item.key)
        }
      }))
      this.pictures = pictures
    },
    onDone (productItems) {
      this.$emit('done', {
        pictures: this.pictures,
        productItems
      })
    }
  }
}
</script>
