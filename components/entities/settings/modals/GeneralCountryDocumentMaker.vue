<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${entityName || $t(entityType)}`"
    :loading="saving"
    :disabled="!entity.area || ('content' in entity && !entity.content)"
    @done="submit"
  >
    <base-form v-slot="{ rules }" class="h-full flex flex-col">
      <base-select
        v-if="!fixedArea"
        v-model="entity.area"
        label="Area"
        placeholder="Area"
        :items="areas"
        item-text="title"
        item-value="name"
        :rules="[rules.required]"
      />

      <base-input-text
        v-else
        :value="fixedArea ? fixedArea.title : null"
        :rules="[rules.required]"
        readonly
      />

      <base-input-editor
        v-if="hasIntro"
        v-model="entity.intro"
        placeholder="Intro"
        :dynamic-fields="dynamicFields"
        autofocus
        no-modal
        class="h-48 min-h-48"
      />

      <slot :rules="rules" :entity="entity" :area="selectedArea">
        <base-input-editor
          v-model="entity.content"
          placeholder="Content"
          :rules="[rules.required]"
          :dynamic-fields="dynamicFields"
          class="flex-grow mt-4 h-full"
          no-modal
          style="min-height: 200px;"
        />
      </slot>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  props: {
    // Name of the entity type
    entityType: { type: String, default: '' },

    // List of areas
    areas: { type: Array, default: () => [] },

    // Save function, should return a promise
    save: { type: Function, required: true }
  },
  data () {
    return {
      entityName: null,
      entity: {},
      fixedArea: null,
      saving: false,
      partiesFields: {
        individual: [
          'name',
          'surname',
          'address',
          'place-of-birth',
          'date-of-birth',
          'personal-identification-number',
          'personal-tax-number',
          'email',
          'mobile-phone',
          'landline-phone'
        ].map(value => ({ text: value.replace(/-/g, ' '), value })),

        business: [
          'company-name',
          'company-brand',
          'address-legal',
          'address-operative',
          'VAT-code-ID',
          'Fiscal-code-ID',
          'email',
          'mobile-phone',
          'landline-phone',
          'directors'
        ].map(value => ({ text: value.replace(/-/g, ' '), value }))
      },
      partyPrefixes: {
        source: { text: 'Source', value: 'source' },
        destination: { text: 'Destination', value: 'destination' }
      }
    }
  },
  computed: {
    selectedArea () {
      return this.entity.area
        ? this.areas.find(a => a.name === this.entity.area)
        : null
    },

    parties () {
      const { parties = { source: null, destination: null } } = this.selectedArea || {}
      return parties
    },

    hasIntro () {
      return this.selectedArea
        ? !!this.selectedArea.intro
        : this.areas.some(a => a.intro)
    },

    dynamicFields () {
      const fields = []

      for (const partyTypeKey of ['source', 'destination']) {
        const partyPrefix = this.partyPrefixes[partyTypeKey]
        const party = this.parties[partyTypeKey]

        if (party && this.partiesFields[party]) {
          fields.push(...this.partiesFields[party].map(field => ({
            text: partyPrefix.text + ' ' + field.text,
            value: partyPrefix.value + '.' + field.value
          })))
        }
      }

      return fields
    }
  },
  methods: {
    show ({ area = null, item = null, name = null, readyItem } = {}) {
      this.fixedArea = area
      this.entityName = name

      this.entity = readyItem || this.$utils.extract(item, {
        _id: undefined,
        countryId: this.$route.params.id,
        area: area ? area.name : null,
        intro: area && area.intro ? null : undefined,
        content: ''
      })

      this.$refs.modal.show()
    },
    async submit () {
      this.saving = true
      await this.save(this.entity).then((response) => {
        if (response.success) {
          this.$refs.modal.hide()
          this.$emit('done')
          this.$notifier.success(response.message)
        }
      })
      this.saving = false
    }
  }
}
</script>
