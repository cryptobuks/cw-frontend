<template>
  <base-main-card
    v-if="modul"
    v-bind="{
      ...$attrs,
      actions: [{ icon: 'printer', handler: () => {} }],
      bodyClass: 'flex flex-col px-4 py-4 h-full bg-white',
      title: modul && modul.label
    }"
    v-on="$listeners"
  >
    <div class="w-full">
      <div class="flex flex-col space-y-6">
        <div class="space-y-1">
          <h4 class="font-extrabold text-lg text-center uppercase">
            {{ $t('input.cw_modules.description') }}
          </h4>

          <div class="text-sm text-justify" v-html="modul.active.description" />
        </div>
        <div class="space-y-1">
          <h4 class="font-extrabold text-lg text-center uppercase">
            {{ $t('price_list.price') }}
          </h4>

          <div class="text-sm text-center flex flex-col items-center">
            <span class="max-w-full">
              {{ $t('price_list.setup') }}:
              <span
                :class="[
                  modul.modules && modul.modules.discount
                    ? 'text-cw-red line-through'
                    : ''
                ]"
              >{{ modul.active.oneOff }} {{ currencySymbol }}</span>
              <span v-if="modul.modules && modul.modules.discount">
                {{ discount(modul.active.oneOff) }} {{ currencySymbol }}
              </span>
              {{ $t('price_list.una_tantum') }}
            </span>
            <span
              v-if="modul.forYear"
              v-auto-resize-text="{ tooltipOnly: true }"
              class="max-w-full"
            >
              {{ $t('price_list.price') }}: {{ modul.active.forYear }}
              {{ currencySymbol }} / {{ $t('price_list.year_per') }}
              {{ $t(modul.paidKey) }}
            </span>
            <span class="max-w-full">
              {{
                modul.active.status === 'active'
                  ? `${$t('contract.status.active')} ${$dayjs(
                    modul.active.activatedAt
                  ).format('DD.MM.YYYY')}`
                  : null
              }}
            </span>
            <span v-if="modul.modules && modul.modules.paidByGroup">
              PAID BY GROUP
            </span>
          </div>
        </div>
        <div class="space-y-1">
          <h4 class="font-extrabold text-lg text-center uppercase">
            CW {{ $t('input.documents.terms_n_conditions') }}
          </h4>

          <div
            class="text-sm text-justify"
            v-html="modul.contract && modul.contract.content"
          />
        </div>
      </div>
    </div>
    <template v-if="!modul.modules || !modul.modules.isActive" #footer>
      <div class="bg-gray-300 p-2">
        <button
          class="py-4 mx-auto bg-white w-full text-center rounded-lg focus:outline-none"
          @click="confirmChange(true)"
        >
          ACTIVATE
        </button>
      </div>
    </template>
  </base-main-card>
</template>

<script>
import CWModulMixin from '~/mixins/CWModulMixin'
export default {
  mixins: [CWModulMixin],
  props: {
    modules: { type: Array, required: true },
    profile: { type: Object, required: true }
  },
  data: () => ({
    loading: true,
    modul: null
  }),
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        this.modul = this.modules.find(
          modul => modul.active._id === $route.params.moduleId
        )
      }
    }
  },
  methods: {
    getModule () {}
  }
}
</script>
