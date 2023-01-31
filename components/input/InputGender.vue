<template>
  <base-select
    :items="genders"
    :label="$attrs.label || $t('input.gender.label')"
    :searchable="false"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      genders: [
        { text: this.$t('input.gender.male'), value: 'male' },
        { text: this.$t('input.gender.female'), value: 'female' },
        { text: this.$t('input.gender.other'), value: 'other' }
      ]
    }
  }
}
</script>
