<template>
  <base-main-card
    v-bind="$attrs"
    :title="$t('nav.assets')"
    :actions="[{ icon: 'add', handler: () => $refs.modal.show('create') }]"
    show-back-button
    @search="keywords = $event"
    v-on="$listeners"
  >
    <cw-assets-modal
      ref="modal"
      :gym-id="$auth.user._id"
      @success="setAssets"
    />
    <base-card-list-container :items="assets">
      <template v-slot:item="{ item: asset, index }">
        <div :key="`assets-${index}`">
          <div
            v-if="isPrinted[index]"
            class="flex-flex-col p-4"
            style="border-radius: 10px; background-color: gray"
          >
            <div class="flex justify-between">
              <div class="flex flex-col">
                <span class="text-lg text-white font-extrabold">{{
                  asset.name
                }}</span>
                <span
                  v-if="asset.type == 'physical'"
                  class="text-xs whitespace-nowrap text-white mt-2"
                >Surface: {{ asset.surface }} m<sup>2</sup>
                </span>
                <span v-else class="text-xs text-white mt-2">{{
                  asset.type
                }}</span>
              </div>
              <div class="flex text-white space-x-5 items-start">
                <button @click="$refs.printer.print({ title: 'Qr Code' })">
                  <base-icon name="printer" size="20" />
                </button>
                <button @click="showPrint(index)">
                  <base-icon
                    name="chevron-up"
                    size="15"
                    class="cursor-pointer"
                  />
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <div>
                <span
                  class="text-xs whitespace-nowrap text-white"
                >Capacity: {{ asset.capacity && asset.capacity.children }} |
                  {{ asset.capacity && asset.capacity.adult }}</span>
                <span
                  class="text-xs text-white truncate-text"
                >{{ asset.address }}
                </span>
              </div>
              <div class="flex flex-col items-center ml-1">
                <base-super-imposed status="60" />
                <span class="text-xs text-white">Economic</span>
              </div>
            </div>
            <div class="flex justify-center w-full mt-2">
              <base-printer ref="printer">
                <base-qr-code
                  v-if="asset._id"
                  :text="`${$utils.origin}/?invitingId=${$auth.user._id}&action=access&assetId=${asset._id}`"
                  class="h-40 w-40"
                />
              </base-printer>
            </div>
          </div>
          <base-swipe-card
            v-else
            v-slot="{}"
            auto-height
            bg-color="gray"
            container-class="text-black"
            toggler-class="text-black"
            @remove="confirmDelete(asset)"
            @edit="showModal('edit', asset)"
            @click="showPrint(index)"
          >
            <div class="flex justify-between w-full">
              <div class="flex">
                <!-- <base-icon name="qr-code" size="50" class="self-center" /> -->
                <div class="ml-4 space-y-1 flex flex-col">
                  <div class="flex">
                    <span
                      class="font-extrabold text-xs whitespace-nowrap text-white"
                    >
                      {{ asset.name }}
                    </span>
                    <base-icon
                      v-if="asset.type === 'virtual'"
                      name="wifi"
                      size="15"
                      class="ml-3 text-white"
                    />
                  </div>
                  <span
                    v-if="asset.type == 'physical'"
                    class="text-xs text-white whitespace-nowrap"
                  >Surface: {{ asset.surface }} m<sup>2</sup>
                  </span>
                  <span v-else class="text-xs text-white">{{
                    asset.type
                  }}</span>
                  <span
                    class="text-xs whitespace-nowrap text-white"
                  >Capacity: {{ asset.capacity && asset.capacity.children }} |
                    {{ asset.capacity && asset.capacity.adult }}</span>
                  <span
                    class="text-xs text-white truncate-text"
                  >{{ asset.address }}
                  </span>
                </div>
              </div>
              <div class="flex space-y-4 flex-col items-center mr-6">
                <base-icon
                  v-if="asset.type === 'virtual' || asset.type === 'physical'"
                  name="door"
                  size="30"
                  :style="{ color: asset.color }"
                />
                <base-icon v-else name="slash" size="30" class="text-white" />
                <div class="flex flex-col items-center">
                  <base-super-imposed status="60" />
                  <span class="text-xs text-white">Economic</span>
                </div>
              </div>
            </div>
          </base-swipe-card>
        </div>
      </template>
    </base-card-list-container>
    <!-- </div> -->
  </base-main-card>
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  async fetch () {
    await this.getGymAssets(this.$auth.user._id)
  },
  data () {
    return {
      modalType: null,
      keywords: '',
      isPrinted: []
    }
  },
  computed: {
    ...mapState('calendar', ['gymAssets']),
    assets () {
      return this.gymAssets.filter((asset) => {
        return asset.name.toLowerCase().includes(this.keywords.toLowerCase())
      })
    }
  },
  watch: {
    gymAssets: {
      handler (val) {
        this.isPrinted = Array(val?.length).fill(false)
      }
    }
  },
  methods: {
    ...mapActions('calendar', ['getGymAssets', 'deleteAsset']),
    showModal (type, assetDetail) {
      this.$refs.modal.show(type, assetDetail)
    },
    async setAssets () {
      await this.getGymAssets(this.$auth.user._id)
    },
    showPrint (index) {
      this.$set(this.isPrinted, index, !this.isPrinted[index])
    },
    confirmDelete (payload) {
      this.$confirm(
        {
          text: this.$t('color.confirm_remove', { name: payload.name })
        },
        () => {
          this.deleteAsset({
            ...payload,
            gymId: this.$auth.user._id,
            assetId: payload._id
          }).then((response) => {
            response.success
              ? this.$notifier.success(response.message)
              : this.$notifier.error(response.message)
          })
        }
      )
    }
  }
}
</script>
<style scoped>
.truncate-text {
  @apply truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 2) and
    (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
}
</style>
