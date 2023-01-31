<template>
  <base-modal
    v-bind="{
      bodyClass: 'receipt-modal-body',
      footerClass: 'receipt-modal-footer',
      ref: 'modal',
      title: $t('wallet.order_preview'),
    }"
  >
    <div class="px-4 flex flex-col space-y-5 text-sm">
      <div class="flex flex-col space-y-2">
        <b class="font-poppins-bold text-base">
          {{ profile.brand }}
        </b>
        <span>{{ profile.address && profile.address.fulladdress }}</span>
        <span>{{ profile.fiscal && profile.fiscal.value }}</span>
      </div>
      <div class="flex flex-col space-y-3">
        <b class="font-poppins-bold">
          Nr. 2020-123456789 | 17.12.2020 - 10:12:45 | % Total value %
        </b>
        <span>
          By %Purchase name% | %Purchase fiscal ID% | %User name% | %User name
          Fiscal ID%
        </span>

        <ul class="list-disc pl-5 space-y-2">
          <li>Product name% | %Value% (VAT %VAT percentage%)</li>
          <li>%Subscription name% | %value% (VAT % VAT percentage%)</li>
          <li>SimplyGo Lemon 330ml | 5,00 € (VAT 22%)</li>
          <li>Open Super Summer 2020 | 790,00€ (VAT 0% ex. art. 106/97)</li>
        </ul>
      </div>

      <div class="flex flex-col space-y-3">
        <b class="font-poppins-bold">
          Payment receipts from %nr. registeration telematico%
        </b>

        <ul class="list-disc pl-5 space-y-2">
          <li>
            %payment receipt nr.% | %date of payment% | %type of payment% |
            %value%
          </li>
          <li>
            Receipt nr. 123456789123 | 21.06.2020
            <ul class="list-disc pl-5 space-y-1">
              <li>Cash 10,00 € | Collection 50,00 € | Change 40,00€</li>
              <li>Credit Card 34,00€</li>
            </ul>
          </li>
          <li>Receipt nr. 12345689124 | 21.07.2020 | WT | 39,00€</li>
          <li>
            Receipt nr. 123456789124 | 21.07.2020 - 10:45:25 | CC | 39,00€
          </li>
        </ul>
      </div>
    </div>
    <template #actions>
      <base-button lg class="receipt-save-button">
        <base-icon name="printer" size="25" />
      </base-button>
    </template>
  </base-modal>
</template>

<script>
export default {
  props: { profile: { type: Object, required: true } },
  methods: {
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>

<style>
.receipt-modal-body {
  @apply bg-gray-200 text-black !important;
}

.receipt-modal-footer {
  @apply p-0 bg-transparent border-gray-700 border-t !important;
}

.receipt-save-button {
  @apply w-full bg-gray-200 rounded-t-none rounded-b-lg !important;
}
</style>
