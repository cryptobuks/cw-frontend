<template>
  <div
    class="cw-page-content flex-col"
    :class="{ 'overflow-y-scroll': isMobileView }"
  >
    <div class="cw-page-content flex-col">
      <div
        v-if="isMobileView"
        class="float-right flex mt-4 access-tracking__toggler self-end"
        :class="{ 'is-active': qrBoxShown }"
        @click="qrBoxShown = !qrBoxShown"
      >
        <span class="bordered-card bg-gray-300 outline-none">
          <base-icon name="qr-code-circle" size="40" />
        </span>
        <div v-if="!qrBoxShown" class="bg-gray-300 flex items-center px-2">
          <p class="text-xs font-extrabold">
            {{ $t("dashboard.access_qr_code") }}
          </p>
        </div>
      </div>
      <div class="mx-4 px-2 py-2 float-right">
        <div v-show="qrBoxShown && isMobileView" class="px-4">
          <cw-qr-scanner ref="qrScanner" :visible="!!qrBoxShown && isMobileView" class="bg-opacity-60" />
        </div>
        <div
          class="flex justify-between text-white font-bold items-center text-lg mb-4"
        >
          <p class="text-gray">
            {{ $t("dashboard.todo") }}
          </p>
          <div v-if="!isMobileView && $auth.isBusiness()">
            <p>
              {{ $t("dashboard.client") }} 234
              <base-icon name="arrow-up" class="text-green" />
              34 - {{ $t("dashboard.contact") }}: 527
              <base-icon name="arrow-down" class="text-cw-red" /> 12
            </p>
          </div>
          <span
            v-if="isMobileView"
            class="text-black outline-none"
            @click="showAll = !showAll"
          >
            <base-icon name="chevron-down" size="20" />
          </span>
        </div>
        <div
          v-if="messages && messages.length"
          v-masonry
          horizontal-order="true"
          class="pt-5 overflow-y-auto overflow-x-hidden"
          item-selector=".grid-item"
          column-width=".sizer"
          gutter="10"
          style="max-height: 65vh !important"
          :style="{ maxHeight: !isMobileView ? '65vh' : null }"
        >
          <div ref="masonry" vv-masonry-tile class="sizer" />
          <div
            v-for="(item, index) in filteredList"
            :key="index"
            ref="masonry"
            vv-masonry-tile
            class="grid-item"
          >
            <base-grouped-cards :slot-data="item" class="w-full" />
          </div>
        </div>

        <div
          v-if="$auth.isBusiness()"
          class="pt-3 w-full bottom-5"
          :class="{ absolute: !isMobileView }"
        >
          <div class="text-white flex text-md font-bold mb-2">
            <h1 class="mr-5">
              {{ $t("dashboard.best_and_worst") }}
            </h1>
            <div class="flex items-center">
              <h1 class="mr-1">
                {{ $t("dashboard.client") }}
              </h1>
              <base-icon name="chevron-down" />
            </div>
          </div>
          <base-card-list-container
            :items="list[0]"
            item-height="150px"
            style="padding: 0 !important"
          >
            <template #item>
              <div
                class="bg-cw-red bg-opacity-75 w-full rounded-lg space-y-2 flex flex-col p-3"
              >
                <div class="flex items-center space-x-3">
                  <img
                    :src="'/images/user-placeholder.svg'"
                    alt="Business Profile"
                    class="w-6 h-6 rounded-full object-cover"
                  >
                  <span
                    class="font-bold text-xs text-white"
                  >Francesca Rossi</span>
                </div>
                <span class="text-xs text-white">Best Ventidore</span>
                <div class="flex">
                  <div class="inline text-center mr-1">
                    <base-icon name="performance-index" size="30" />
                    <span class="text-xs">Economic</span>
                  </div>
                  <div class="inline text-center mr-1">
                    <base-icon name="performance-index" size="30" />
                    <span class="text-xs">Relationship</span>
                  </div>
                  <div class="inline text-center mr-1">
                    <base-icon name="performance-index" size="30" />
                    <span class="text-xs">Contributive</span>
                  </div>
                </div>
              </div>
            </template>
          </base-card-list-container>
        </div>
        <div
          v-else
          class="pt-3 w-full bottom-5"
          :class="{ absolute: !isMobileView }"
        >
          <div>
            <div class="text-white flex text-md font-bold mb-3">
              <h1 class="mr-5">
                {{ $t("dashboard.to_try") }}
              </h1>
            </div>
            <base-card-list-container
              :items="list[0]"
              style="padding: 0 !important"
              item-class="grid grid-cols-5 gap-5 mb-3"
            >
              <template #item>
                <div class="flex w-full" :class="'flex-row'">
                  <div
                    class="bg-opacity-25 text-white text-center"
                    :class="'bg-green w-6 rounded-r-lg transform rotate-180 text-vertical-rl'"
                  >
                    <span class="text-xs uppercase"> CORSI</span>
                  </div>
                  <div
                    class="bg-gray-300 bg-opacity-75 w-full space-y-2 flex flex-col p-3"
                    :class="'rounded-r-lg'"
                  >
                    <div
                      class="flex justify-between flex-wrap items-center space-x-3"
                    >
                      <div class="flex">
                        <img
                          :src="'/images/user-placeholder.svg'"
                          alt="Business Profile"
                          class="w-6 h-6 rounded-full object-cover mr-1"
                        >
                        <span class="font-bold text-xs">AQUA SPORT</span>
                      </div>
                    </div>
                    <div class="px-3 py-2">
                      <!-- <span class="text-xs">Danza Calssica Baby</span>
            <span class="text-xs">Scade || 03.08.2019</span> -->
                      <span
                        class="text-xs truncate-text"
                        v-html="`periodo :  3 mesi`"
                      />
                      <button
                        class="h-5 w-5 bg-white rounded-full float-right flex items-center justify-center"
                      >
                        <base-icon name="dismiss" size="8" />
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </base-card-list-container>
            <div class="text-white flex text-md font-bold mb-3">
              <h1 class="mr-5">
                {{ $t("dashboard.objective_and_performace") }}
              </h1>
            </div>
            <base-card-list-container
              :items="list[0]"
              style="padding: 0 !important"
              item-class="grid grid-cols-5 gap-5"
            >
              <template #item>
                <div class="flex w-full" :class="'flex-row'">
                  <div
                    class="bg-opacity-25 text-white text-center"
                    :class="'bg-green w-6 rounded-r-lg transform rotate-180 text-vertical-rl'"
                  >
                    <span class="text-xs uppercase"> CORSI</span>
                  </div>
                  <div
                    class="bg-gray-300 bg-opacity-75 w-full space-y-2 flex flex-col p-3"
                    :class="'rounded-r-lg'"
                  >
                    <div
                      class="flex justify-between flex-wrap items-center space-x-3"
                    >
                      <div class="flex">
                        <img
                          :src="'/images/user-placeholder.svg'"
                          alt="Business Profile"
                          class="w-6 h-6 rounded-full object-cover mr-1"
                        >
                        <span class="font-bold text-xs">AQUA SPORT</span>
                      </div>
                    </div>
                    <div class="px-3 py-2">
                      <!-- <span class="text-xs">Danza Calssica Baby</span>
            <span class="text-xs">Scade || 03.08.2019</span> -->
                      <span
                        class="text-xs truncate-text"
                        v-html="`periodo :  3 mesi`"
                      />
                      <button
                        class="h-5 w-5 bg-white rounded-full float-right flex items-center justify-center"
                      >
                        <base-icon name="dismiss" size="8" />
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </base-card-list-container>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  layout: ({ $auth }) => $auth.profileType().interface,
  async fetch () {
    await this.getOtherServices()
  },
  data () {
    return {
      list: [[1, 2, 3], [2, 4], [2, 4, 5], [1], [1], [1, 3, 4, 5], [1], [4]],
      showAll: false,
      cards: [],
      qrBoxShown: false,
      scanShown: false
    }
  },
  computed: {
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    filteredList () {
      return this.isMobileView && !this.showAll
        ? this.messages.slice(0, 2)
        : this.messages
    },
    ...mapGetters('dashboard', ['mappedCardGetter']),
    messages () {
      return this.mappedCardGetter(this.$auth)
    }
  },
  updated () {
    this.$nextTick(() => {
      if (typeof this.$redrawVueMasonry === 'function') {
        this.$redrawVueMasonry()
      }
    })
  },
  created () {
    this.getCards()
    this.setCard()
  },
  methods: {
    ...mapActions('dashboard', ['getOtherCardServices']),
    async getOtherServices () {
      const res = await this.$repos.profileRepo.getDashboardCard()
      this.pushToStore(res?.data?.cards)
    },
    getCards () {
      const GET_CARDS = 'card/dashboard/getCards'
      const handler = payload => this.pushToStore([this.cards, ...payload])

      this.$socket.on(GET_CARDS, handler)

      this.$once('beforeDestroy', () => {
        this.$socket.off(GET_CARDS, handler)
      })
    },
    setCard () {
      const GET_CARD = 'card/dashboard/setCard'
      const handler = (payload) => {
        const cards = this.cards.filter((item) => {
          return item._id !== payload.data.message._id
        })
        this.pushToStore(cards)
      }
      this.$socket.on(GET_CARD, handler)

      this.$once('beforeDestroy', () => {
        this.$socket.off(GET_CARD, handler)
      })
    },
    pushToStore (payload) {
      this.cards = payload
      this.getOtherCardServices(payload)
    }
  },
  head () {
    return {
      title: this.$t('nav.home')
    }
  }
}
</script>

<style lang="scss">
.cw-page-content {
  flex: 1;
  display: flex;
}

.card-container {
  grid-template-rows: 1fr 5fr 1fr;
}

.text-horizontal-tb {
  writing-mode: horizontal-tb;
}
.text-vertical-rl {
  writing-mode: vertical-rl;
}
.text-vertical-lr {
  writing-mode: vertical-lr;
}

.masonry-container {
  padding-top: 20px;
  max-height: 65% !important;
}

.access-tracking {
  &__toggler {
    transition: 0.5s;

    &.is-active {
      transform: translateX(0);
    }
  }
}
/* clearfix */
.grid:after {
  content: "";
  display: block;
  clear: both;
}

/* ---- grid-item ---- */

.sizer {
  width: calc(20% - 10px);
  min-height: 100px;
  @media (max-width: 768px) {
    width: 100% !important;
  }
  @media (max-width: 1000px) {
    width: calc(25% - 10px);
  }
}

.grid-item {
  display: block;
  margin-bottom: 5em;
  min-height: 100px;
  width: calc(20% - 10px);
  @media (max-width: 768px) {
    width: 100% !important;
  }
  @media (max-width: 1000px) {
    width: calc(25% - 10px);
  }
}

.grid-item:before {
  content: "";
  display: block;
  color: white;
  text-align: center;
  font-size: 1.4rem;
}

.bordered-card {
  padding: 0.3rem 0 0.3rem 0.3rem;
  border-radius: 50% 0 0 50%;
}

.mock-cards {
  display: flex;
  padding: 20px 10px;
  flex-wrap: wrap;

  .mock-card {
    width: 200px;
    min-width: 200px;
    height: 166px;
    border-radius: 7px;
    margin-right: 13px;
    margin-bottom: 21px;
    border-left: 20px solid #2070b9;

    @apply bg-black bg-opacity-60;

    &:last-child {
      margin-right: 0;
    }
  }
}

// .card-list-container {
//   @apply grid-cols-5;
// }
</style>
