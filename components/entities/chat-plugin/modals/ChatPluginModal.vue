<template>
  <base-modal
    ref="modal"
    title="Settings Chat For Website"
    :loading="saving"
    @dismiss="closeModal"
    @done="updateChatPerWebsiteSettings"
  >
    <base-form v-slot="{ rules }" class="flex flex-col justify-between h-full">
      <base-progressive-fields-container
        show-all-fields
        :fields="fields"
        class="flex flex-col space-y-3"
      >
        <template #labelTextAndIcon="{ inputAttrs }">
          <div class="flex space-x-2">
            <base-select
              v-model="chatPluginSettings.labelIcon"
              label="Icon"
              :items="icons"
              v-bind="inputAttrs"
              item-text="name"
              item-value="name"
            >
              <template #item-text="{ item }">
                <div class="flex items-center px-2 py-1">
                  <div class="p-1 rounded-full">
                    <base-icon :name="item.icon" class="text-white" />
                  </div>
                </div>
              </template>
              <template #selected-item-text="{ item }">
                <div class="flex items-center mb-2 ml-2">
                  <div class="p-1 rounded-full">
                    <base-icon :name="item.icon" class="text-white" />
                  </div>
                </div>
              </template>
            </base-select>
            <base-input-text
              v-model="chatPluginSettings.labelText"
              class="justify-self-start"
              label="Logo"
              placeholder="Contact Us"
              maxlength="100"
              :disabled="false"
              :rules="[rules.maxLength(100)]"
              v-bind="inputAttrs"
            />
          </div>
        </template>

        <template #labelFontSize="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.labelFontSize"
            label="Label Font Size"
            return-object
            :items="fontSizes"
            v-bind="inputAttrs"
          />
        </template>

        <template #labelTextColor="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.labelTextColor"
            label="Label and frame text color"
            :items="textColors"
            v-bind="inputAttrs"
            item-text="name"
            item-value="code"
          >
            <template #item-text="{ item }">
              <base-color-indicator
                class="px-2 py-1"
                v-bind="{ color: item.code, text: item.name }"
              />
            </template>
          </base-select>
        </template>
        <template #labelBackgroundColor="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.labelBackgroundColor"
            label="Label and frame Background color"
            :items="backgroundColors"
            v-bind="inputAttrs"
            item-text="name"
            item-value="code"
          >
            <template #item-text="{ item }">
              <base-color-indicator
                class="px-2 py-1"
                v-bind="{ color: item.code, text: item.name }"
              />
            </template>
            <template #selected-item-text="{ item }">
              <base-color-indicator
                class="px-2 py-1"
                v-bind="{ color: item.code, text: item.name }"
              />
            </template>
          </base-select>
        </template>
        <template #labelTransparency="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.labelTransparency"
            label="Label and Frame background transparency"
            :items="transparencies"
            v-bind="inputAttrs"
            return-object
          />
        </template>
        <template #chatBackgroundColor="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.chatBackgroundColor"
            label="Chat background color"
            :items="backgroundColors"
            v-bind="inputAttrs"
            item-text="name"
            item-value="code"
          >
            <template #item-text="{ item }">
              <base-color-indicator
                class="px-2 py-1"
                v-bind="{ color: item.code, text: item.name }"
              />
            </template>
            <template #selected-item-text="{ item }">
              <base-color-indicator
                class="px-2 py-1"
                v-bind="{ color: item.code, text: item.name }"
              />
            </template>
          </base-select>
        </template>
        <template #chatBackgroundTransparency="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.chatBackgroundTransparency"
            label="Chat background transparency"
            :items="transparencies"
            v-bind="inputAttrs"
            return-object
          />
        </template>
        <template #fontType="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.fontType"
            label="Font Type"
            :items="fontTypes"
            v-bind="inputAttrs"
            return-object
          />
        </template>
        <template #fontSize="{ inputAttrs }">
          <base-select
            v-model="chatPluginSettings.fontSize"
            label="Font Size"
            :items="fontSizes"
            v-bind="inputAttrs"
            return-object
          />
        </template>
      </base-progressive-fields-container>
      <button
        :style="cssVals"
        class="px-4 mx-auto text-white text-center mt-6 flex items-center justify-center mb-8"
      >
        <span class="font-bold mr-2 px-2">{{
          chatPluginSettings.labelText
        }}</span>
        <base-icon :name="previewIcon" class="px-2" />
      </button>
    </base-form>
  </base-modal>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data () {
    const fields = [
      { name: 'labelTextAndIcon', default: 'Contact Us' },
      {
        name: 'labelText',
        default: this.gymDetail?.chatPluginSettings?.labelText || 'Contact Us'
      },
      {
        name: 'labelFontSize',
        default: this.gymDetail?.chatPluginSettings?.labelFontSize || 18
      },
      {
        name: 'labelTextColor',
        default:
          this.gymDetail?.chatPluginSettings?.labelTextColor ||
          'rgb(255, 255, 255)'
      },
      {
        name: 'labelBackgroundColor',
        default:
          this.gymDetail?.chatPluginSettings?.labelBackgroundColor ||
          'rgb(166,166,166)'
      },
      {
        name: 'labelTransparency',
        default: this.gymDetail?.chatPluginSettings?.labelTransparency || '95%'
      },
      {
        name: 'chatBackgroundColor',
        default:
          this.gymDetail?.chatPluginSettings?.chatBackgroundColor ||
          'rgb(166,166,166)'
      },
      {
        name: 'chatBackgroundTransparency',
        default:
          this.gymDetail?.chatPluginSettings?.chatBackgroundTransparency ||
          '95%'
      },
      {
        name: 'fontType',
        default: this.gymDetail?.chatPluginSettings?.fontType || 'Poppins'
      },
      {
        name: 'fontSize',
        default: this.gymDetail?.chatPluginSettings?.fontSize || 24
      }
    ]
    return {
      fields,
      gymDetail: {},
      saving: false,
      icons: [
        {
          name: 'chat plugin 01',
          icon: 'chat-plugin-01'
        },
        {
          name: 'chat plugin 02',
          icon: 'chat-plugin-02'
        },
        {
          name: 'chat plugin 03',
          icon: 'chat-plugin-03'
        },
        {
          name: 'chat plugin 04',
          icon: 'chat-plugin-04'
        }
      ],
      backgroundColors: [
        { name: 'Default Gray', code: '#646464' },
        { name: 'Color 2', code: 'rgb(47,85,151)' },
        { name: 'Color 3', code: 'rgb(197,90,17)' },
        { name: 'Color 4', code: 'rgb(84,130,53)' },
        { name: 'Color 5', code: 'rgb(191,144,0)' },
        { name: 'Color 6', code: 'rgb(46,117,182)' }
      ],
      isChanged: false,
      textColors: [
        { name: 'Default Gray', code: '#646464' },
        { name: 'White', code: 'rgb(255, 255, 255)' },
        { name: 'Black', code: 'rgb(0,0,0)' }
      ],
      fontSizes: [12, 14, 16, 18, 20, 22, 24],
      fontTypes: ['Poppins', 'Lato', 'Open Sans', 'Oswald', 'Roboto'],
      chatPluginSettings: {
        ...this.$utils.extract(
          {},
          fields.map(f => ({ from: f.name, default: f.default }))
        ),
        labelIcon: 'chat plugin 04'
      },
      transparencies: ['90%', '93%', '95%', '98%', '100%']
    }
  },
  computed: {
    previewIcon () {
      return this.chatPluginSettings?.labelIcon
        ? `${this.chatPluginSettings.labelIcon.replaceAll(' ', '-')}`
        : 'chat-plugin-01'
    },
    cssVals () {
      return {
        fontSize: `${this.chatPluginSettings?.labelFontSize}px !important`,
        color: `${this.chatPluginSettings?.labelTextColor} !important`,
        backgroundColor: `${this.chatPluginSettings?.labelBackgroundColor} !important`,
        opacity:
          Number(this.chatPluginSettings?.labelTransparency?.replace('%', '')) /
            100 || '1 !important'
      }
    }
  },
  watch: {
    chatPluginSettings: {
      handler () {
        this.isChanged = true
      },
      deep: true
    }
  },
  methods: {
    show (gymDetail) {
      this.gymDetail = gymDetail
      if (
        gymDetail?.chatPluginSettings &&
        Object.keys(gymDetail?.chatPluginSettings).length
      ) {
        this.chatPluginSettings = { ...gymDetail?.chatPluginSettings }
      }
      this.$refs.modal.show()
    },
    ...mapActions('profile', ['mutateGym']),
    async updateChatPerWebsiteSettings () {
      this.saving = true
      const res = await this.mutateGym(
        Object.assign(this.gymDetail, {
          chatPluginSettings: this.chatPluginSettings
        })
      )
      if (res) {
        this.$notifier.success(
          'Chat Per Website Settings Updated Successfully'
        )
        this.$refs.modal.hide()
        this.$emit('updated')
      }
      this.saving = false
    },
    closeModal () {
      if (this.isChanged) {
        this.$confirm(this.$t('chat-plugin-settings.exit_confirmation'), () =>
          this.$refs.modal.hide()
        )
        return
      }
      this.$refs.modal.hide()
    }
  }
}
</script>

<style></style>
