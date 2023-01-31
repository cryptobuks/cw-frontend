<template>
  <base-main-card
    :title="$t('nav.system_messages')"
    :actions="actions"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredMessages" class="">
      <template #item="{ item }">
        <base-swipe-card
          :title="item.title"
          body-class="text-gray-500"
          :actions="[
            { icon: 'bin', danger: true, handler: () => confirmRemoveMessage(item) },
            { icon: 'copy', secondary: true, handler: () => clone(item) },
            { icon: 'pen', handler: () => $refs.maker.show(item) }
          ]"
        >
          <template #default>
            <div class="mb-1">
              {{ item.section }}
            </div>

            <div class="uppercase">
              {{ item.type }}
            </div>
          </template>

          <template #footer>
            <cw-translations-status :translations="item.messages" />

            <span class="text-xs text-gray-400">
              {{ getFormattedDate(item.updatedAt) }}
            </span>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-system-message-maker ref="maker" />
    <cw-system-messages-exporter ref="exporter" />
  </base-main-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    const promises = [this.fetchMessages()]
    if (!this.languages.length) {
      promises.push(this.getLanguages())
    }
    await Promise.all(promises)
  },
  data () {
    return {
      actions: [
        { icon: 'import', tooltip: this.$t('system_messages.import_tooltip'), handler: () => this.importMessages() },
        { icon: 'export', tooltip: this.$t('system_messages.export_tooltip'), handler: () => this.$refs.exporter.show() },
        { icon: 'add', tooltip: this.$t('global.action_add_tooltip'), handler: () => this.$refs.maker.show() }
      ],
      keywords: ''
    }
  },
  computed: {
    ...mapState('system-message', ['messages']),
    ...mapState('settings', ['languages']),
    filteredMessages () {
      const keywords = this.keywords.trim().toLowerCase()
      return keywords
        ? this.messages.filter(m =>
          m.title.toLowerCase().includes(keywords) ||
          m.key.toLowerCase().includes(keywords) ||
          Object.values(m.messages).some(t => t && t.toLowerCase().includes(keywords))
        )
        : this.messages
    }
  },
  methods: {
    ...mapActions('system-message', [
      'fetchMessages',
      'mutateMessage',
      'removeMessage',
      'uploadMessages'
    ]),
    ...mapActions('settings', ['getLanguages']),

    clone (item) {
      this.$refs.maker.show(this.$utils.extract(item, {
        title: '',
        section: null,
        notes: null,
        key: '',
        messages: {
          en: '',
          es: '',
          it: ''
        }
      }))
    },
    async importMessages () {
      const fileContent = await this.$inputFile({ accept: '.csv', base64: true })
      if (fileContent) {
        this.uploadMessages(fileContent.split(',').pop()).then((res) => {
          res && res.success && this.$notifier.success('Imported !')
        })
      }
    },
    confirmRemoveMessage (msg) {
      this.$confirm(this.$t('system_messages.confirm_remove', { title: msg.title }))
        .then(() => this.removeMessage(msg._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    },
    getFormattedDate (date) {
      return this.$dayjs(date).format('D.M.YYYY')
    }
  }
}
</script>
