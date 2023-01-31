<template>
  <base-main-card
    :title="$t('nav.promotions')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => handleModal(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-loading v-if="loading" v-bind="{ roundness: '' }" />
    <div v-else class="mx-4">
      <base-masonry-list
        v-slot="{ item: promotion }"
        ref="masonry"
        class="p-4 text-white max-w-full"
        v-bind="{
          itemClass: 'mb-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 px-1',
          items: promotions,
        }"
      >
        <div class="relative">
          <button
            class="absolute top-0 left-0 w-5 h-full rounded-l-10px z-10"
            :class="[
              promotion.promotionType === 'discount' ? 'bg-cw-red' : 'bg-green',
            ]"
          >
            <span class="text-vertical-rl transform rotate-180 capitalize">{{
              promotion.promotionType
            }}</span>
          </button>
          <base-swipe-card
            container-class="card-container ml-2"
            :actions="getActions(promotion)"
            v-bind="$attrs"
            :title="promotion.name"
            v-on="$listeners"
          >
            <div
              v-if="promotion.date && promotion.date.length"
              class="space-y-2 text-white text-opacity-90 my-2"
            >
              <div class="flex text-xs">
                <div class="flex w-2/4">
                  Period validity
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip
                    v-for="(item, index) in promotion.date"
                    :key="index"
                    class="mb-1"
                  >
                    {{ $dayjs(item.startDate).format("DD.MM.YY") }} -
                    {{ $dayjs(item.endDate).format("DD.MM.YY") }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip>
                  <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div
                v-if="promotion.time && promotion.time.length"
                class="flex text-xs"
              >
                <div class="flex w-2/4 truncate">
                  Day - time validity
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip
                    v-for="(item, index) in promotion.time"
                    :key="index"
                    class="mb-1"
                  >
                    {{ item.startTime }} -
                    {{ item.endTime }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div class="flex text-xs">
                <div class="flex w-2/4 truncate">
                  Quantity
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip class="mb-1">
                    {{ promotion.maxQuantity }}
                    (<span
                      v-if="promotion.promotionType === 'discount'"
                      class="text-green"
                    >{{ `burned ${promotion.usedQuantity}` }}</span>
                    <span
                      v-else
                      class="text-green"
                    >{{ `burned ${promotion.soldQuantity}` }} |
                      {{ `sent ${promotion.sent}` }}</span>)
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div class="flex text-xs">
                <div class="flex w-2/4 truncate">
                  Product Involved
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip class="mb-1">
                    {{ promotion.items.length }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div class="flex text-xs">
                <div class="flex w-2/4 truncate">
                  Subscriptions Involved
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip class="mb-1">
                    {{ promotion.items.length }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div
                v-if="
                  filterTagsMethod(promotion.target) &&
                    filterTagsMethod(promotion.target).length
                "
                class="flex text-xs"
              >
                <div class="flex w-2/4 truncate">
                  Target
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip
                    v-for="(item, index) in filterTagsMethod(promotion.target)"
                    :key="index"
                    class="mb-1"
                  >
                    {{ item.text }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div v-if="promotion.value" class="flex text-xs">
                <div class="flex w-2/4 truncate">
                  Discount Value
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip class="mb-1">
                    {{ promotion.value
                    }}{{ global.type == "percent" ? "%" : "$" }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
              <div
                v-if="
                  promotion.isFixed &&
                    promotion.coupons &&
                    promotion.coupons.length
                "
                class="flex text-xs"
              >
                <div class="flex w-2/4 truncate">
                  Code
                </div>
                <div
                  class="flex flex-wrap items-center w-2/4 text-white text-opacity-60"
                >
                  <base-chip
                    v-for="(item, index) in promotion.coupons"
                    :key="index"
                    class="mb-1"
                  >
                    {{ item.coupon }}
                  </base-chip>
                  <!-- <base-chip class="mb-1"> 01.01.21 - 31.04.21 </base-chip> -->
                </div>
              </div>
            </div>

            <template #footer>
              <div class="w-full border-t border-white border-opacity-60 flex">
                <button
                  v-if="
                    promotion.isFixed &&
                      promotion.coupons &&
                      promotion.coupons.length
                  "
                  class="w-full flex justify-center items-center py-2 border-white border-r"
                  @click.stop="$utils.copy(promotion.coupons[0].coupon)"
                >
                  <base-icon name="copy" />
                </button>
                <button
                  class="w-full flex justify-center items-center py-2"
                  @click.stop
                >
                  <base-icon name="send" />
                </button>
              </div>
            </template>
          </base-swipe-card>
          <div
            v-if="new Date() > new Date(promotion.maxEndDate)"
            :class="{
              expired: new Date() > new Date(promotion.maxEndDate),
            }"
            class="flex justify-center items-center rounded-10px"
          >
            <h1
              class="underline text-black mr-1"
              @click="handleModal(promotion)"
            >
              RE-ACTIVATE
            </h1>
            <base-icon name="play" class="text-black" />
          </div>
        </div>
      </base-masonry-list>
    </div>
    <cw-promotion-modal ref="modal" />
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FilterMixin from '@/mixins/FilterMixin'
export default {
  name: 'Promotions',
  mixins: [FilterMixin],
  data () {
    return {
      keywords: '',
      isSearchOpened: false,
      loading: false,
      items: [1, 2, 3, 4, 5, 6, 7]
    }
  },
  computed: {
    // ...mapState("product", ["promotions"]),
    ...mapGetters('product', ['promotions']),
    profile () {
      return function (profileId) {
        if (!profileId) {
          return null
        }
        return this.$store.getters['chat/getFriend'](profileId)
      }
    }
  },
  mounted () {
    this.loading = true
    Promise.all([this.getProducts(), this.getPromotions()])
    this.loading = false
  },
  methods: {
    ...mapActions('product', [
      'deleteCoupon',
      'deleteDiscount',
      'createDiscount',
      'createCoupon',
      'getProducts',
      'getPromotions'
    ]),
    handleModal (promotion) {
      // To trigger the creation and edit modal
      this.$refs?.modal?.show(promotion)
    },
    deleteCard ({ _id, promotionType }) {
      promotionType === 'coupon'
        ? this.deleteCoupon({ couponId: _id })
        : this.deleteDiscount({ discountId: _id })
    },
    suspendPromotion (promotion) {
      const entity = this.$utils.extract(promotion, [
        'status',
        '_id',
        'name',
        'type',
        'time',
        'items',
        'target',
        'value',
        'date',
        'discountId',
        'couponId',
        {
          from: 'isFixed'
        },
        { from: 'maxQuantity', transform: m => Number(m) }
      ])
      if (promotion?.isFixed && promotion.coupons) {
        entity.labelFixed = promotion?.coupons[0]?.coupon
      } else if (!promotion?.isFixed && promotion.coupons) {
        entity.prefix = promotion?.coupons[0]?.coupon?.substr(0, 3)
      }
      let promise
      if (promotion.promotionType === 'discount') {
        promise = this.createDiscount({ ...entity, status: 'suspended' })
      } else {
        promise = this.createCoupon({ ...entity, status: 'suspended' })
      }
      promise.then((res) => {
        if (res.success) {
          this.$notifier.success('suspended successful')
        }
      })
    },
    activateModal (promotion) {
      let promise
      if (promotion.promotionType === 'discount') {
        promise = this.createDiscount({ ...promotion, status: 'active' })
      } else {
        promise = this.createCoupon({ ...promotion, status: 'active' })
      }
      promise.then((res) => {
        if (res.success) {
          this.$notifier.success('Activated successful')
        }
      })
    },
    getActions (promotion) {
      const todaysDate = new Date(this.$dayjs().format('YYYY-MM-DD')).getTime()
      let actions = [
        { icon: 'pen', handler: () => this.handleModal(promotion) }
      ]
      if (
        todaysDate <
        new Date(this.$dayjs(promotion.minStartDate).format('YYYY-MM-DD'))
      ) {
        actions.push({
          icon: 'bin',
          color: '#ffffff',
          danger: true,
          handler: () => this.deleteCard(promotion)
        })
      }
      for (const key in promotion?.date) {
        if (
          todaysDate >=
            new Date(
              this.$dayjs(promotion?.date[key].startDate).format('YYYY-MM-DD')
            ).getTime() &&
          todaysDate <=
            new Date(
              this.$dayjs(promotion?.date[key].endDate).format('YYYY-MM-DD')
            ).getTime() &&
          promotion.status === 'active'
        ) {
          actions = [
            {
              icon: 'pause',
              handler: () => this.suspendPromotion(promotion),
              danger: true
            },
            ...actions.filter(item => item.icon !== 'pause')
          ]
          // return;
        } else if (
          todaysDate >=
            new Date(
              this.$dayjs(promotion?.date[key].startDate).format('YYYY-MM-DD')
            ).getTime() &&
          todaysDate <=
            new Date(
              this.$dayjs(promotion?.date[key].endDate).format('YYYY-MM-DD')
            ).getTime() &&
          promotion.status === 'suspended'
        ) {
          actions = [
            {
              icon: 'play',
              handler: () => this.activateModal(promotion),
              danger: false
            },
            ...actions.filter(item => item.icon !== 'play')
          ]
          // return;
        }
      }
      return actions
    }
  },
  head () {
    return {
      title: this.$t('nav.promotions')
    }
  }
}
</script>
<style lang="scss" scoped>
.truncate {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  span:last-child {
    border-right: none;
  }
}

::v-deep .card-container {
  max-width: 320px;
  @apply bg-black;
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

.expired {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  opacity: 0.9;
  transition: 0.5s ease;
  background-color: white;
  z-index: 20;
}
</style>
