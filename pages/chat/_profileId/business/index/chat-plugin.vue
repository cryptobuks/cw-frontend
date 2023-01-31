<template>
  <base-main-card
    v-bind="$attrs"
    :title="$t('chat-plugin.title')"
    body-class="flex flex-col px-4 py-4 h-profile-body bg-white"
    :actions="[{ icon: 'pen', handler: () => showModal() }]"
    v-on="$listeners"
  >
    <cw-chat-plugin-modal ref="modal" @updated="getSingleGym(profile._id)" />

    <h4 class="font-bold text-sm" v-text="$t('chat-plugin.setup')" />

    <div
      class="mt-6 w-full shadow-cw-card rounded-lg relative group hover:cursor-pointer p-3"
    >
      <div
        class="w-full h-full absolute hidden group-hover:flex items-center justify-center top-0 left-0 rounded-lg bg-gray-500 opacity-50 text-4xl font-extrabold capitalize"
        @click="copy"
      >
        <base-icon name="copy" size="40" class="mr-3" /> {{ $t("global.copy") }}
      </div>
      <pre
        ref="codeSnippet"
        class="text-xs whitespace-pre-wrap p-2 break-all"
        v-text="
          `<script src='${origin}/chat-plugin/install.js?id=${profile._id}&lang=auto' id='cowellness'></script>`
        "
      />
    </div>

    <h3 class="font-bold underline uppercase text-lg mt-4">
      {{ $t('global.settings') }}
    </h3>
    <div class="text-sm">
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{ $t("chat-plugin.label_icon") }}</span>
        <base-icon :name="previewIcon" size="30" />
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{ $t("chat-plugin.label_text") }}</span>
        <span>{{
          chatPluginSettings && chatPluginSettings.labelText
            ? chatPluginSettings.labelText
            : "Contact Us"
        }}</span>
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{ $t("chat-plugin.label_font_size") }}</span>
        <span>{{
          chatPluginSettings && chatPluginSettings.labelFontSize
            ? chatPluginSettings.labelFontSize
            : "24"
        }}</span>
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{
          $t("chat-plugin.label_and_frame_text_color")
        }}</span>
        <div
          class="h-4 w-4 border-2 border-gray-600 rounded-full"
          :style="`background-color: ${
            chatPluginSettings && chatPluginSettings.labelTextColor
              ? chatPluginSettings.labelTextColor
              : 'white'
          }`"
        />
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{
          $t("chat-plugin.label_and_frame_background_color")
        }}</span>
        <div
          class="h-4 w-4 rounded-full"
          :style="`background-color: ${
            chatPluginSettings && chatPluginSettings.labelBackgroundColor
              ? chatPluginSettings.labelBackgroundColor
              : 'gray'
          }`"
        />
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{
          $t("chat-plugin.label_and_frame_background_transparency")
        }}</span>
        <span>{{
          chatPluginSettings && chatPluginSettings.labelTransparency
            ? chatPluginSettings.labelTransparency
            : "95%"
        }}</span>
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{
          $t("chat-plugin.chat_background_transparency")
        }}</span>
        <span>{{
          chatPluginSettings && chatPluginSettings.chatBackgroundTransparency
            ? chatPluginSettings.chatBackgroundTransparency
            : "95%"
        }}</span>
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{ $t("chat-plugin.font_type") }}</span>
        <div class="my-3 flex items-center justify-between">
          <span class="font-bold" />
          <span>{{
            chatPluginSettings && chatPluginSettings.fontType
              ? chatPluginSettings.fontType
              : "Poppins"
          }}</span>
        </div>
      </div>
      <div class="my-3 flex items-center justify-between">
        <span class="font-bold">{{ $t("chat-plugin.font_size") }}</span>
        <span>{{
          chatPluginSettings && chatPluginSettings.fontSize
            ? chatPluginSettings.fontSize
            : "24"
        }}</span>
      </div>
    </div>
    <button
      class="py-4 mx-auto bg-gray-700 text-white text-center mt-6 flex items-center justify-center"
      :style="cssVals"
    >
      <span class="mr-2 px-2">{{
        chatPluginSettings && chatPluginSettings.labelText
          ? chatPluginSettings.labelText
          : "Contact Us"
      }}</span>
      <base-icon :name="previewIcon" size="30" class="px-2" />
    </button>
  </base-main-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    origin: location.origin
    // chatPluginSettings: this.profile?.chatPluginSettings
  }),
  computed: {
    ...mapState('profile', ['singleGym']),
    chatPluginSettings () {
      return this?.singleGym?.chatPluginSettings || {}
    },
    cssVals () {
      return {
        fontSize: `${this.chatPluginSettings?.labelFontSize}px !important`,
        color:
          `${this.chatPluginSettings?.labelTextColor} !important` ||
          'white !important',
        backgroundColor: this.chatPluginSettings?.labelBackgroundColor
          ? `${this.chatPluginSettings?.labelBackgroundColor} !important`
          : 'gray !important',
        opacity:
          Number(this.chatPluginSettings?.labelTransparency?.replace('%', '')) /
            100 || '1 !important'
      }
    },
    previewIcon () {
      return this.chatPluginSettings?.labelIcon
        ? `${this.chatPluginSettings.labelIcon.replaceAll(' ', '-')}`
        : 'chat-plugin-04'
    }
  },
  created () {
    this.getSingleGym(this.profile._id)
  },
  methods: {
    ...mapActions('profile', ['getSingleGym']),
    async copy () {
      try {
        const writePermission = await navigator.permissions.query({
          name: 'clipboard-write'
        })
        if (
          writePermission.state !== 'granted' &&
          writePermission.state !== 'prompt'
        ) {
          return this.$notifier.error('not allowed to write to clipboard')
        }
        await window.navigator.clipboard.writeText(
          this.$refs.codeSnippet.textContent
        )
        this.$notifier.success('Copied')
      } catch (error) {
        this.$notifier.error(error)
      }
    },
    showModal () {
      this.$refs.modal.show({ ...this.singleGym })
    }
  }
}
</script>

<style></style>
