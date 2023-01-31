<template>
  <div>
    <div class="flex justify-between items-center pb-2 cursor-pointer">
      <button
        class="flex flex-col items-start text-left text-xs w-full focus:outline-none"
        @click="open = !open"
      >
        <div class="flex items-center justify-between w-full">
          <span class="font-bold text-sm">{{ modul.label }}</span>
          <div class="flex items-center">
            <span
              v-if="price.status === 'active'"
              class="font-bold text-green mr-2 uppercase"
            >
              {{
                `${$t("global.active")} ${$dayjs(price.activatedAt).format(
                  "DD.MM.YYYY"
                )}`
              }}
            </span>
            <base-icon
              v-if="open && nested"
              name="chevron-up"
              class="mr-4"
              size="14"
            />
          </div>
        </div>
        <span v-if="price.oneOff">
          <b class="font-extrabold"> {{ $t("price_list.setup") }}: </b>
          <span>
            {{ price.oneOff }} {{ currencySymbol }}
            {{ $t("price_list.una_tantum") }}
          </span>
        </span>
        <span
          v-if="modul.forYear"
          v-auto-resize-text="{ tooltipOnly: true }"
          class="w-40 lg:w-56 2xl:w-84 break-words"
        >
          <b class="font-extrabold"> {{ $t("price_list.variable_price") }}: </b>
          {{ price.forYear }}
          {{ currencySymbol }} {{ $t("price_list.year_per_average") }}
        </span>
        <span>
          <b class="font-extrabold"> {{ $t("price_list.billed_to") }}: </b>
          {{ profile.displayName }}
        </span>
        <div
          v-for="(discount, disCountIndex) in discounts"
          :key="discount.endDt"
        >
          <span>
            <b class="font-extrabold">
              {{ $t("global.discount") }}
              {{ $dayjs(discount.dates.startDt).format("DD.MM.YY") }} -
              {{ $dayjs(discount.dates.endDt).format("DD.MM.YY") }}:
            </b>
            {{ discount.discount }}%
          </span>
          <ul v-if="disCountIndex === 0" class="list-disc pl-5">
            <li>
              {{ $t("price_list.setup") }} {{ $t("global.discounted") }}:
              {{ discounted(price.oneOff) }} {{ currencySymbol }}
            </li>
            <li>
              {{ $t("price_list.variable_price") }}
              {{ $t("global.discounted") }}: {{ discounted(price.forYear) }}
              {{ currencySymbol }}
            </li>
          </ul>
        </div>
      </button>
      <div v-if="price.status === 'active'" class="flex items-center">
        <base-input-check
          v-if="modul.modules"
          v-model="modul.modules.isActive"
          @change="confirmChange"
        />
      </div>
    </div>
    <slot v-bind="{ open }" />
  </div>
</template>

<script>
import CWModulMixin from '~/mixins/CWModulMixin'
export default {
  mixins: [CWModulMixin],
  props: {
    modul: { type: Object, required: true },
    nested: Boolean,
    exPrices: { type: Array, default: () => [] },
    price: { type: Object, required: true },
    profile: { type: Object, required: true }
  },
  data: () => ({ open: false })
}
</script>

<style>
</style>
