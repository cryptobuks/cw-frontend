<template>
  <base-input-text
    v-model="link"
    :placholder="placeholder || label || $t('input.link.placeholder')"
    :label="siteName || label || $t('input.link.label')"
    :rules="{
      syntax: isURL,
      ...$attrs.rules
    }"
    :prepend-icon="`social-${siteName || 'web'}`"
    v-bind="$attrs"
    v-on="$utils.except($listeners, 'input')"
    @validated="prependProtocol"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Object, default: null },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' }
  },
  data () {
    return {
      supportedSites: Object.freeze([
        { name: 'facebook', domains: ['facebook.com', 'fb.com'] },
        { name: 'linkedin', domains: ['linkedin.com', 'linked.in'] },
        { name: 'instagram', domains: ['instagram.com', 'instagr.am'] },
        { name: 'youtube', domains: ['youtube.com', 'youtu.be'] },
        { name: 'twitter', domains: ['twitter.com'] },
        { name: 'skype', domains: ['skype.com'] }
      ])
    }
  },
  computed: {
    link: {
      get () {
        return this.value?.link || ''
      },

      set (link) {
        this.$emit('input', {
          link: (link || '').toLowerCase(),
          type: this.getLinkType(link)
        })
      }
    },

    siteName () {
      const { type } = this.value || {}
      return type && type !== 'url' ? type : null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (!v) {
          this.$emit('input', {
            type: 'url',
            link: null
          })
        } else if (!v.type) {
          Object.assign(v, { type: this.getLinkType(v.link) })
        }
      }
    }
  },
  methods: {
    getLinkType (link) {
      if (!link) {
        return 'url'
      }

      const str = link && link.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '')
      if (str) {
        for (const site of this.supportedSites) {
          if (site.domains.some(domain => str === domain || str.startsWith(domain + '/'))) {
            return site.name
          }
        }
      }

      return 'url'
    },

    isURL (val) {
      return !val ||
        /^(https?:\/\/(www\.)?)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(val) ||
        this.$t('input.link.validation.syntax')
    },

    prependProtocol () {
      const link = this.link
      if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
        this.link = 'https://' + link.trim().replace(/^\/\//, '')
      }
    }
  }
}
</script>
