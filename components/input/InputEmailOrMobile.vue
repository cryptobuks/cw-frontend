<template>
  <cw-input-phone
    v-if="type === 'tel'"
    ref="input"
    v-bind="$utils.except($attrs, ['label', 'placeholder'])"
    :rules="{
      typeCode: findExistedProfileByMobile
    }"
    v-on="$utils.except($listeners, 'existed')"
    @blur="onBlur"
  />

  <cw-input-email
    v-else-if="type === 'email'"
    ref="input"
    v-bind="$utils.except($attrs, ['label', 'placeholder'])"
    :rules="{
      typeCode: findExistedProfileByEmail
    }"
    v-on="$utils.except($listeners, 'existed')"
    @blur="onBlur"
  />

  <base-input-text
    v-else
    ref="text"
    v-model="text"
    v-bind="$utils.except($attrs, ['hiddenRules', 'rules'])"
    :tooltip="$attrs.tooltip"
    :label="$attrs.label"
    :placeholder="$attrs.placeholder || $attrs.label"
    :rules="{
      syntax: checkTextSyntax
    }"
  />
</template>

<script>
export default {
  props: {
    typeCodes: { type: Array, default: () => ['IN', 'TU'] }
  },
  data () {
    return {
      text: null,
      type: 'text',
      emailRegex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      mobileRegex: /^([+]\d{2})?\d{7,10}$/
    }
  },
  created () {
    this.$store.dispatch('country/getCountries')
  },
  methods: {
    checkTextSyntax (v) {
      const text = v?.toLowerCase().replace(/ /g, '')
      if (this.emailRegex.test(text)) {
        this.$emit('input', text)
        this.type = 'email'
        this.$nextTick(() => this.validate())
      } else if (this.mobileRegex.test(text)) {
        this.$emit('input', text)
        this.type = 'tel'
        this.$nextTick(() => this.validate())
      } else {
        return this.$t('input.email_or_mobile.error.syntax')
      }

      return true
    },

    onBlur () {
      const val = this.$attrs.value
      if ((this.type === 'email' && !val) || (this.type === 'tel' && !val?.phoneNumber)) {
        this.$emit('input', null)
        this.text = null
        this.type = 'text'
        this.$nextTick(() => this.validate())
      }
    },

    async findExistedProfileByMobile () {
      const mobile = this.$attrs.value
      if (mobile?.countryCode && mobile?.phoneNumber) {
        const existedProfile = await this.$repos.profileRepo.getProfileByMobile(mobile)
        return this.onProfileExisted(existedProfile)
      }
    },

    async findExistedProfileByEmail () {
      const email = this.$attrs.value
      const existedProfile = email && await this.$repos.profileRepo.getProfileByEmail(email)
      return this.onProfileExisted(existedProfile)
    },

    onProfileExisted (profile) {
      if (!profile) {
        return this.$emit('new-profile')
      }

      if (!this.typeCodes.includes(profile.typeCode)) {
        return this.$t('input.email_or_mobile.error.invalid_type_code')
      }

      this.$emit('existed-profile', profile)

      return true
    },

    async validate (...params) {
      const $inputs = this.findDescendants(this, c => typeof c.validate === 'function')
      return (await Promise.all($inputs.map($input => $input.validate(...params)))).every(Boolean)
    },

    findDescendants ($parent, check, childs = []) {
      if (!$parent || !$parent.$children) {
        return childs
      }

      for (const child of $parent.$children || []) {
        if (check(child)) {
          childs.push(child)
        } else {
          this.findDescendants(child, check, childs)
        }
      }

      return childs
    }
  }
}
</script>
