<template>
  <div @focusin="$attrs.listeners.focus">
    <div class="flex justify-between items-center">
      <base-input-text
        v-model="_inPresencePrice"
        class="flex-1"
        :label="$attrs.inPresencePriceLabel"
        :placeholder="$attrs.inPresencePricePlaceholder"
        :tooltip="$attrs.inPresencePriceTooltip"
        :mask="priceMask"
      />
      <base-switcher
        :value="inPresenceSingleBuy"
        class="ml-4"
        :true-text="$t('calendar.course_modal.single_buy.on')"
        :false-text="$t('calendar.course_modal.single_buy.off')"
        false-color="#be0000"
        @input="$emit('update:inPresenceSingleBuy', $event)"
      />
    </div>
    <div class="flex justify-between items-center">
      <base-input-text
        v-model="_remotePrice"
        class="flex-1"
        :label="$attrs.remotePriceLabel"
        :placeholder="$attrs.remotePricePlaceholder"
        :tooltip="$attrs.remotePriceTooltip"
        :mask="priceMask"
        @input="$emit('update:remotePrice', parseNumber($event))"
      />
      <base-switcher
        :value="remoteSingleBuy"
        class="ml-4"
        :true-text="$t('calendar.course_modal.single_buy.on')"
        :false-text="$t('calendar.course_modal.single_buy.off')"
        false-color="#be0000"
        @input="$emit('update:remoteSingleBuy', $event)"
      />
    </div>
    <template v-if="inPresenceSingleBuy || remoteSingleBuy">
      <div class="flex">
        <base-input-date :value="singleBuyStart" :label="$attrs.singleBuyStartLabel" @input="$emit('update:singleBuyStart', $event)" />
        <base-input-date :value="singleBuyEnd" class="ml-4" :label="$attrs.singleBuyEndLabel" @input="$emit('update:singleBuyEnd', $event)" />
      </div>
      <div class="flex items-center my-2">
        <div class="flex items-center flex-1">
          <span class="uppercase">{{ $attrs.limitSingleBuyLabel }}</span>
          <base-icon
            v-tippy="{
              content: $attrs.limitSingleBuyTooltip,
              placement: 'bottom',
            }
            "
            class="ml-2"
            name="question-circle"
            size="20"
          />
        </div>
        <base-switcher
          :value="limitSingleBuy"
          true-text="YES"
          false-text="NO"
          false-color="#be0000"
          @input="$emit('update:limitSingleBuy', $event)"
        />
      </div>
    </template>
    <base-select
      :value="vatRateId"
      :items="vatRates"
      item-value="_id"
      :label="$attrs.vatLabel"
      :placeholder="$attrs.vatPlaceholder"
      :tooltip="$attrs.vatTooltip"
      @input="$emit('update:vatRateId', $event)"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export default {
  inheritAttrs: false,
  props: {
    inPresenceSingleBuy: Boolean,
    remoteSingleBuy: Boolean,
    inPresencePrice: { type: Number, default: 0 },
    remotePrice: { type: Number, default: 0 },
    singleBuyStart: Date,
    singleBuyEnd: Date,
    limitSingleBuy: Boolean,
    vatRateId: { type: String, default: '' }
  },
  data: () => ({
    priceMask: createNumberMask({
      prefix: '€ ',
      allowDecimal: true,
      decimalSymbol: ',',
      thousandsSeparatorSymbol: ' '
    })
  }),
  computed: {
    ...mapState('country', ['vatRates']),
    _inPresencePrice: {
      get () {
        return this.inPresencePrice.toString().replace('.', ',')
      },
      set (v) {
        this.$emit('update:inPresencePrice', this.parseNumber(v))
      }
    },
    _remotePrice: {
      get () {
        return this.remotePrice.toString().replace('.', ',')
      },
      set (v) {
        this.$emit('update:remotePrice', this.parseNumber(v))
      }
    }
  },
  created () {
    const defaultVatRate = this.vatRates.find(vatRate => vatRate.isDefault)

    if (defaultVatRate) {
      this.$emit('update:vatRateId', defaultVatRate._id)
    }
  },
  methods: {
    parseNumber (v) {
      if (v) {
        const temp = parseFloat(v.replace(/[^\d,]/g, '').replace(',', '.'))
        return Number.isFinite(temp) ? temp : 0
      } else {
        return 0
      }
    }
  }
}
</script>
