<template>
  <div>
    <base-select
      v-model="source"
      v-bind="$attrs"
      :items="sources"
      :inactive="inactive"
      :listeners="$utils.except($attrs.listeners || {}, 'validated')"
      v-on="$utils.except($listeners, ['validated', 'input'])"
      @validated="onValidated"
      @focus="onFocus"
    />

    <cw-input-individual-profile
      v-if="source === 'mouth'"
      v-model="friend"
      :country-code="countryCode"
      :label="$t('input.acquisition_channel.friend.label')"
      :placeholder="$t('input.acquisition_channel.friend.placeholder')"
      :tooltip="$t('input.acquisition_channel.friend.tooltip')"
      :inactive="inactive"
      :hidden-profiles-id="profileId ? [profileId] : []"
      autofocus
      @validated="onValidated"
      @focus="onFocus"
    />

    <base-select
      v-if="source === 'adverts'"
      v-model="advType"
      :label="$t('input.acquisition_channel.campagin_type.label')"
      :tooltip="$t('input.acquisition_channel.campagin_type.tooltip')"
      :items="campaginTypes"
      :inactive="inactive"
      autofocus
      @validated="onValidated"
      @focus="onFocus"
    />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Object, default: null },
    countryCode: { type: String, default: null },
    inactive: Boolean,
    profileId: { type: String, default: null }
  },
  data () {
    return {
      sources: Object.freeze([
        { text: this.$t('input.acquisition_channel.word_of_mouth'), value: 'mouth' },
        { text: this.$t('input.acquisition_channel.advertising_campaign'), value: 'adverts' },
        { text: this.$t('input.acquisition_channel.other'), value: 'other' }
      ]),

      campaginTypes: Object.freeze([
        { text: 'Google', value: 'google' },
        { text: 'Email', value: 'email' },
        { text: 'Facebook', value: 'facebook' },
        { text: 'Instagram', value: 'instagram' },
        { text: 'Radio', value: 'radio' },
        { text: 'TV', value: 'tv' },
        { text: 'Other', value: 'other' }
      ]),

      focusCount: 0
    }
  },
  computed: {
    source: {
      get () {
        return this.value?.source || null
      },
      set (source) {
        this.updateValue({ source })
      }
    },
    advType: {
      get () {
        return this.value?.advType || null
      },
      set (advType) {
        this.updateValue({ advType })
      }
    },
    friend: {
      get () {
        return this.value?.friend || null
      },
      set (friend) {
        this.updateValue({ friend: friend || null, friendId: friend?._id || null })
      }
    }
  },
  methods: {
    onValidated () {
      if (this.focusCount < 3) {
        return
      }

      this.$attrs.listeners?.validated?.()
      this.$emit('validated')
    },

    onFocus () {
      if (this.focusCount < 3) {
        this.focusCount++
      }
    },

    updateValue (changes) {
      this.$emit('input', {
        source: null,
        advType: null,
        friendId: null,
        friend: null,
        ...this.value,
        ...changes
      })
    }
  }
}
</script>
