<template>
  <div>
    <div v-if="cwModule.priceOneOff">
      <span class="font-semibold">{{ $t('cw_modules.summary.setup_price') }}</span>
      {{ cwModule.priceOneOff }}{{ currency }}
      {{ $t('cw_modules.summary.setup_price.text') }}
    </div>

    <div v-if="cwModule.priceForYear">
      <span class="font-semibold">{{ $t('cw_modules.summary.variable_price') }}</span>
      {{ cwModule.priceForYear }}{{ currency }}
      {{ $t('price_list.year_per') }} {{ $t(cwModule.paidKey) }}
    </div>

    <div v-if="paidBy">
      <span class="font-semibold">{{ $t('cw_modules.summary.billable_at') }}</span>
      {{ paidBy }}
    </div>

    <template v-for="(item, i) in discounts">
      <div v-if="item.discount && item.start && item.end" :key="i">
        <div class="font-bold" :class="{'opacity-50': $dayjs().isAfter($dayjs(item.end)) }">
          {{ $t('cw_modules.summary.discount.label') }} {{ $dayjs(item.start).format('DD.MM.YYYY') }}-{{ $dayjs(item.end).format('DD.MM.YYYY') }}:
          <span class="font-normal">
            {{ item.discount }}
          </span>
        </div>

        <ul v-if="$dayjs().isBefore($dayjs(item.end))" class="list-disc list-inside">
          <li v-if="cwModule.priceOneOff">
            {{ $t('cw_modules.summary.discounted.setup') }}: {{ applyDiscount(cwModule.priceOneOff, item.discount) }}{{ currency }}
          </li>

          <li v-if="cwModule.priceForYear">
            {{ $t('cw_modules.summary.discounted.variable') }}: {{ applyDiscount(cwModule.priceForYear, item.discount) }}{{ currency }}
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    cwModule: { type: Object, default: null },
    paidBy: { type: String, default: null },
    discounts: { type: Array, default: () => [] },
    currency: { type: String, default: '$' }
  },
  methods: {
    applyDiscount (price, discount) {
      if (!price) {
        return 0
      }
      const discountValue = discount ? Math.min(100, Math.max(0, discount)) : 0
      return Math.round(price * (100 - discountValue) * 10) / 1000
    }
  }
}
</script>
