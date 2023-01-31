<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${entityName || $t('entities.term_of_payment')}`"
    :loading="$nuxt.$loading.show"
    :disabled="!(entity.day>=0) || !entity.translations.en"
    @done="save"
  >
    <base-form ref="form" v-slot="{ rules }" class="terms-of-payment-form">
      <div class="flex items-end mb-4">
        <base-input-text
          v-model.number="entity.day"
          type="number"
          :tooltip="$t('term_payment.delay_tooltip')"
          :label="$t('term_payment.delay_label')"
          min="0"
          step="1"
          maxlength="100"
          :disabled="false"
          class="mb-0"
          :rules="[rules.required]"
        />

        <base-switcher
          v-model="entity.isEom"
          :false-text="$t('term_payment.type_day')"
          :true-text="$t('term_payment.type_eom')"
          class="ml-3 self-center"
          style="flex-shrink: 0;"
        />
      </div>

      <div class="flex items-end">
        <base-input-text
          v-model="entity.translations.en"
          :label="$t('term_payment.name_en_label')"
          :placeholder="$t('term_payment.name_en_placeholder')"
          maxlength="100"
          tooltip="Name of the term of payment"
          :rules="[rules.required, rules.unique(listOfTerms.en)]"
        >
          <template #prepend-icon>
            <img src="/images/flag/en.svg">
          </template>
        </base-input-text>
      </div>

      <h1 class="cw-translation-title">
        {{ $t('term_payment.translation') }}
      </h1>

      <cw-input-translations
        v-model="entity.translations"
        :hidden-languages="['en']"
        :unique-translations="listOfTerms"
        class="cw-top-translations"
      />
    </base-form>
  </base-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  props: {
    languages: { type: Array, default: () => [] }
  },
  data () {
    return {
      entityName: null,
      entity: {
        day: null,
        isEom: false,
        translations: {}
      }
    }
  },
  computed: {
    ...mapGetters({
      termsOfPayments: 'settings/termsOfPayment'
    }),
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    listOfTerms () {
      const obj = { en: [] }
      this.termsOfPayments.forEach((term) => {
        if (!this.entity._id || this.entity._id !== term._id) {
          for (const key in term.translations) {
            if (obj[key] === undefined) {
              obj[key] = []
            }
            if (term.translations[key]) {
              obj[key].push(term.translations[key].toLowerCase())
            }
          }
        }
      })
      return obj
    }
  },
  watch: {
    'entity.day' (val) {
      this.$set(this.entity, 'day', Math.floor(Math.abs(val)))
    }
  },
  methods: {
    ...mapActions({
      saveTermOfPayment: 'settings/saveTermOfPayment'
    }),
    show (term) {
      this.entity = this.$utils.extract(term, {
        _id: undefined,
        day: null,
        isEom: false,
        translations: {}
      })

      this.entityName = this.entity.translations && this.entity.translations.en

      this.$refs.modal.show()
    },
    save () {
      this.entity.day = Math.abs(this.entity.day)
      this.entity.name = this.entity.translations.en
      this.saveTermOfPayment(this.entity).then((response) => {
        if (response.success) {
          this.$refs.modal.hide()
          this.$notifier.success(response.message)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.terms-of-payment-form {
  .cw-translation-title {
    color: #fff;
    font-size: 20px;
    margin: 30px 0 20px;
  }

  .cw-top-translations {
    margin-left: 30px;
  }
}
</style>
