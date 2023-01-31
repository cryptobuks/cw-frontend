<template>
  <base-main-card
    v-bind="$attrs"
    body-class="flex flex-col items-center bg-white h-full wallet-card"
    :actions="[{ name: 'search' }, { icon: 'add' }]"
    v-on="$listeners"
  >
    <cw-receipt-modal v-bind="{ profile, ref: 'receiptModal' }" />
    <cw-plafond-popup ref="plafondPopUp" @update="getWallet" />

    <template #title-text>
      <div class="flex flex-col">
        <div class="flex items-center">
          <span class="uppercase">{{ $t('global.wallet') }}</span>
          <span class="text-gray-500 ml-2">28.09.21</span>
        </div>
        <button
          v-if="!!wallet"
          class="text-sm text-gray-500 text-left underline"
          @click="$refs.plafondPopUp.show(wallet && wallet.plafond)"
        >
          {{ $t('wallet.plafond') }}: {{ wallet.plafond }} €
        </button>
      </div>
    </template>
    <template #action:search>
      <div
        class="inline-flex items-center"
        :class="[searchExpanded ? '-ml-16 xl:-ml-2' : '']"
      >
        <base-advanced-filter
          v-if="searchExpanded"
          v-model="filters"
          border
          sm
          autofocus
          v-bind="{
            textOption: {
              attr: 'search',
              label: $t('global.search_by', { name: $t('global.name') }),
              tooltip: $t('global.search_by', { name: $t('global.name') })
            },
            selectOption: [
              {
                attr: 'status',
                items: [
                  { text: $t('global.active'), value: 'active' },
                  { text: $t('global.suspended'), value: 'suspended' }
                ],
                label: `${$t('global.active')} / ${$t('global.suspended')}`,
                placeholder: $t('filters.label.select_active_or_suspended'),
                tooltip: $t('filters.label.select_active_or_suspended')
              }
            ]
          }"
          class="flex-grow"
        />

        <span class="inline-flex items-center ml-2 h-10 flex-shrink-0">
          <base-icon
            :name="searchExpanded ? 'dismiss' : 'search'"
            class="cursor-pointer text-gray-600"
            :class="{ 'text-xl mr-1': !searchExpanded }"
            @click="searchExpanded = !searchExpanded"
          />
        </span>
      </div>
    </template>

    <div class="flex flex-col space-y-4 py-3 px-2 w-full">
      <div
        v-for="(month, monthIndex) in months"
        :key="`month-index-${monthIndex}`"
        class="flex flex-col"
      >
        <div class="flex items-center space-x-2 mb-1 pl-2">
          <span
            class="font-bold text-lg"
          >{{ month.month }} {{ month.year }} |</span>
          <span class="text-gray-500">{{ month.balance }} €</span>
        </div>
        <div
          v-for="(transaction, transactionIndex) in month.transactions"
          :key="`${month.month}-${month.year}-${transactionIndex}`"
          class="flex flex-col"
        >
          <div class="flex justify-between border">
            <div class="flex cursor-pointer">
              <div class="h-12 w-12 flex flex-col items-center text-gray-700">
                <span class="text-lg">{{ transaction.day }}</span>
                <span class="text-3xs capitalize">{{ month.month }}</span>
              </div>
              <div
                class="ml-3 flex flex-col w-40 sm:w-80 md:w-36 xl:w-40 cursor-pointer px-2"
                :class="[transaction.details ? 'bg-gray-300' : '']"
                @click="transaction.details = !transaction.details"
              >
                <span class="truncate text-gray-600 text-sm">
                  {{ transaction.description }}
                </span>
                <div class="flex items-center justify-between">
                  <div class="flex items-center w-full">
                    <img
                      :src="$utils.getAvatarUrl()"
                      :alt="transaction.profile.name"
                      class="w-4 h-4 rounded-full"
                    >
                    <span class="text-gray-500 ml-0.5 text-2xs">
                      {{ transaction.profile.name }}
                    </span>
                  </div>
                  <button
                    class="bg-gray-300 border-2 border-white text-white text-2xs uppercase w-30"
                  >
                    {{ $t('wallet.ask_to_pay') }}
                  </button>
                </div>
              </div>
            </div>
            <span
              class="text-gray-500 mr-2"
              :class="[transaction.amount < 0 ? 'text-red' : 'text-green']"
            >
              {{ `${transaction.amount >= 0 ? '+' : ''}${transaction.amount}` }}
              €
            </span>
          </div>
          <div
            v-if="transaction.details"
            class="flex bg-gray-300 justify-between items-center w-full p-1 text-gray-600 min-h-10"
          >
            <div class="text-2xs flex space-x-2">
              <span>{{ transaction.description }}</span>
              <button
                class="cursor-ponter lowercase underline"
                @click="$refs.receiptModal.show()"
              >
                ({{ $t('wallet.receipt') }})
              </button>
              <span>{{ transaction.expires }}</span>
            </div>
            <button
              class="cursor-pointer"
              @click="transaction.details = !transaction.details"
            >
              <base-icon name="chevron-up" size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="bg-transparent h-14 px-4 w-full flex items-center justify-between"
      >
        <div class="flex flex-col">
          <div class="flex items-end">
            <span class="text-lg font-poppins-bold uppercase">
              {{ $t('wallet.balance') }}
            </span>
            <span class="text-2xs ml-2 font-extrabold">
              ({{ $t('wallet.if_filtered', { profile: '%profile%' }) }})
            </span>
          </div>
          <span class="text-gray-500 text-2xs italic">
            {{ $t('wallet.installments') }} (28.09.21)
          </span>
        </div>
        <div class="flex flex-col text-right">
          <span class="font-poppins-bold uppercase text-red"> -582,42 € </span>
          <span class="text-gray-500 text-2xs italic"> -800,00 € </span>
        </div>
      </div>
    </template>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } },
  data: () => ({
    filters: {
      keywords: '',
      status: []
    },
    meta: { page: 1, limit: 10 },
    months: [
      {
        month: 'October',
        year: 21,
        balance: -62.9,
        transactions: [
          {
            day: 28,
            description:
              'Installments: Belly dance joung was a purchase that paid off nicely',
            profile: { image: null, name: 'Profile 1' },
            amount: -45.0,
            details: false
          },
          {
            day: 28,
            description:
              'Installments: Karate bay Mon was a purchase that paid off nicely',
            profile: { image: null, name: 'Profile 2' },
            amount: -37.9,
            details: false
          }
        ]
      },
      {
        month: 'September',
        year: 21,
        balance: 912.4,
        transactions: [
          {
            day: 30,
            description:
              'Installments: Belly dance joung Wednesday - Saturday 10.000 - 11.00 sold at 10:01:23 from %Gym Role Name%',
            profile: { image: null, name: 'Profile 1' },
            details: false,
            amount: -45.0
          },
          {
            day: 29,
            description:
              'Installments: Karate bay Mon was a purchase that paid off nicely',
            profile: { image: null, name: 'Profile 2' },
            amount: -37.9,
            details: false
          },
          {
            day: 28,
            description: 'Deposit',
            profile: { image: null, name: 'Profile 123: Cash' },
            paid: true,
            amount: 1000.0,
            details: false
          },
          {
            day: 22,
            description: 'Start Module',
            profile: { image: null, name: 'Cowellness' },
            paid: true,
            amount: -145.0,
            details: false
          },
          {
            day: 22,
            description: 'Powerade blueberry 330ml',
            profile: { image: null, name: 'Profile 4021' },
            paid: true,
            amount: -2.5,
            details: false
          },
          {
            day: 21,
            description: 'MGM Reward',
            profile: { image: null, name: 'Profile 2000' },
            paid: true,
            reciept: true,
            expires: '21.08.2021',
            amount: 100,
            details: false
          },
          {
            day: 8,
            description: 'Hair dryer 20 minutes',
            profile: { image: null, name: 'Profile 21' },
            paid: true,
            amount: 1.2,
            details: false
          },
          {
            day: 2,
            description: 'T-shirt white/blue size 42',
            profile: { image: null, name: 'Profile 2020' },
            paid: true,
            amount: -37.9,
            details: false
          }
        ]
      },
      {
        month: 'August',
        year: 21,
        balance: -651.1,
        transactions: [
          {
            day: 28,
            description: 'Refund: T-shirt white/blue size 42',
            profile: { image: null, name: 'Profile 99' },
            amount: 37.9,
            reciept: true,
            details: false
          },
          {
            day: 3,
            description: 'Spinning Adults TUesday - Friday',
            profile: { image: null, name: 'Profile 991' },
            usedBy: 'Alfonso Davies',
            amount: -1689.9,
            details: false
          }
        ]
      }
    ],
    searchExpanded: false,
    transactions: [],
    wallet: null
  }),
  watch: {
    profile: {
      immediate: true,
      handler () {
        this.getTransactions()
        if (this.$auth.isBusiness()) {
          this.getWallet()
        }
      }
    }
  },
  methods: {
    async getTransactions (meta) {
      meta = meta || this.meta
      const data = await this.$repos.financeRepo.getTransactions(
        this.profile._id,
        meta
      )
      this.transactions = this.transactions.concat(data.transactions)
      this.meta = Number(data._meta.page) + 1
    },
    async getWallet () {
      this.wallet = await this.$repos.financeRepo
        .getUserWallet(this.$auth.user._id, this.profile._id)
        .then(data => data.wallet)
    }
  }
}
</script>

<style>
.wallet-card .base-card .base-card__header {
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
