<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="[value].filter(Boolean)"
    :item-rules="{ unique: checkChatEmailUniqueness }"
    @add-item="!value && showModal(true)"
  >
    <template #item>
      <base-swipe-card
        auto-height
        bg-color="#404040"
        :actions="cardActions"
      >
        <h3 class="font-bold text-lg cursor-default">
          {{ value || defaultAlias }}{{ host }}
        </h3>

        <ul class="text-green list-disc list-inside">
          <li v-for="activity in lastActivities" :key="activity._id" class="leading-7">
            {{ $t('input.chat_email.activity', { email: activity.email, date: activity.date }) }}
          </li>
        </ul>
      </base-swipe-card>
    </template>

    <base-modal
      ref="modal"
      :title="$t('global.manage') + ' ' + (value || $t('entities.chat_email'))"
      v-on="disabled ? {} : { done: save }"
    >
      <base-form v-slot="{ rules }">
        <base-input-text
          v-model="text"
          :label="$attrs.label || $t('input.chat_email.label')"
          :readonly="disabled"
          :rules="{
            required: rules.required,
            syntax: () => rules.email(text ? text + host : null),
            unique: checkChatEmailUniqueness
          }"
        >
          <template #append>
            <base-input-text
              :value="host"
              readonly
              style="width: 180px; min-width: 180px;"
            />
          </template>
        </base-input-text>

        <p class="my-6 text-center">
          {{ $t('input.chat_email.modal.description') }}
          <br>
          <br>
          <strong>
            {{ text || '...' }}{{ host }}
          </strong>
        </p>

        <p class="font-bold mb-3">
          {{ $t('input.chat_email.modal.instructions') }}
        </p>

        <ul class="list-inside list-disc">
          <li v-for="(provider, i) in mailProviders" :key="i" class="mb-1">
            <a ref="nofollow noreferrer noopener" :href="provider.href" target="_blank" class="text-gray-400 underline">
              {{ provider.name }}
            </a>
          </li>
        </ul>
      </base-form>
    </base-modal>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: '' },
    host: { type: String, default: '@sportmail.net' },
    defaultAlias: { type: String, default: null }
  },
  data () {
    return {
      text: null,

      editable: false,

      mailProviders: [
        { name: 'Gmail', href: '#' },
        { name: 'Yahoo', href: '#' },
        { name: 'Hotmail', href: '#' },
        { name: 'Outlook', href: '#' }
      ]
    }
  },
  computed: {
    isCW () {
      // TODO Use authenticated profile's typeCode to check if profile is of type CW
      return true
    },

    disabled () {
      return !this.isCW || !this.editable
    },

    lastActivities () {
      // TODO Get data from API
      return []
    },

    cardActions () {
      const viewAction = { icon: 'eye', handler: () => this.showModal(false), secondary: true }

      if (this.isCW) {
        return [
          { icon: 'pen', handler: () => this.showModal(true) },
          viewAction
        ]
      }

      return [viewAction]
    }
  },
  watch: {
    defaultAlias: {
      immediate: true,
      handler  (alias) {
        if (alias || !(this.value?.length > 1)) {
          this.$emit('input', alias)
        }
      }
    }
  },
  methods: {
    showModal (editable = false) {
      this.text = this.value || this.defaultAlias || ''
      this.editable = editable
      this.$refs.modal.show()
    },

    save () {
      this.$emit('input', this.text)
      this.$refs.modal.hide()
    },

    async checkChatEmailUniqueness (alias) {
      return await this.$repos.profileRepo.checkChatEmailUniqueness(alias) || this.$t('input.chat_email.validation.unique')
    }
  }
}
</script>
