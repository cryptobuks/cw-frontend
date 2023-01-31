<template>
  <base-form
    v-slot="{ rules }"
    class="flex flex-col justify-between h-full"
    @submit.prevent="create"
  >
    <base-progressive-fields-container
      :fields="fields"
      :hidden-fields="hiddenFields"
      :data="asset"
    >
      <template #name="{ inputAttrs }">
        <div class="flex space-x-2">
          <base-input-text
            v-model="asset.name"
            :label="$t('asset.name_label')"
            :tooltip="$t('asset.name_tooltip')"
            :placeholder="$t('asset.name_placeholder')"
            maxlength="100"
            :disabled="false"
            :rules="{
              maxLength: rules.maxLength(100),
              unique: verifyAssetName,
              required: rules.required,
            }"
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
            <template #error:unique>
              Name already in use:need to be changed
            </template>
          </base-input-text>
        </div>
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
            v-if="asset.type && asset.type.value === 'physical'"
            v-model="asset.surface"
            label="Surface"
            type="number"
            placeholder="Surface Area"
            class="ml-2"
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
            type="number"
            :label="$t('asset.children_label')"
            :tooltip="$t('asset.children_tooltip')"
            :placeholder="$t('asset.children_placeholder')"
            maxlength="100"
            :disabled="false"
            :rules="[rules.maxLength(100), rules.required]"
            v-bind="inputAttrs"
          />
          <base-input-text
            v-model="asset.adult"
            type="number"
            :placeholder="$t('asset.adult_placeholder')"
            :label="$t('asset.adult_label')"
            :tooltip="$t('asset.adult_tooltip')"
            maxlength="100"
            class="ml-2"
            :disabled="false"
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
        <base-input-text
          v-model="asset.sanification"
          max="120"
          affix="mins"
          type="number"
          :rules="{ maxNumber: checkMaximumNumber }"
          :label="$t('asset.sanification_label')"
          :tooltip="$t('asset.sanification_tooltip')"
          v-bind="inputAttrs"
        />
      </template>
      <template #description="{ inputAttrs }">
        <base-textarea
          v-model="asset.description"
          :label="$t('asset.description')"
          :tooltip="$t('asset.description_tooltip')"
          :placeholder="$t('asset.description')"
          maxlength="300"
          :disabled="false"
          :rules="[rules.maxLength(300)]"
          v-bind="inputAttrs"
        />
      </template>
    </base-progressive-fields-container>
    <div class="flex justify-center">
      <!-- <base-qr-code
              v-if="asset._id"
              :text="{ id: asset._id, profileId: this.profile._id }"
              class="h-40 w-40"
            /> -->
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
import { mapState, mapActions } from 'vuex'
import VSwatches from 'vue-swatches'
export default {
  name: 'CreateAsset',
  components: {
    VSwatches
  },
  props: {
    gymId: {
      type: String,
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
      asset: {
        name: '',
        type: '',
        surface: '',
        children: '',
        sanification: '',
        color: '',
        adult: '',
        address: {},
        description: ''
      },
      saving: false,
      colorChoices: ['#FF0000', '#00FF00', '#0000FF', '#FFC0CB', '#FFFF00'],
      assetTypes: Object.freeze([
        { value: 'physical', text: this.$t('assets.type.physical-room') },
        { value: 'virtual', text: this.$t('assets.type.virtual-room') },
        { value: 'shower', text: this.$t('assets.type.shower-room') },
        { value: 'hairdryer', text: this.$t('assets.type.hairdryer-room') },
        { value: 'libra', text: this.$t('assets.type.libra-room') },
        { value: 'locker', text: this.$t('assets.type.locker-room') },
        { value: 'other', text: this.$t('assets.type.other-room') }
      ])
    }
  },
  computed: {
    ...mapState('calendar', ['gymAssets']),
    usedColors () {
      return this.gymAssets?.map((item) => {
        return item.color
      })
    },
    fieldsComplete () {
      let complete = true
      for (let index = this.fields.length - 1; index >= 0; index--) {
        const field = this.fields[index][name]
        if (!this.asset[field]) {
          complete = false
          break
        }
      }
      return complete
    },
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
    }
  },
  watch: {
    'asset.adult' (val) {
      if (
        Math.ceil(Number(this.asset?.surface) / 2) < val &&
        this.asset?.type?.value === 'physical'
      ) {
        this.$confirm({
          html:
            'You are overpassing the ratio of 1 person per 2 m2, are you sure to continue?',
          actions: [
            { text: 'NO', handler: () => (this.asset.adult = '') },
            { text: 'YES', handler: () => {} }
          ]
        })
      }
    },
    'asset.name' (val) {
      this.$emit('change', val)
    }
  },
  methods: {
    checkMaximumNumber () {
      return this.asset?.sanification > 120
        ? 'sanification must not exceed 120mins'
        : true
    },
    ...mapActions('calendar', ['createAsset']),
    create () {
      this.saving = true
      const gymId = this.gymId
      const capacity = this.$utils.extract(this.asset, [
        { from: 'children', transform: m => Number(m) },
        { from: 'adult', transform: m => Number(m) }
      ])
      const asset = this.$utils.extract(this.asset, [
        'name',
        { from: 'color', transform: () => this.color },
        'address',
        'surface',
        { from: 'type', transform: m => m?.value },
        'description',
        {
          from: 'sanification',
          transform: (san) => {
            const [h, m] = san.split(':')
            return h * 60 + m * 1
          }
        }
      ])

      this.createAsset({
        gymId,
        capacity,
        ...asset
      }).then((res) => {
        if (res.success) {
          this.$notifier.success(res.message)
          this.$emit('success')
        }
        this.saving = false
      })
    },
    verifyAssetName () {
      return this.gymAssets.every((item) => {
        return (
          item.name !==
          this.asset?.name?.charAt(0).toUpperCase() +
            this.asset?.name?.substring(1)
        )
      })
    }
  }
}
</script>

<style></style>
