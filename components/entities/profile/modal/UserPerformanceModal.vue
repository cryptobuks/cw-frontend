<template>
  <base-modal ref="modal" :title="$t('profile.performance.manage')">
    <base-form v-slot="{ rules }" class="flex flex-col justify-between h-full">
      <base-progressive-fields-container
        show-all-fields
        :fields="fields"
        class="flex flex-col space-y-3"
      >
        <template #height="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.height"
            class="justify-self-start"
            type="number"
            :label="$t('performance.body_height.label')"
            :tooltip="$t('performance.body_height')"
            :placeholder="$t('performance.body_height')"
            :rules="[rules.required, rules.min(0), rules.max(250)]"
            :affix="$auth.user.settings.lengthFormat || 'cm'"
            v-bind="inputAttrs"
          />
        </template>

        <template #weight="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.weight"
            class="justify-self-start"
            :label="$t('performance.body_weight.label')"
            type="number"
            :tooltip="$t('performance.body_weight')"
            :rules="[rules.required, rules.min(0)]"
            :placeholder="$t('performance.body_weight')"
            :affix="weightFormat"
            v-bind="inputAttrs"
          />
        </template>

        <template #muscle="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.muscle"
            class="justify-self-start"
            type="number"
            :label="$t('performance.muscle.label')"
            :placeholder="$t('performance.muscle')"
            :tooltip="$t('performance.muscle')"
            :rules="[rules.min(0)]"
            :affix="weightFormat"
            v-bind="inputAttrs"
          />
        </template>
        <template #fat="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.fat"
            class="justify-self-start"
            :label="$t('performance.fat.label')"
            :placeholder="$t('performance.fat')"
            type="number"
            :tooltip="$t('performance.fat')"
            :rules="[rules.min(0)]"
            :affix="weightFormat"
            v-bind="inputAttrs"
          />
        </template>
        <template #tissue="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.tissue"
            class="justify-self-start"
            :label="$t('performance.tissue.label')"
            type="number"
            :rules="[rules.min(0)]"
            :tooltip="$t('performance.tissue')"
            :placeholder="$t('performance.tissue')"
            :affix="weightFormat"
            v-bind="inputAttrs"
          />
        </template>
        <template #bone="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.bone"
            class="justify-self-start"
            :label="$t('performance.bone.label')"
            type="number"
            :rules="[rules.min(0)]"
            :tooltip="$t('performance.bone')"
            :placeholder="$t('performance.bone')"
            :affix="weightFormat"
            v-bind="inputAttrs"
          />
        </template>
        <template #water="{ inputAttrs }">
          <base-input-text
            v-model.number="profilePerformance.water"
            class="justify-self-start"
            :label="$t('performance.water.label')"
            type="number"
            :tooltip="$t('performance.water.tooltip')"
            :placeholder="$t('performance.water.placeholder')"
            :rules="[rules.min(0)]"
            affix="%"
            v-bind="inputAttrs"
          />
        </template>
        <template #measuredAt="{ inputAttrs }">
          <base-input-date
            v-model="profilePerformance.measuredAt"
            v-bind="inputAttrs"
            :label="$t('performance.date')"
            :placeholder="$t('performance.date')"
            :tooltip="$t('performance.date.tooltip')"
            :rules="[rules.required]"
          />
        </template>
      </base-progressive-fields-container>
      <base-button
        type="submit"
        xl
        class="mb-10"
        :loading="saving"
        :disabled="!profilePerformance.height || !profilePerformance.weight"
        @click="createBio"
      >
        <base-icon name="save" />
      </base-button>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  props: {
    lastHeight: { type: Number, default: 0 }
  },
  data () {
    const fields = [
      { name: 'height' },
      { name: 'weight' },
      { name: 'muscle' },
      { name: 'fat' },
      { name: 'tissue' },
      { name: 'bone' },
      { name: 'water' },
      { name: 'measuredAt', default: new Date() }
    ]
    return {
      fields,
      today: new Date(),
      saving: false,
      profileId: null,
      profilePerformance: {
        ...this.$utils.extract(
          {},
          fields.map(f => ({ from: f.name, default: f.default || null }))
        )
      }
    }
  },
  computed: {
    weightFormat () {
      return this.$auth.user.settings.weightFormat || 'kg'
    }
  },

  methods: {
    show (id, currentBio) {
      const transformWeight = w =>
        this.$utils.convertMeasurement(w, this.weightFormat, 'kg')
      if (currentBio) {
        const parentData = this.$utils.extract(currentBio, [
          { from: '_id', to: 'id' },
          { from: 'measuredAt', default: new Date() }
        ])
        const body = this.$utils.extract(currentBio?.body, [
          'height',
          'water',
          { from: 'weight', transform: transformWeight }
        ])
        const mass = this.$utils.extract(currentBio?.body?.mass, [
          { from: 'fat', transform: transformWeight },
          { from: 'muscle', transform: transformWeight },
          { from: 'tissue', transform: transformWeight },
          { from: 'bone', transform: transformWeight }
        ])
        this.profilePerformance = { ...parentData, ...body, ...mass }
      } else {
        this.profilePerformance = this.$utils.extract(currentBio, [
          { from: 'measuredAt', default: new Date() }
        ])
      }
      this.profileId = id
      this.profilePerformance.height = this.lastHeight
      this.$refs.modal.show()
    },
    async createBio () {
      this.saving = true
      const weightFields = ['weight', 'fat', 'muscle', 'tissue']
      const res = await this.$repos.profileRepo.bio[
        this.profilePerformance?.id ? 'update' : 'create'
      ]({
        ...this.profilePerformance,
        ...this.$utils.extract(
          this.profilePerformance,
          weightFields.map(from => ({
            from,
            transform: w =>
              this.$utils.convertMeasurement(w, 'kg', this.weightFormat || 'kg')
          })),
          { ignoreNull: true }
        ),
        measuredAt: this.$utils.formatDate(
          this.profilePerformance.measuredAt,
          'YYYY-MM-DD'
        ),
        profileId: this.profileId
      })
      if (res.success) {
        this.$emit('bioCreated')
        this.$notifier.success(res.message)
        this.profilePerformance = {}
        this.$refs.modal.hide()
      }
      this.saving = false
    }
  }
}
</script>

<style></style>
