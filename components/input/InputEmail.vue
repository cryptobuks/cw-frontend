<template>
  <base-input-text
    ref="email"
    type="email"
    v-bind="$attrs"
    :label="$attrs.label || $t('contact_channel.email')"
    :rules="{
      syntax: checkSyntax,
      valid: checkValidity,
      ...$attrs.rules
    }"
    v-on="$listeners"
  >
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-text>
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    }
  },
  methods: {
    checkSyntax (email) {
      return !email || this.regex.test(email) || this.$t('input.email.validation.syntax')
    },

    async checkValidity (email) {
      return await this.$repos.profileRepo.checkEmailValidity(email) ||
        this.$t('input.email.validation.invalid')
    }
  }
}
</script>
