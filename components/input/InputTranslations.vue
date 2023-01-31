<template>
  <div>
    <template
      v-for="lang in languages"
    >
      <component
        :is="textarea ? 'base-textarea' : 'base-input-text'"
        v-if="!hiddenLanguages.includes(lang.language)"
        :key="lang.language"
        v-model="value[lang.language]"
        :label="lang.label"
        :tooltip="lang.label"
        :rules="{
          unique: v => checkUniqueness(v, lang.language)
        }"
        v-bind="$attrs"
      >
        <template #prepend-icon>
          <img :src="`/images/flag/${lang.language}.svg`">
        </template>
      </component>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseInputText from '~/components/global/InputText'
import BaseTextarea from '~/components/global/Textarea'
export default {
  components: {
    BaseInputText,
    BaseTextarea
  },
  inheritAttrs: false,
  props: {
    value: { type: Object, required: true },
    hiddenLanguages: { type: Array, default: () => [] },
    uniqueTranslations: { type: Object, default: () => ({}) },
    textarea: Boolean
  },
  computed: {
    ...mapState('settings', ['languages'])
  },
  methods: {
    checkUniqueness (value, language) {
      const v = value?.trim?.()?.toLowerCase?.()
      return (
        !v ||
        !this.uniqueTranslations?.[language]?.includes(v) ||
        `${value} already present, it must be unique.`
      )
    }
  }
}
</script>
