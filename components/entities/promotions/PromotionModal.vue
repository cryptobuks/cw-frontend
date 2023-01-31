<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${(entity && entity.name) || 'Discount'}`"
    :loading="saving"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-progressive-fields-container
        ref="fields"
        :data="entity"
        :fields="fields"
        :hidden-fields="hiddenFields"
        :show-all-fields="!!entity._id"
      >
        <template #promotionType="{ inputAttrs }">
          <base-select
            v-model="entity.promotionType"
            v-bind="inputAttrs"
            :items="types"
            :tooltip="$t('global.type')"
            :label="$t('global.type')"
            :placeholder="$t('global.type')"
            return-object
          />
        </template>
        <template #name="{ inputAttrs }">
          <base-input-text
            v-model="entity.name"
            v-bind="inputAttrs"
            :placeholder="$t('promotion.name')"
            :label="$t('promotion.name')"
            :tooltip="$t('promotion.name_tooltipr')"
          />
          <base-multiple-inputs-wrapper
            v-model="entity.date"
            :new-item="returnedDate"
            :is-empty="(item) => !item.endDate || !item.startDate"
          >
            <template #item="{ index }">
              <base-input-date
                v-model="entity.date[index]['startDate']"
                v-bind="inputAttrs"
                :tooltip="$t('promotion.date.start_date')"
                :label="$t('promotion.date.start_date')"
                :placeholder="$t('promotion.date.start_date')"
                :rules="[rules.required]"
              />
              <base-input-date
                v-model="entity.date[index]['endDate']"
                class="ml-3"
                v-bind="inputAttrs"
                :label="$t('promotion.date.end_date')"
                :placeholder="$t('promotion.date.end_date')"
                :rules="[rules.required]"
              />
            </template>
          </base-multiple-inputs-wrapper>
          <base-switcher
            v-model="entity.timeRange"
            class="border border-black border-opacity-25 rounded-full self-end my-2"
            false-text="TIME RANGE OFF"
            true-text="TIME RANGE ON"
            false-color="black"
            @focusin="onFocus(inputAttrs.listeners.focus)"
          />
          <base-multiple-inputs-wrapper
            v-if="entity.timeRange"
            v-model="entity.time"
            :new-item="returnedTime"
            :is-empty="(item) => !item.endTime || !item.startTime"
          >
            <template #item="{ index }">
              <cw-input-time
                v-model="entity.time[index]['startTime']"
                v-bind="inputAttrs"
                :tooltip="$t('promotion.time.start_time')"
                :label="$t('promotion.time.start_time')"
              />
              <cw-input-time
                v-model="entity.time[index]['endTime']"
                class="ml-3"
                :label="$t('promotion.time.end_time')"
              />
            </template>
          </base-multiple-inputs-wrapper>
          <base-input-text
            v-model.number="entity.maxQuantity"
            type="number"
            :label="$t('promotion.quantity')"
            :tooltip="$t('promotion.quantity.tooltip')"
            :placeholder="$t('promotion.quantity')"
            v-bind="inputAttrs"
          />
        </template>
        <template #value="{ inputAttrs }">
          <base-input-autocomplete
            v-model="entity.value"
            :affix="valueDiscounted"
            :items="discountValue"
            :label="$t('promotion.value')"
            :tooltip="$t('promotion.value.tooltip')"
            :placeholder="$t('promotion.value')"
            v-bind="inputAttrs"
            @item-select="onItemSelected"
            @search="addNewValue"
          />
        </template>
        <template #items="{ inputAttrs }">
          <base-select
            v-model="entity.items"
            :items="products"
            item-text="name"
            item-value="_id"
            hide-selected
            :label="$t('promotion.product_or_subscription')"
            :tooltip="$t('promotion.product_or_subscription.tooltip')"
            :placeholder="$t('promotion.product_or_subscription')"
            v-bind="inputAttrs"
          />
        </template>
        <template #target="{ inputAttrs }">
          <base-select
            v-model="entity.target"
            :items="targets"
            :label="$t('promotion.target')"
            :placeholder="$t('promotion.target')"
            :tooltip="$t('promotion.target.tooltip')"
            v-bind="inputAttrs"
            hide-selected
            item-text="text"
            item-value="value"
          >
            <template #selected-item-text="{ item }">
              <div class="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="flex-shrink-0 fill-current stroke-current w-4 h-4"
                >
                  <use
                    v-if="item && item.value"
                    :href="`#${item.value.type}-svg-icon-${_uid}`"
                  />
                </svg>
                <span v-if="item" class="truncate ml-1">{{ item.text }}</span>
              </div>
            </template>

            <template #item-text="{ item }">
              <div class="flex items-center text-sm px-2 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="fill-current stroke-current w-4 h-4"
                >
                  <use
                    v-if="item && item.value"
                    :href="`#${item.value.type}-svg-icon-${_uid}`"
                  />
                </svg>
                <span v-if="item" class="ml-2">{{ item.text }}</span>
              </div>
            </template>
          </base-select>
        </template>
        <template #couponType="{ inputAttrs }">
          <base-select
            v-model="entity.couponType"
            :items="['single code', 'multiple code']"
            :label="$t('promotion.coupon_type')"
            :tooltip="$t('promotion.coupon_type')"
            :placeholder="$t('promotion.coupon_type')"
            return-object
            v-bind="inputAttrs"
          />
          <base-input-text
            v-if="entity.couponType === 'multiple code'"
            v-model="entity.prefix"
            v-bind="inputAttrs"
            :rules="[rules.maxLength(3)]"
            :tooltip="`coupon code`"
            :label="`coupon code`"
            :placeholder="`coupon code`"
          />
          <base-input-text
            v-else
            v-model="entity.labelFixed"
            v-bind="inputAttrs"
            :tooltip="`coupon code`"
            :label="`coupon code`"
            :placeholder="`coupon code`"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>
    <svg xmlns="http://www.w3.org/2000/svg" class="hidden">
      <!-- profile -->
      <symbol :id="`profile-svg-icon-${_uid}`" viewBox="0 0 32 32">
        <g
          transform="translate(1 1)"
          stroke-width="1.5"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            d="M.492 29.78h29.2v-7.329c0-1.962-1.802-3.553-4.025-3.553H4.518c-2.223 0-4.026 1.59-4.026 3.553v7.33z"
          />
          <circle cx="14.729" cy="6.689" r="6" />
        </g>
      </symbol>

      <!-- course -->
      <symbol :id="`course-svg-icon-${_uid}`" viewBox="0 0 21 22">
        <g transform="translate(-36.506 .09)" fill="none" stroke-width=".95">
          <path
            d="M38.885 4.449a.25.25 0 000 .352l1.404 1.424h.002a.25.25 0 00.353 0l1.65-1.65a.25.25 0 00.001-.352L40.89 2.8l-.001-.001a.25.25 0 00-.354 0z"
          />
          <rect
            transform="rotate(-45)"
            x="19.773"
            y="33.158"
            width="11.5"
            height="3.5"
            rx="1"
          />
          <path
            d="M53.463 19l-.002.002a.25.25 0 01-.353-.004l-1.397-1.432a.25.25 0 01.002-.351l1.65-1.65.002-.002a.25.25 0 01.354.004L55.115 17a.25.25 0 01-.002.351z"
          />
          <rect
            transform="scale(1 -1) rotate(45)"
            x="19.773"
            y="-48.749"
            width="11.5"
            height="3.5"
            rx="1"
          />
          <path d="M43.29 8.64l6.004 6.005 1.446-1.446-6.004-6.005z" />
        </g>
      </symbol>

      <!-- interest -->
      <symbol :id="`interest-svg-icon-${_uid}`" viewBox="2 0 1000 1000">
        <path
          d="M832.7 270.7c-82.4 0-150 63.7-156.6 144.4-2.4-.1-4.8-.4-7.3-.4s-4.8.3-7.3.4C655 334.4 587.3 270.7 505 270.7c-82.4 0-150 63.7-156.6 144.4-2.4-.1-4.8-.4-7.3-.4-5.8 0-11.5.4-17.2 1-6.3-81-74.1-145-156.6-145C80.5 270.7 10 341.3 10 428s70.5 157.3 157.3 157.3c5.8 0 11.5-.3 17.2-1 6.3 81 74.1 145 156.6 145 82.4 0 150-63.7 156.6-144.4 2.4.1 4.8.3 7.3.3s4.8-.3 7.3-.3c6.6 80.7 74.2 144.4 156.6 144.4 82.4 0 150-63.7 156.6-144.4 2.4.1 4.8.3 7.3.3 86.7 0 157.3-70.6 157.3-157.3s-70.6-157.2-157.4-157.2zM36.5 428c0-72.1 58.7-130.8 130.8-130.8 69.7 0 126.7 54.9 130.4 123.8-61.2 17.6-107.1 71.3-113.1 136.5-5.7.8-11.4 1.3-17.3 1.3-72.2 0-130.8-58.7-130.8-130.8zm259.6 21.4c-7.7 46.9-40.4 85.3-83.9 101.3 7.8-46.9 40.4-85.3 83.9-101.3zm45 253.4c-69.7 0-126.7-54.9-130.4-123.8 61.2-17.6 107.1-71.3 113.1-136.5 5.7-.8 11.4-1.3 17.3-1.3 2.5 0 4.9.3 7.3.3 6 69.1 56.7 125.5 123 140-4.9 67.7-61.4 121.3-130.3 121.3zM375.6 446c49.8 13.7 87.7 56 94.9 108-49.8-13.7-87.7-55.9-94.9-108zm122.1 112.4c-6-69.1-56.7-125.5-123-140 4.9-67.6 61.4-121.2 130.3-121.2s125.4 53.6 130.3 121.2c-66.3 14.5-117 70.9-123 140-2.5.1-4.8.4-7.3.4s-4.9-.3-7.3-.4zM634.4 446c-7.2 52.1-45.1 94.4-94.9 108 7.2-52.1 45.1-94.4 94.9-108zm34.5 256.8c-68.9 0-125.4-53.6-130.3-121.2 66.3-14.5 117-70.9 123-140 2.4-.1 4.8-.3 7.3-.3s4.9.3 7.3.3c5.9 69.1 56.7 125.5 123 140-5 67.6-61.5 121.2-130.3 121.2zM703.4 446c49.7 13.7 87.7 56 94.9 108-49.8-13.7-87.7-55.9-94.9-108zm129.3 112.8c-2.5 0-4.9-.2-7.3-.3-6-69.1-56.7-125.5-123-140 4.9-67.6 61.4-121.2 130.3-121.2 72.1 0 130.8 58.7 130.8 130.8 0 72-58.7 130.7-130.8 130.7z"
        />
      </symbol>

      <!-- role -->
      <symbol :id="`role-svg-icon-${_uid}`" viewBox="0 0 15 15">
        <path
          d="M2 1S1 1 1 2v5.158C1 8.888 1.354 11 4.5 11H5V8L2.5 9s0-2.5 2.5-2.5V5c0-.708.087-1.32.5-1.775.381-.42 1.005-1.258 2.656-.471L9 3.303V2s0-1-1-1c-.708 0-1.978 1-3 1S2.787 1 2 1zm1 2a1 1 0 110 2 1 1 0 010-2zm4 1S6 4 6 5v5c0 2 1 4 4 4s4-2 4-4V5c0-1-1-1-1-1-.708 0-1.978 1-3 1S7.787 4 7 4zm1 2a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2zm-4.5 4h5s0 2.5-2.5 2.5S7.5 10 7.5 10z"
        />
      </symbol>
    </svg>
  </base-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import FilterMixin from '@/mixins/FilterMixin'
export default {
  mixins: [FilterMixin],
  data () {
    return {
      entityName: null,
      valueDiscounted: null,
      saving: false,
      discountValue: [],
      entity: {
        promotionType: '',
        name: '',
        target: [],
        items: [],
        couponType: '',
        timeRange: false,
        date: [
          {
            startDate: this.$dayjs().toDate(),
            endDate: this.$dayjs().add(3, 'month').toDate()
          }
        ],
        time: [
          {
            startTime: '',
            endTime: ''
          }
        ],
        value: '',
        maxQuantity: ''
      },
      types: ['discount', 'coupon'],
      fields: [
        { name: 'promotionType', required: true },
        { name: 'name', required: true },
        {
          name: 'value'
        },
        {
          name: 'items'
        },
        {
          name: 'target'
        },
        {
          name: 'couponType'
        }
      ]
    }
  },
  computed: {
    ...mapState('product', ['products']),
    targets () {
      return this.normalizeFilter(this.filterTarget)
    },
    hiddenFields () {
      return this.entity.promotionType === 'coupon' ? [] : ['couponType']
    }
  },
  methods: {
    ...mapActions('product', ['createDiscount', 'createCoupon']),
    show (entity) {
      const filter = entity?.target
      this.entity = this.$utils.extract(entity, [
        'name',
        '_id',
        'status',
        'promotionType',
        'type',
        'time',
        {
          from: 'isFixed',
          transform: m => (m ? 'single code' : 'multiple code'),
          to: 'couponType'
        },
        'labelFixed',
        { from: 'maxQuantity', transform: m => Number(m) },
        {
          from: 'date',
          default: [
            {
              startDate: this.$dayjs().toDate(),
              endDate: this.$dayjs().add(3, 'month').toDate()
            }
          ]
        },
        {
          from: 'items',
          default: [],
          transform: m => m.map(item => item.itemId)
        }
      ])
      if (entity?.isFixed && entity?.coupons) {
        this.entity.labelFixed = entity?.coupons[0]?.coupon
      } else if (!entity?.isFixed && entity?.coupons) {
        this.entity.prefix = entity?.coupons[0]?.coupon.substr(0, 3)
      }
      if (filter) {
        const filterIds = {
          profiles: {},
          roles: {},
          courses: {},
          interests: {}
        }
        filter.profiles?.forEach((i) => {
          filterIds.profiles[i] = true
        })
        filter.roles?.forEach((i) => {
          filterIds.roles[i] = true
        })
        filter.interests?.forEach((i) => {
          filterIds.interests[i] = true
        })

        this.entity.target = this.targets
          .filter(
            t =>
              (t.value.type === 'profile' && filterIds.profiles[t.value._id]) ||
              (t.value.type === 'role' && filterIds.roles[t.value.key]) ||
              (t.value.type === 'interest' && filterIds.interests[t.value._id])
          )
          .map(t => t.value)
      } else {
        this.entity.target = []
      }
      this.$refs.modal.show()
    },
    returnedDate () {
      return { endDate: null, startDate: null }
    },
    returnedTime () {
      return { endTime: null, startTime: null }
    },
    onFocus (e) {
      if (typeof e === 'function') {
        e()
      }
    },
    save () {
      let promise
      const target = {}
      this.saving = true
      this.entity?.target?.forEach((item) => {
        const category = item.type.concat('s')
        target[category] = target[category] || []
        if (['profiles', 'interests'].includes(category)) {
          target[category].push(item._id)
        } else if (category === 'roles') {
          target[category].push(item.key)
        }
      })

      const items = this.entity?.items?.map((item) => {
        return { type: 'product', itemId: item }
      })

      const type = this.valueDiscounted === '%' ? 'percent' : 'amount'

      if (this.entity.promotionType === 'discount') {
        const data = this.$utils.extract(this.entity, [
          {
            from: 'value',
            transform: m => Number(m?.slice(0, -1))
          },
          'name',
          { from: 'status', default: 'active' },
          '_id',
          'time',
          { from: 'maxQuantity', transform: m => Number(m) },
          {
            from: 'date',
            transform: m =>
              m.map((item) => {
                return {
                  startDate: this.$dayjs(item.startDate).format('YYYY-MM-DD'),
                  endDate: this.$dayjs(item.endDate).format('YYYY-MM-DD')
                }
              })
          }
        ])
        promise = this.createDiscount({
          ...data,
          type,
          target,
          items,
          status: 'active'
        })
      } else {
        const data = this.$utils.extract(this.entity, [
          {
            from: 'value',
            transform: m => Number(m?.slice(0, -1))
          },
          'name',
          '_id',
          { from: 'status', default: 'active' },
          'maxQuantity',
          'time',
          {
            from: 'date',
            transform: m =>
              m.map((item) => {
                return {
                  startDate: this.$dayjs(item.startDate).format('YYYY-MM-DD'),
                  endDate: this.$dayjs(item.endDate).format('YYYY-MM-DD')
                }
              })
          },
          {
            from: 'couponType',
            transform: m => m === 'single code',
            to: 'isFixed'
          },
          'labelFixed',
          'prefix'
        ])
        promise = this.createCoupon({
          ...data,
          type,
          target,
          items
        })
      }
      this.saving = false
      promise.then((res) => {
        if (res.success) {
          this.$refs.modal.hide()
          this.$notifier.success('Successfully created')
        }
      })
    },
    addNewValue (value) {
      this.discountValue = [];
      ['%', '$'].forEach((item) => {
        this.discountValue.push(value.concat(item))
      })
    },
    onItemSelected (value) {
      this.valueDiscounted = value.charAt(value.length - 1)
    }
    // moveToNext() {
    //   this.$refs.fields.step = this.$refs.fields.step + 1;
    // },
  }
}
</script>

<style lang="scss" scoped>
.cw-translation-title {
  color: #fff;
  font-size: 20px;
  margin: 30px 0 20px;
}

.cw-sports-interest-update {
  margin-left: 30px;
}
</style>
