<template>
  <base-modal ref="modal" :title="`Manage ${name || 'Asset'}`">
    <component
      :is="type"
      ref="assetModal"
      :gym-id="gymId"
      :asset-detail="assetDetail"
      @success="success"
      @change="getName"
    />
  </base-modal>
</template>

<script>
export default {
  name: 'AssetsModal',
  components: {
    create: () => import('../organisms/CreateAsset'),
    edit: () => import('../organisms/EditAsset')
  },
  props: {
    gymId: {
      type: String,
      required: true
    }
  },
  data: () => ({ name: '', type: 'create', assetDetail: {} }),
  methods: {
    show (type, assetDetail) {
      this.type = type
      this.$refs.modal.show()
      if (type === 'edit') {
        this.assetDetail = assetDetail
        // this.$refs.modal.$slots.default[0].context.getassetDetails(assetDetail)
      }
    },
    success (asset) {
      this.$refs.modal.hide()
      this.$emit('success', asset)
    },
    getName (name) {
      this.name = name
    }
  }
}
</script>

<style>
</style>
