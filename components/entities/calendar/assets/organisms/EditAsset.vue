<template>
  <base-form
    v-slot="{ rules }"
    class="flex flex-col justify-between h-full"
    @submit.prevent="updateAssetDetail"
  >
    <base-progressive-fields-container
      :fields="fields"
      :hidden-fields="hiddenFields"
      :data="asset"
      show-all-fields
    >
      <template #name="{ inputAttrs }">
        <base-input-text
          v-model="asset.name"
          :label="$t('asset.name_label')"
          :tooltip="$t('asset.name_tooltip')"
          :placeholder="$t('asset.name_placeholder')"
          maxlength="100"
          :disabled="false"
          :rules="[rules.maxLength(100)]"
          v-bind="inputAttrs"
        >
          <template #prepend-icon>
            <v-swatches
              v-model="color"
              shapes="circles"
              :swatch-size="20"
              background-color="#4a4a4a"
              fallback-input-class="vue-swatches-fallback-input-class"
              fallback-ok-class="vue-swatches-fallback-ok-class"
              :trigger-style="{ width: '20px', height: '20px' }"
              :wrapper-style="{ display: 'none' }"
              show-fallback
              fallback-input-type="color"
            />
          </template>
        </base-input-text>
      </template>
      <template #type="{ inputAttrs }">
        <div class="flex">
          <base-select
            v-model="asset.type"
            :label="$t('asset.type_label')"
            :tooltip="$t('asset.type_tooltip')"
            :placeholder="$t('asset.type_placeholder')"
            return-object
            :items="assetTypes"
            v-bind="inputAttrs"
          />
          <base-input-text
            v-if="asset.type && asset.type && asset.type.value === 'physical'"
            v-model="asset.surface"
            label="Surface"
            type="number"
            class="ml-2"
            placeholder="Surface Area"
            maxlength="100"
            :disabled="false"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
          >
            <template #affix>
              M<sup>2</sup>
            </template>
          </base-input-text>
        </div>
      </template>

      <template #numOfPersons="{ inputAttrs }">
        <div class="flex">
          <base-input-text
            v-model="asset.children"
            :label="$t('asset.children_label')"
            :tooltip="$t('asset.children_tooltip')"
            :placeholder="$t('asset.children_placeholder')"
            maxlength="100"
            type="number"
            :disabled="false"
            :rules="[rules.maxLength(100), rules.required]"
            v-bind="inputAttrs"
          />
          <base-input-text
            v-model="asset.adult"
            class="ml-2"
            :placeholder="$t('asset.adult_placeholder')"
            :label="$t('asset.adult_label')"
            :tooltip="$t('asset.adult_tooltip')"
            maxlength="100"
            :disabled="false"
            type="number"
            :rules="[rules.maxLength(100), rules.required]"
            v-bind="inputAttrs"
          />
        </div>
      </template>
      <template #address="{ inputAttrs }">
        <cw-input-address
          v-model="asset.address"
          v-bind="inputAttrs"
          city-only
          :label="$t('asset.address_label')"
          :tooltip="$t('asset.address_tooltip')"
          :placeholder="$t('asset.address_placeholder')"
        />
      </template>
      <template #sanification="{ inputAttrs }">
        <base-input-quantity
          v-model="asset.sanification"
          max="120"
          affix="mins"
          :rules="{ maxNumber: checkMaximumNumber }"
          :label="$t('asset.sanification_label')"
          :tooltip="$t('asset.sanification_tooltip')"
          v-bind="inputAttrs"
        />
      </template>
      <template #description="{ inputAttrs }">
        <base-textarea
          v-model="asset.description"
          label="Description"
          placeholder="Description"
          maxlength="300"
          :disabled="false"
          :rules="[rules.maxLength(300)]"
          v-bind="inputAttrs"
        />
      </template>
    </base-progressive-fields-container>
    <div class="flex justify-center">
      <base-qr-code
        v-if="assetDetail._id"
        :text="assetDetail._id"
        class="h-40 w-40"
      />
    </div>
    <base-button
      type="submit"
      xl
      class="mb-10"
      :disabled="!asset.name"
      :loading="saving"
    >
      <base-icon name="save" />
    </base-button>
  </base-form>
</template>

<script>
import { mapActions } from 'vuex'
import VSwatches from 'vue-swatches'
export default {
  name: 'EditAsset',
  components: {
    VSwatches
  },
  props: {
    gymId: {
      type: String,
      required: true
    },
    assetDetail: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      fields: [
        { name: 'name', class: 'col-span-2', required: true },
        { name: 'type' },
        { name: 'numOfPersons' },
        { name: 'sanification' },
        { name: 'address', class: 'col-span-2' },
        { name: 'description', class: 'col-span-2' }
      ],
      saving: false,
      asset: {
        name: '',
        type: '',
        surface: '',
        children: '',
        color: '',
        adult: '',
        address: {},
        description: '',
        sanification: ''
      },
      colorChoices: ['#FF0000', '#00FF00', '#0000FF', '#FFC0CB', '#FFFF00'],
      assetTypes: [
        { value: 'physical', text: this.$t('assets.type.physical-room') },
        { value: 'virtual', text: this.$t('assets.type.virtual-room') },
        { value: 'shower', text: this.$t('assets.type.shower-room') },
        { value: 'hairdryer', text: this.$t('assets.type.hairdryer-room') },
        { value: 'libra', text: this.$t('assets.type.libra-room') },
        { value: 'locker', text: this.$t('assets.type.locker-room') },
        { value: 'other', text: this.$t('assets.type.other-room') }
      ]
    }
  },

  computed: {
    hiddenFields () {
      return this.asset?.type?.value !== 'physical' ? ['sanification'] : []
    },
    color: {
      get () {
        if (this.asset.color) {
          return this.asset.color
        } else {
          return this.$utils.getNewColor(this.usedColors)
        }
      },
      set (v) {
        this.asset.color = v
      }
    },
    usedColors () {
      return this.gymAssets?.map((item) => {
        return item.color
      })
    }
  },

  watch: {
    // 'asset.adult' (val) {
    //   if (
    //     Math.ceil(Number(this.asset?.surface) / 2) < val &&
    //     this.asset?.type === 'physical'
    //   ) {
    //     this.$confirm(
    //       'You are overpassing the ratio of 1 person per 2 m2, are you sure to continue?',
    //       () => {
    //         this.asset.adult = ''
    //       }
    //     )
    //   }
    // },
    'asset.name' (val) {
      this.$emit('change', val)
    }
  },
  mounted () {
    const asset = this.$utils.extract(this.assetDetail, [
      'name',
      'color',
      'address',
      'surface',
      {
        from: 'type',
        transform: (m) => {
          return {
            value: m,
            text: this.$t(`assets.type.${m}-room`)
          }
        }
      },
      'description',
      {
        from: 'sanification',
        transform: (san) => {
          const [h, m] = san.split(':')
          return h * 3600 + m * 60
        }
      }
    ])

    const capacity = this.$utils.extract(this.assetDetail?.capacity, [
      {
        from: 'children',
        transform: m => String(m)
      },
      {
        from: 'adult',
        transform: m => String(m)
      }
    ])

    this.asset = { ...asset, ...capacity }
  },
  methods: {
    checkMaximumNumber () {
      return this.asset?.sanification > 120
        ? 'sanification must not exceed 120mins'
        : true
    },
    ...mapActions('calendar', ['updateGymAsset']),
    updateAssetDetail () {
      this.saving = true
      const gymId = this.gymId
      const assetId = this.assetDetail._id
      const capacity = this.$utils.extract(this.asset, [
        { from: 'children', transform: m => Number(m) },
        { from: 'adult', transform: m => Number(m) }
      ])
      const asset = this.$utils.extract(this.asset, [
        'name',
        { from: 'color', transform: () => this.color },
        'address',
        'surface',
        {
          from: 'type',
          transform: m => m?.value
        },
        'description',
        {
          from: 'sanification',
          transform: (san) => {
            const [h, m] = san.split(':')
            return h * 60 + m * 1
          }
        }
      ])
      this.updateGymAsset({
        gymId,
        assetId,
        capacity,
        ...asset
      }).then((res) => {
        if (res.success) {
          this.$emit('success', res.data)
          this.$notifier.success(res.message)
        }
        this.saving = false
      })
    }
  }
}
</script>

<style></style>
