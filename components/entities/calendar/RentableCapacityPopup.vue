<template>
  <base-confirm-popup
    v-bind="{
      actions: [
        {
          text: $t('global.update').toUpperCase(),
          handler: () => $refs.confirm.hide(),
          bold: true,
        },
      ],
      ref: 'confirm',
      title: `${$t('global.manage')} ${asset.name} ${$t(
        'rentable.max_places.label'
      )}`,
    }"
  >
    <base-input-text
      v-model="asset.capacity"
      v-bind="{
        label: $t('rentable.max_places.label'),
        light: true,
        mask: '###',
        tooltip: $t('rentable.max_places.label'),
      }"
    />
  </base-confirm-popup>
</template>

<script>
export default {
  data: () => ({
    asset: { name: null, assetId: null, capacity: null }
  }),
  methods: {
    show (asset) {
      this.asset = asset
      this.$refs.confirm.show()
    }
  }
}
</script>
