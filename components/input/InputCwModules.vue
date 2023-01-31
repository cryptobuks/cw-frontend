<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="areas.length ? value : []"
    :label="$attrs.label || $t('input.cw_modules.label')"
  >
    <template #item="{ item }">
      <base-swipe-card
        auto-height
        bg-color="#404040"
        toggler-class="-mr-2"
        body-class="pr-2"
        :hide-actions="expanded"
        :actions="[
          (
            item.isActive
              ? { icon: 'pause', bgColor: 'red' }
              : { icon: 'replay', bgColor: 'green' }
          ),
          { icon: 'eye', handler: () => showModal(item) }
        ]"
      >
        <template #default="{ isMenuOpened }">
          <div class="flex items-center mb-2" @click="!isMenuOpened && (expanded = !expanded)">
            <h4 v-if="modules[item.area]" v-auto-resize-text="{ tooltipOnly: true }" class="uppercase mr-4 text-base font-bold">
              {{ $t(modules[item.area].key) }}
            </h4>

            <span class="uppercase text-xs font-semibold opacity-50 ml-auto" :class="{ 'text-green': item.isActive }">
              {{ $t('input.cw_modules.card.' + (item.isActive ? 'active' : 'inactive')) }}
              12.12.19
            </span>

            <base-icon v-show="expanded" name="chevron-up" class="text-xl ml-2 cursor-pointer" />
          </div>

          <cw-module-summary
            :cw-module="modules[item.area]"
            :paid-by="headquater ? headquater.displayName : gymName"
            :discounts="
              expanded || !item.discounts ?
                item.discounts || []
                : item.discounts.filter(d => today.isBefore($dayjs(d.end)))
            "
            :currency="currencySymbol"
          />
        </template>
      </base-swipe-card>
    </template>

    <base-modal
      ref="modal"
      :title="(draftModuleName + ' ' + $t('input.cw_modules.module')).toUpperCase()"
      @done="onModalDone"
    >
      <template v-if="draft && modules[draft.area]">
        <!-- Description -->
        <section class="mb-8">
          <div class="text-lg uppercase font-bold flex justify-between items-center">
            <h3>{{ $t('input.cw_modules.description') }} {{ draftModuleName }}</h3>

            <!-- TOGGLER -->
            <base-switcher
              v-if="draft.area !== 'start'"
              v-model="draft.isActive"
              true-text="ACTIVE"
              false-text="INACTIVE"
            />
          </div>

          <p v-if="modules[draft.area].description" class="mt-2">
            {{ modules[draft.area].description }}
          </p>
        </section>

        <!-- Discount -->
        <base-form class="mb-16">
          <h3 class="text-lg uppercase font-bold flex justify-center items-center mb-2">
            {{ $t('input.cw_modules.discount.label') }}

            <base-icon v-tippy="$t('input.cw_modules.discount.tooltip')" name="question-circle" class="ml-2" />
          </h3>

          <div v-for="(item, i) in draft.discounts" :key="i" class="flex items-center w-full max-w-5xl mx-auto">
            <div class="w-1/3 px-3 overflow-hidden">
              <base-input-text
                v-model.number="item.discount"
                :label="$t('global.discount')"
                type="number"
                min="0"
                max="100"
                :affix="item.discount ? '%' : ''"
              />
            </div>

            <div class="w-1/3 px-3">
              <base-input-date
                v-model="item.start"
                :max="item.end ? $dayjs(item.end).subtract(1, 'day').toDate() : null"
                :label="$t('input.cw_modules.discount_start.label')"
                hide-prepend
                input-class="max-w-32"
              />
            </div>

            <div class="w-1/3 px-3">
              <base-input-date
                v-model="item.end"
                :min="item.start ? $dayjs(item.start).add(1, 'day').toDate() : null"
                :label="$t('input.cw_modules.discount_end.label')"
                hide-prepend
                input-class="max-w-32"
              />
            </div>

            <div v-if="i === draft.discounts.length - 1">
              <base-icon
                name="add"
                class="mb-4 cursor-pointer"
                @click="draft.discounts.push({ credit: null, start: null, end: null })"
              />
            </div>
          </div>
        </base-form>

        <!-- Summary -->
        <section class="mb-16">
          <h3 class="text-lg uppercase font-bold flex justify-center items-center mb-4">
            {{ draftModuleName }}

            {{ $t('input.cw_modules.offers.label') }}

            <!-- <base-icon v-tippy="$t('input.cw_modules.offers.tooltip')" name="question-circle" class="ml-2" /> -->

            <!-- Paid by gym toggler -->
            <base-switcher
              v-if="headquater"
              v-model="draft.paidByGroup"
              :true-text="$t('input.cw_modules.paid_by_group')"
              :false-text="$t('input.cw_modules.paid_by_gym')"
              class="flex-shrink-0 ml-4"
            />
          </h3>

          <div v-if="draft.area === 'readyToUse'" class="flex justify-center">
            <div class="mx-auto w-48">
              <base-input-text
                v-model.number="draft.contactsCount"
                :label="$t('input.cw_modules.ready_contacts.label')"
                :placeholder="$t('input.cw_modules.ready_contacts.placeholder')"
                type="number"
                min="0"
              />
            </div>
          </div>

          <cw-module-summary
            v-if="modules[draft.area]"
            :cw-module="modules[draft.area]"
            :currency="currencySymbol"
            :discounts="draft.discounts"
            class="text-center"
          />
        </section>

        <section>
          <cw-editor-text-viewer v-if="contract && contract.content" :value="contract.content" />
        </section>
      </template>
    </base-modal>
  </cw-input-subflow-wrapper>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import CwModuleSummary from './organisms/CwModuleSummary'
export default {
  components: {
    CwModuleSummary
  },
  inheritAttrs: false,
  props: {
    // [{ area: String, paidByGroup: Boolean, discount: Number, isActive: Boolean }]
    value: { type: Array, default: () => [] },
    countryCode: { type: String, default: null },
    headquater: { type: Object, default: null },
    gymName: { type: String, default: '' }
  },
  data () {
    return {
      draft: {
        isActive: false,
        paidByGroup: false,
        discounts: [],
        area: null,
        contactsCount: null
      },
      areas: [],
      today: this.$dayjs().endOf('day'),
      expanded: false
    }
  },
  computed: {
    ...mapState('country', ['contract', 'managedCountries']),
    modules () {
      const modulesByName = {}

      for (const area of this.areas) {
        const activeTerm = area.items.find(item => item.status === 'active')
        modulesByName[area.name] = {
          priceOneOff: activeTerm?.oneOff,
          priceForYear: activeTerm?.forYear,
          description: activeTerm?.description,
          ...area
        }
      }

      return modulesByName
    },
    currencySymbol () {
      const { currency: { symbol = null } = {} } = this.managedCountries.find(c => c.code === this.countryCode) || {}
      return symbol || '$'
    },
    draftModuleName () {
      const key = this.modules[this.draft?.area]?.key
      return key ? this.$t(key) : ''
    }
  },
  async created () {
    await this.getManagedCountries()
    await this.fetchPriceLists()
  },
  methods: {
    ...mapActions('country', ['getPriceListList', 'getManagedCountries']),

    showModal (cwModule) {
      this.draft = this.$utils.extract(cwModule, ['isActive', 'area', 'paidByGroup', { from: 'discounts', default: [] }])
      if (!this.draft.discounts?.length) {
        this.draft.discounts = [{ discount: null, start: null, end: null }]
      }

      this.$refs.modal.show()
    },

    onModalDone () {
      const i = this.value.findIndex(c => c.area === this.draft.area)
      this.value.splice(i, 1, {
        ...this.value[i],
        ...this.draft
      })

      this.$refs.modal.hide()
    },

    setModuleActivation (cwModule, event) {
      if (cwModule.area !== 'start') {
        const i = this.value.indexOf(cwModule)
        this.value.splice(i, 1, {
          ...cwModule,
          isActive: event.target.checked
        })
      } else {
        event.target.checked = cwModule.isActive
      }
    },

    async fetchPriceLists () {
      const country = this.countryCode && this.managedCountries.find(c => c.code === this.countryCode)

      if (country) {
        this.areas = await this.getPriceListList({ countryId: country._id })

        const cwModules = []

        for (const area of this.areas) {
          const activePrice = area.items.find(item => item.status === 'active')
          if (activePrice) {
            cwModules.push((this.value && this.value.find(m => m.area === area.name)) || {
              area: area.name,
              discounts: [],
              isActive: area.name === 'start',
              paidByGroup: false
            })
          }
        }

        this.$emit('input', cwModules)
      }
    }
  }
}
</script>
