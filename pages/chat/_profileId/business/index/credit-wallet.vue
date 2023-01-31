<template>
  <base-main-card
    v-bind="$attrs"
    body-class="flex flex-col items-center bg-white h-profile-body"
    :actions="[{ icon: 'calendar' }]"
    v-on="$listeners"
  >
    <template #title-text>
      {{ $t("profile.entities.credit_wallet") }} |
      <span class="text-sm">500.00 C (28 dd)</span>
    </template>
    <div class="flex flex-col space-y-4 w-full p-2">
      <div
        v-for="bill in bills"
        :key="`bills-${bill.month}`"
        class="shadow-cw-card rounded-lg w-full flex flex-col space-y-4 p-4"
      >
        <button
          class="flex justify-between items-center font-extrabold focus:outline-none"
          @click="bill.open = !bill.open"
        >
          <span>{{ bill.month }}</span>
          <div class="space-x-2 text-black flex items-center">
            <span
              :class="[bill.ammount < 0 ? 'text-cw-red' : 'text-green']"
            >{{ bill.amount }} C</span>
            <base-icon v-if="bill.open" name="chevron-down" size="12" />
          </div>
        </button>
        <base-scroll v-if="bill.open" class="mx-2 flex flex-col h-30 px-4">
          <div
            v-for="(spend, dailySPendIndex) in bill.dailySpend"
            :key="`daily-spend-${dailySPendIndex}`"
            class="flex flex-col text-xs text-gray-600"
          >
            <button
              class="flex justify-between items-center focus:outline-none"
              @click="spend.open = !spend.open"
            >
              <span>{{ spend.date }}</span>
              <div class="flex items-center">
                <span class="mr-2" :class="[spend.amount < 5 ? 'text-cw-red' : '']">
                  {{ spend.amount }}
                </span>
                <base-icon
                  v-if="spend.open && spend.items"
                  name="chevron-down"
                  size="8"
                  class="-mr-2"
                />
              </div>
            </button>
            <div v-if="spend.open" class="mx-4 flex flex-col">
              <div
                v-for="(item, index) in spend.items"
                :key="`daily-spend-item-${index}`"
                class="flex justify-between items-center"
              >
                <span>{{ item.title }}</span>
                <span :class="[item.amount < 0 ? 'text-cw-red' : '']">
                  {{ item.amount }}
                </span>
              </div>
            </div>
          </div>
        </base-scroll>
        <div v-else class="flex flex-col space-y-2">
          <span
            v-if="bill.toPay > 0"
            class="text-cw-red font-bold"
          >DEBIT TO PAY -{{ bill.toPay }}</span>
          <button
            v-if="bill.toPay > 0"
            class="w-full border-2 rounded-lg font-bold focus:outline-none h-12"
          >
            BUY Credits
          </button>
          <span v-else class="font-bold text-green">NOTHING TO PAY</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="bg-gray-300 py-2 pr-4 flex items-center">
        <button
          class="ml-3 py-4 mx-auto bg-white w-full text-center rounded-lg focus:outline-none capitalize"
        >
          BUY Credits
        </button>
      </div>
    </template>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } },
  data: () => ({
    bills: [
      {
        month: 'Septmeber 2020',
        amount: -50.1,
        toPay: 5.1,
        open: false,
        dailySpend: [
          { date: '11 Mon', amount: -2.99, open: false },
          { date: '11 Tue', amount: -2.99, open: false },
          {
            date: '11 Wed',
            amount: 11.0,
            open: false,
            items: [
              { title: 'Training Plans', amount: -1.0 },
              { title: 'Email promotions', amount: -0.24 },
              { title: 'Credits', amount: 12.24 }
            ]
          },
          { date: '11 Thurs', amount: -2.99, open: false },
          { date: '11 Fri', amount: -2.99, open: false },
          { date: '11 Sat', amount: -2.99 }
        ]
      },
      {
        month: 'August 2020',
        amount: -50.1,
        toPay: 0,
        open: false,
        dailySpend: [
          { date: '11 Mon', amount: -2.99, open: false },
          { date: '11 Tue', amount: -2.99, open: false },
          {
            date: '11 Wed',
            amount: 11.0,
            open: false,
            items: [
              { title: 'Training Plans', amount: -1.0 },
              { title: 'Email promotions', amount: -0.24 },
              { title: 'Credits', amount: 12.24 }
            ]
          },
          { date: '11 Thurs', amount: -2.99, open: false },
          { date: '11 Fri', amount: -2.99, open: false },
          { date: '11 Sat', amount: -2.99 }
        ]
      },
      {
        month: 'July 2020',
        amount: -50.1,
        toPay: 0,
        open: false,
        dailySpend: [
          { date: '11 Mon', amount: -2.99, open: false },
          { date: '11 Tue', amount: -2.99, open: false },
          {
            date: '11 Wed',
            amount: 11.0,
            open: false,
            items: [
              { title: 'Training Plans', amount: -1.0 },
              { title: 'Email promotions', amount: -0.24 },
              { title: 'Credits', amount: 12.24 }
            ]
          },
          { date: '11 Thurs', amount: -2.99, open: false },
          { date: '11 Fri', amount: -2.99, open: false },
          { date: '11 Sat', amount: -2.99 }
        ]
      },
      {
        month: 'June 2020',
        amount: -50.1,
        toPay: 0,
        open: false,
        dailySpend: [
          { date: '11 Mon', amount: -2.99, open: false },
          { date: '11 Tue', amount: -2.99, open: false },
          {
            date: '11 Wed',
            amount: 11.0,
            open: false,
            items: [
              { title: 'Training Plans', amount: -1.0 },
              { title: 'Email promotions', amount: -0.24 },
              { title: 'Credits', amount: 12.24 }
            ]
          },
          { date: '11 Thurs', amount: -2.99, open: false },
          { date: '11 Fri', amount: -2.99, open: false },
          { date: '11 Sat', amount: -2.99 }
        ]
      }
    ]
  })
}
</script>
