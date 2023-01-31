<template>
  <base-modal ref="modal" height="300">
    <span class="text-sm">{{ $t("copy_modal.click_to_copy") }}</span>
    <div
      class="mt-3 w-full shadow-cw-card rounded-lg relative group hover:cursor-pointer p-2 bg-gray-100 text-black"
    >
      <div
        class="w-full h-full absolute hidden group-hover:flex items-center justify-center top-0 left-0 rounded-lg bg-gray-500 opacity-50 text-4xl font-extrabold capitalize"
        @click="copy"
      >
        <base-icon name="copy" size="40" class="mr-3" />
        {{ $t("global.copy") }}
      </div>
      <pre
        ref="codeSnippet"
        class="text-xs whitespace-pre-wrap break-all"
        v-html="text"
      />
    </div>
  </base-modal>
</template>

<script>
export default {
  data: () => ({ text: null }),
  methods: {
    copy () {
      this.$utils.copy(this.$refs.codeSnippet.textContent)
      this.$notifier.success('Copied')
    },
    show (text) {
      this.text = text
      this.$refs.modal.show()
    }
  }
}
</script>

<style></style>
