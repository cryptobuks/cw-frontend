<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${
      (entity && entity.name) || $t('nav.activities')
    }`"
    :loading="saving"
    :disabled="!entity.name || !isAvailable"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-progressive-fields-container
        ref="fields"
        :data="entity"
        :fields="fields"
        :show-all-fields="'_id' in entity"
      >
        <template #name="{ inputAttrs }">
          <base-input-text
            v-model="entity.name"
            :rules="[rules.unique(availableActivities)]"
            v-bind="inputAttrs"
            :tooltip="$t('activity.name_tooltip')"
            :label="$t('activity.name_label')"
            :placeholder="$t('activity.name_placeholder')"
          />
        </template>
        <template #assets="{ inputAttrs }">
          <base-select
            v-model="entity.assets"
            :tooltip="$t('activity.asset_tooltip')"
            :label="$t('activity.asset_label')"
            :placeholder="$t('activity.asset_placeholder')"
            :items="gymAssets"
            item-text="name"
            item-value="_id"
            hide-selected
            searchable
            sort-by-text
            v-bind="inputAttrs"
            @focus="callNext"
          >
            <template #empty>
              Not option left
            </template>

            <template #not-found>
              No result found
            </template>
          </base-select>
        </template>
        <template #visibility="{ inputAttrs }">
          <base-switcher
            ref="visibility"
            v-model="entity.visibility"
            class="border border-black border-opacity-25 rounded-full self-end"
            true-text="PRIVATE"
            false-text="PUBLIC"
            v-bind="inputAttrs"
            false-color="black"
            @focusin="onFocus(inputAttrs.listeners.focus)"
          />
        </template>
        <template #sport="{ inputAttrs }">
          <base-select
            v-model="entity.sports"
            :tooltip="$t('activity.sport_tooltip,')"
            :label="$t('activity.sport')"
            :placeholder="$t('activity.sport')"
            :items="sportInterests"
            hide-selected
            item-text="name"
            item-value="_id"
            searchable
            v-bind="inputAttrs"
            sort-by-text
          >
            <template #empty>
              Not option left
            </template>

            <template #not-found>
              No result found
            </template>
          </base-select>
        </template>
        <template #description="{ inputAttrs }">
          <base-textarea
            v-model="entity.description"
            :label="$t('activity.description')"
            :placeholder="$t('activity.description')"
            :tooltip="$t('activity.description_tooltip')"
            maxlength="300"
            :disabled="false"
            :rules="[rules.maxLength(300)]"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>
  </base-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      entityName: null,
      entity: {
        name: null,
        sports: [],
        assets: [],
        visibility: false,
        description: ''
      },
      isParent: false,
      selectedSizes: [],
      selectedColors: [],
      saving: false,
      fields: [
        { name: 'name', required: true },
        { name: 'assets', required: true },
        { name: 'visibility' },
        { name: 'sport', class: 'mt-1' },
        { name: 'description' }
      ]
    }
  },
  computed: {
    ...mapState('calendar', ['gymAssets', 'activities']),
    ...mapState('settings', ['sportInterests']),
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    availableActivities () {
      return this.activities.map((item) => {
        return item.name
      })
    },
    isAvailable () {
      return !this.availableActivities?.includes(
        this.entity?.name?.toLowerCase()
      )
    }
  },
  created () {
    if (!this.getGymAssets?.length) {
      this.getGymAssets(this.$auth.user._id)
    }
  },
  methods: {
    ...mapActions({
      saveActivity: 'calendar/saveActivity',
      getGymAssets: 'calendar/getGymAssets'
    }),
    show (entity) {
      this.entity = this.$utils.extract(entity, [
        '_id',
        'name',
        { from: 'assets', default: [] },
        { from: 'sports', default: [] },
        { from: 'visibility', transform: m => m === 'private' }
      ])
      this.$refs.modal.show()
    },
    async save () {
      const { visibility } = this.$utils.extract(this.entity, [
        { from: 'visibility', transform: m => (m ? 'private' : 'public') }
      ])

      const response = await this.saveActivity({ ...this.entity, visibility })
      if (response.success) {
        this.$emit('done', response.data.activity)
        this.$refs.modal.hide()
        this.entity = {
          name: null
        }
        this.$notifier.success(response.message || '')
      }
    },
    onFocus (e) {
      if (typeof e === 'function') {
        e()
      }
    },
    callNext () {
      this.$refs?.visibility?.$emit('focusin')
    }
  }
}
</script>

<style lang="scss" scoped>
.cw-translation-title {
  color: #fff;
  font-size: 20px;
  margin: 30px 0 20px;
}

.cw-sports-interest-update {
  margin-left: 30px;
}
</style>
