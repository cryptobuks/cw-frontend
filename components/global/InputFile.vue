<template>
  <div>
    <input
      :id="`file-input-${_uid}`"
      type="file"
      :accept="accept"
      :name="`file-input-${_uid}`"
      class="hidden"
      @input="getFile"
    >
    <label :for="`file-input-${_uid}`" class="cursor-pointer">
      <slot v-bind="{ file, fileURL }" />
    </label>
  </div>
</template>

<script>
export default {
  props: {
    accept: { type: String, default: 'image/*' },
    value: { type: null, default: null }
  },
  data: () => ({ file: null, fileURL: null }),
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler (val) {
        this.file = val
      }
    }
  },
  methods: {
    getFile (event) {
      this.file = event.currentTarget.files[0]
      this.$emit('input', this.file)
      if (this.file) { this.fileURL = URL.createObjectURL(this.file) }
    }
  }
}
</script>

<style>
</style>
