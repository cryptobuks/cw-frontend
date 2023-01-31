<template>
  <base-modal
    ref="baseModal"
    :title="title"
    :loading="submitting"
    @shown="onShown"
    @dismiss="onDismiss"
    @hidden="onHidden"
  >
    <template #activator>
      <slot />
    </template>

    <slot name="top" />

    <base-form v-slot="{ rules }" @submit.prevent>
      <base-progressive-fields-container :fields="fields" :data="draft">
        <template #name="{ inputAttrs }">
          <base-input-autocomplete
            v-model.trim="draft.name"
            v-bind="inputAttrs"
            class="relative z-10"
            active
            @blur="draftName = $event.target.value"
          >
            <template #prepend-icon>
              <!-- TODO: Refine color swatches generation logic -->
              <v-swatches
                v-model="draft.color"
                shapes="circles"
                :swatches="colorChoices"
                :swatch-size="20"
                background-color="#4a4a4a"
                fallback-input-class="vue-swatches-fallback-input-class"
                fallback-ok-class="vue-swatches-fallback-ok-class"
                :trigger-style="{ width: '20px', height: '20px' }"
                show-fallback
                fallback-input-type="color"
              />
            </template>
          </base-input-autocomplete>
        </template>

        <template #description="{ inputAttrs }">
          <base-textarea
            v-model.trim="draft.description"
            :rules="[rules.maxLength(300)]"
            v-bind="inputAttrs"
          />
        </template>

        <template #sports="{ inputAttrs }">
          <base-select
            v-model="draft.sports"
            :items="sportInterests"
            item-text="name"
            item-value="_id"
            v-bind="inputAttrs"
            hide-selected
          />
        </template>

        <template #activityId="{ inputAttrs }">
          <base-select
            v-model="draft.activityId"
            :items="activities"
            item-text="name"
            item-value="_id"
            v-bind="inputAttrs"
          />
        </template>

        <template #age="{ inputAttrs }">
          <cw-input-age-range v-model="age" v-bind="inputAttrs" />
        </template>

        <template #lessons="{ inputAttrs }">
          <cw-input-lesson :value="draft.lessons" v-bind="inputAttrs" />
        </template>

        <template #courseprice="{ inputAttrs }">
          <cw-input-course-price
            :in-presence-price.sync="draft.inPresence.price"
            :in-presence-single-buy.sync="draft.inPresence.singleBuy"
            :remote-price.sync="draft.inRemote.price"
            :remote-single-buy.sync="draft.inRemote.singleBuy"
            :single-buy-start.sync="draft.singleBuyDate.start"
            :single-buy-end.sync="draft.singleBuyDate.end"
            :limit-single-buy.sync="draft.limitSingleBuy"
            :vat-rate-id.sync="draft.vatRateId"
            v-bind="inputAttrs"
          />
        </template>

        <template #intensity="{ inputAttrs }">
          <cw-input-intensity
            v-model.number="draft.intensity"
            v-bind="inputAttrs"
          />
        </template>

        <template #note="{ inputAttrs }">
          <base-textarea
            v-model.trim="draft.note"
            :rules="[rules.maxLength(300)]"
            v-bind="inputAttrs"
          />
        </template>

        <template #misc="{ inputAttrs }">
          <cw-input-misc-course-options
            class="mt-8"
            :chat-group.sync="draft.chatGroup"
            :reporting.sync="draft.reporting"
            :is-public.sync="draft.isPublic"
            :guests.sync="draft.guests"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <template #actions>
      <base-button lg inline class="flex-shrink-0" @click="submit('save')">
        <base-icon name="save" size="25" />
      </base-button>

      <base-button
        lg
        :disabled="isDisabled"
        class="ml-5 flex-grow"
        @click="submit('publish')"
      >
        {{ $t("global.publish") }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import VSwatches from 'vue-swatches'
import { mapState, mapGetters, mapActions } from 'vuex'
import { courseDraftObservable } from '../shared'

export default {
  components: {
    VSwatches
  },
  data () {
    return {
      draftName: '',
      fields: [
        {
          name: 'name',
          label: this.$t('calendar.course_modal.name.label'),
          placeholder: this.$t('calendar.course_modal.name.placeholder'),
          required: true
        },
        {
          name: 'description',
          label: this.$t('calendar.course_modal.description.label'),
          placeholder: this.$t('calendar.course_modal.description.placeholder'),
          maxlength: '300'
        },
        {
          name: 'sports',
          label: this.$t('calendar.course_modal.sports.label'),
          placeholder: this.$t('calendar.course_modal.sports.placeholder')
        },
        {
          name: 'activityId',
          label: this.$t('calendar.course_modal.activity.label'),
          placeholder: this.$t('calendar.course_modal.activity.placeholder'),
          required: true
        },
        {
          name: 'age',
          tooltip: this.$t('calendar.course_modal.age.tooltip'),
          isEmpty: () => true
        },
        {
          name: 'lessons',
          label: this.$t('calendar.course_modal.lessons.label'),
          tooltip: this.$t('calendar.course_modal.lessons.tooltip')
        },
        {
          name: 'courseprice',
          inPresencePriceLabel: this.$t('calendar.course_modal.in_presence_price.label'),
          inPresencePricePlaceholder: this.$t('calendar.course_modal.in_presence_price.placeholder'),
          inPresencePriceTooltip: this.$t('calendar.course_modal.in_presence_price.tooltip'),
          remotePriceLabel: this.$t('calendar.course_modal.remote_price.label'),
          remotePricePlaceholder: this.$t('calendar.course_modal.remote_price.placeholder'),
          remotePriceTooltip: this.$t('calendar.course_modal.remote_price.tooltip'),
          singleBuyStartLabel: this.$t('calendar.course_modal.single_buy_start.label'),
          singleBuyEndLabel: this.$t('calendar.course_modal.single_buy_end.label'),
          limitSingleBuyLabel: this.$t('calendar.course_modal.limit_single_buy.label'),
          limitSingleBuyTooltip: this.$t('calendar.course_modal.limit_single_buy.tooltip'),
          vatLabel: this.$t('calendar.course_modal.vat.label'),
          vatPlaceholder: this.$t('calendar.course_modal.vat.placeholder'),
          vatTooltip: this.$t('calendar.course_modal.vat.tooltip')
        },
        {
          name: 'intensity',
          tooltip: this.$t('calendar.course_modal.intensity.tooltip'),
          isEmpty: () => true
        },
        {
          name: 'note',
          label: this.$t('calendar.course_modal.notes.label'),
          placeholder: this.$t('calendar.course_modal.notes.placeholder'),
          tooltip: this.$t('calendar.course_modal.notes.tooltip'),
          maxlength: '300'
        },
        {
          name: 'misc',
          courseChatLabel: this.$t('calendar.course_modal.course_chat.label'),
          courseChatTooltip: this.$t('calendar.course_modal.course_chat.tooltip'),
          coniReportingLabel: this.$t('calendar.course_modal.coni_reporting.label'),
          coniReportingTooltip: this.$t('calendar.course_modal.coni_reporting.tooltip'),
          courseTypeLabel: this.$t('calendar.course_modal.course_type.label'),
          courseTypeTooltip: this.$t('calendar.course_modal.course_type.tooltip'),
          guestsLabel: this.$t('calendar.course_modal.guests.label'),
          guestsPlaceholder: this.$t('calendar.course_modal.guests.placeholder')
        }
      ],
      draft: courseDraftObservable,
      initialColorChoices: [
        '#0c6200',
        '#9c40c7',
        '#31c74d',
        '#950a8c',
        '#52ae15',
        '#0278ed',
        '#fbb212',
        '#b590ff',
        '#7ea800',
        '#683e97',
        '#bed03c',
        '#ff88e7',
        '#5c8b00',
        '#f9217e',
        '#02dbe3',
        '#b7002c',
        '#00bef5',
        '#f57917',
        '#028ed7',
        '#9f2201',
        '#6ed8c7',
        '#ff4269',
        '#01743b',
        '#a30256',
        '#94d5a0',
        '#454e8d',
        '#b15400',
        '#019376',
        '#f7aef4',
        '#8d7300',
        '#ff9bb4',
        '#c4cc7a',
        '#8f3614',
        '#ffb3ac',
        '#774719',
        '#ffa786',
        '#824126',
        '#ff9f5e',
        '#ba8166',
        '#ffa56f'
      ],
      hasUnsavedData: false,
      submitting: false
    }
  },
  computed: {
    ...mapState('calendar', ['courses', 'activities']),
    ...mapGetters({
      usedColors: 'calendar/usedCourseColors',
      sportInterests: 'settings/sportInterests'
    }),
    title () {
      return `${this.$t('global.manage')} ${this.draftName || this.$t('calendar.course_modal.new_course')}`
    },
    colorChoices () {
      const usedColors = { ...this.usedColors }
      const output = this.initialColorChoices.filter(
        color => !(color in this.usedColors)
      )

      while (output.length < this.initialColorChoices.length) {
        const color = this.$utils.getNewColor(this.usedColors)
        output.push(color)
        usedColors[color] = true
      }

      return output
    },
    age: {
      get () {
        const { min, max } = this.draft.age
        return [min, max]
      },
      set (age) {
        const [min, max] = age
        this.draft.age = { min, max }
      }
    },
    isDisabled () {
      const { name, activityId, lessons } = this.draft
      return !name || !activityId || !lessons.length
    }
  },
  created () {
    if (!this.sportInterests?.length) {
      this.getSportInterests()
    }
  },
  methods: {
    ...mapActions('settings', ['getSportInterests']),
    ...mapActions('calendar', ['createCourse']),
    show () {
      this.$refs.baseModal.show()
    },
    onShown () {
      this.draft.color = this.colorChoices[0]
      this.unwatch = this.$watch(
        'draft',
        () => {
          this.hasUnsavedData = true
        },
        { deep: true }
      )
    },
    onDismiss () {
      if (this.hasUnsavedData) {
        this.$confirm(
          this.$t('calendar.course_modal.confirm_exit'),
          () => {
            this.$refs.baseModal.hide()
          }
        )
      } else {
        this.$refs.baseModal.hide()
      }
    },
    onHidden () {
      // reset state
      this.unwatch()
      courseDraftObservable.reset()
      Object.assign(this.$data, this.$options.data.call(this))
    },
    async submit (mode) {
      this.submitting = true

      const {
        name,
        description,
        color,
        sports,
        activityId,
        age,
        lessons,
        inPresence,
        inRemote,
        singleBuyDate,
        vatRateId,
        note,
        intensity,
        // chatGroup,
        reporting,
        isPublic,
        guests
      } = this.draft

      await this.createCourse({
        status: mode === 'publish' ? 'active' : 'draft',
        name,
        description,
        color,
        sports,
        activityId,
        age,
        lessons,
        inPresence,
        inRemote,
        ...(singleBuyDate.start && singleBuyDate.end ? singleBuyDate : null),
        vatRateId,
        note,
        intensity,
        // chatGroup,
        reporting,
        isPublic,
        guests: guests.map(i => ({ profileId: i }))
      })

      this.submitting = false
      this.$refs.baseModal.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep .vue-swatches-fallback-input-class {
  @apply py-0 !important;
}

::v-deep .vue-swatches-fallback-ok-class {
  background-color: #86cf9e;
}
</style>
