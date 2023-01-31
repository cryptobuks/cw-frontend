<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${entityName || $t('entities.system_message')}`"
    :loading="saving"
    :disabled="disabled"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model.trim="entity.title"
        :label="$t('system_messages.title_label')"
        :tooltip="$t('system_messages.title_tooltip')"
        :rules="[rules.required]"
      />

      <base-input-autocomplete
        v-model="entity.section"
        :label="$t('system_messages.section_label')"
        :tooltip="$t('system_messages.section_tooltip')"
        :items="sections"
        :rules="{ required: rules.required }"
        @item-select="entity.section = $event.section"
      />

      <base-select
        v-model="entity.type"
        :label="$t('system_messages.channel_label')"
        :tooltip="$t('system_messages.channel_tooltip')"
        :items="channels"
        :rules="[rules.required]"
        class="uppercase"
      />

      <base-input-text
        v-model.trim="entity.notes"
        :label="$t('system_messages.notes_label')"
        :tooltip="$t('system_messages.notes_tooltip')"
      />

      <base-input-text
        v-model.trim="entity.key"
        :label="$t('system_messages.key_label')"
        :tooltip="$t('system_messages.key_tooltip')"
        :readonly="entity._id"
        :rules="[rules.required, rules.unique(sameChannelKeys), messageKeyRule]"
        class="mb-6"
      />

      <template v-for="(lang, i) in languages">
        <div
          :key="lang.language"
          class="flex items-center cursor-pointer select-none text-xl mt-6"
          :class="{
            'ml-8': !!i,
            'text-gray-500': !entity.messages[lang.language]
          }"
          @click="editMessage(lang)"
        >
          <img :src="`/images/flag/${lang.language}.svg`" class="w-5 h-5 object-cover rounded-full mr-2">

          <span class="mr-2">
            {{ lang.label }}
          </span>

          <base-icon
            v-tippy="$t('system_messages.content_tooltip', { language: lang.label })"
            name="question-circle"
            size="20"
            class="mr-2"
          />

          <base-icon name="chevron-right" size="20" class="ml-auto" />
        </div>

        <h4 v-if="!i" :key="i" class="text-xl mt-6">
          {{ $t('system_messages.translations_label') }}
        </h4>
      </template>
    </base-form>

    <base-modal
      ref="messageEditor"
      :title="messageEditorState.title + counterText"
      @done="onMessageEditorDone"
    >
      <base-input-editor
        v-model.trim="messageEditorState.content"
        :no-html="!messageEditorState.html"
        :placeholder="$t('system_messages.translations_placeholder')"
        class="h-full"
        autofocus
        no-modal
        dynamic
      />
    </base-modal>
  </base-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex'
const messageKeyRegex = new RegExp('^[0-9a-z.-]+$')

export default {
  data () {
    return {
      entityName: null,
      entity: {
        title: '',
        section: null,
        type: null,
        notes: '',
        key: '',
        messages: {
          en: ''
        }
      },
      saving: false,

      messageEditorState: {
        title: '',
        locale: null,
        content: '',
        html: false
      },

      channels: [
        { text: 'Email', value: 'email', html: true },
        { text: 'Email Subject', value: 'email-subject', html: false },
        { text: 'SMS', value: 'sms', html: false },
        { text: 'Chat', value: 'chat', html: true },
        { text: 'Notification', value: 'notification', html: false }
      ],
      sections: [],

      messageKeyRule: v => !v || messageKeyRegex.test(v.trim()) || 'Only allow lowercase alphabetical character and . character'
    }
  },
  computed: {
    ...mapState('system-message', ['messages']),
    ...mapState('settings', ['languages']),

    counterText () {
      const { html = false } = this.activeChannel || {}
      const { content } = this.messageEditorState

      return !html && content ? ` (${content.length})` : ''
    },

    activeChannel () {
      return this.entity.type ? this.channels.find(c => c.value === this.entity.type) : null
    },

    disabled () {
      const { title, section, type, key, messages } = this.entity
      return !title || !section || !type || !key || !Object.values(messages).some(Boolean)
    },

    sameChannelKeys () {
      if (!this.entity.type) {
        return []
      }

      const keys = this.messages.filter(c => c._id !== this.entity._id && c.type === this.entity.type).map(c => c.key)

      return Array.from(new Set(keys))
    },

    displayLanguages () {
      const { locale = 'en' } = this.$i18n
      const languages = [...this.languages].sort((a, b) => a.label > b.label ? 1 : -1)
      const i = languages.findIndex(l => l.language === locale)
      if (i !== -1 && i !== 0) {
        languages.unshift(languages.splice(i, 1))
      }

      return languages
    }
  },
  methods: {
    ...mapActions('system-message', ['mutateMessage']),
    show (item) {
      this.entityName = (item && item.title) || null

      this.entity = this.$utils.extract(item, {
        _id: undefined,
        title: '',
        section: null,
        type: null,
        notes: null,
        key: '',
        messages: {
          en: '',
          es: '',
          it: ''
        }
      })

      const sections = this.messages
        .map(m => m.section)
        .filter(Boolean)
        .sort((a, b) => a > b ? 1 : -1)

      this.sections = Array.from(new Set(sections))

      this.$refs.modal.show()
    },

    editMessage (lang) {
      const chanel = this.entity.type && this.channels.find(c => c.value === this.entity.type)

      this.messageEditorState = {
        title: lang.label + ' - ' + (this.entityName || this.entity.title || this.$t('entities.system_message')),
        locale: lang.language,
        content: this.entity.messages[lang.language],
        html: chanel && chanel.html
      }

      this.$refs.messageEditor.show()
    },

    onMessageEditorDone () {
      Object.assign(this.entity.messages, {
        [this.messageEditorState.locale]: this.messageEditorState.content
      })

      this.$refs.messageEditor.hide()
    },

    save () {
      this.mutateMessage(this.entity).then((response) => {
        if (response && response.success) {
          this.$emit('save')
          this.$notifier.success(response.message)
        }

        this.$refs.modal.hide()
      })
    }
  }
}
</script>
