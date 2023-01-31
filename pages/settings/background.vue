<template>
  <base-main-card
    :title="$t('nav.background')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('background.create'),
        handler: () => addBackgroundImage(),
      },
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container
      :items="images.filter((img) => img.files.landscape !== undefined)"
      class="background-images"
    >
      <template #item="{ item: image }">
        <base-swipe-card
          :title="image.name"
          :bg-image="image.files.landscape.url + '?size=sm'"
          :hide-remove="!!image.isDefault"
          @edit="openEditModal(image)"
          @remove="deleteBackground(image)"
        >
          <template #footer>
            <div v-if="!image.profileIds.length" class="default">
              <input
                :id="image.name"
                :checked="image.isDefault"
                type="checkbox"
                class="checkbox"
                @input="defaultBackgroundChange($event, image)"
              >
              <label :for="image.name" />
              <span v-if="image.isDefault">{{ $t("global.default") }}</span>
            </div>
            <div class="flex ml-auto items-baseline">
              <base-icon name="person" size="20" />
              <span class="ml-1">{{ getCount(image._id) }}</span>
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-background-image-maker ref="backgroundImageMaker" />
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  meta: {
    permission: 'settings.background'
  },
  data () {
    return {
      keywords: '',
      defaultCheckbox: false,
      isSearchOpened: false,
      stats: []
    }
  },
  computed: {
    ...mapGetters({
      backgroundImages: 'settings/backgroundImages'
    }),
    images () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        return this.$utils.sortBy(
          this.backgroundImages.filter(i =>
            i.name.toLowerCase().includes(keywords)
          ),
          'name'
        )
      }

      const images = this.$utils.sortBy(this.backgroundImages.slice(), 'name')
      const i = images.findIndex(img => img.isDefault)
      if (i !== -1) {
        const defaultImg = images.splice(i, 1)[0]
        images.unshift(defaultImg)
      }

      return images
    },
    getCount () {
      return function (id) {
        const count = this.stats.find((item) => {
          return item.backgroundId === id
        })
        return count?.count
      }
    }
  },
  async mounted () {
    await this.getBackgroundImages()
    this.stats = await this.$repos.statRepo.backgroundImageStat()
  },
  methods: {
    ...mapActions('settings', [
      'getBackgroundImages',
      'saveBackgroundImage',
      'deleteBackgroundImage'
    ]),

    toggleSearch () {
      this.isSearchOpened = !this.isSearchOpened
    },

    moveElement (arr, oldIndex, newIndex) {
      if (newIndex >= arr.length) {
        let k = newIndex - arr.length + 1
        while (k--) {
          arr.push(undefined)
        }
      }
      arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
      return arr
    },

    addBackgroundImage () {
      this.$refs.backgroundImageMaker.show()
    },

    defaultBackgroundChange (e, image) {
      if (!image.isDefault) {
        e.target.checked = false
        this.$confirm(this.$t('background.confirm_default'))
          .then(() => {
            this.saveBackgroundImage({
              ...image,
              isDefault: true
            })
          })
          .catch(() => {
            e.target.checked = false
          })
      }
    },
    openEditModal (image) {
      this.$refs.backgroundImageMaker.show(image)
    },

    deleteBackground (image) {
      this.$confirm(this.$t('background.confirm_remove')).then(() => {
        const response = this.deleteBackgroundImage(image._id)
        if (response.success) {
          this.$notifier.success(response.message)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.background-images {
  .default {
    display: flex;
    align-items: center;
    .checkbox {
      position: absolute; // take it out of document flow
      opacity: 0; // hide it

      & + label {
        color: #fff;
        position: relative;
        cursor: pointer;
        padding: 0;
      }

      // Box.
      & + label:before {
        content: "";
        margin-right: 10px;
        @apply inline-block bg-white align-text-top w-5 h-5 rounded-3px;
      }

      // Box hover
      &:hover + label:before {
        background: lightgreen;
      }

      // Box focus
      &:focus + label:before {
        @apply shadow;
      }

      // Box checked
      &:checked + label:before {
        background: lightgreen;
      }

      // Disabled state label.
      &:disabled + label {
        cursor: auto;

        @apply text-gray-400;
      }

      // Disabled box.
      &:disabled + label:before {
        box-shadow: none;

        @apply bg-gray-400;
      }

      // Checkmark. Could be replaced with an image
      &:checked + label:after {
        content: "";
        position: absolute;
        left: 5px;
        top: 9px;
        background: white;
        width: 2px;
        height: 2px;
        box-shadow: 2px 0 0 white, 4px 0 0 white, 4px -2px 0 white,
          4px -4px 0 white, 4px -6px 0 white, 4px -8px 0 white;
        transform: rotate(45deg);
      }
    }

    span {
      color: #fff;
    }
  }
}
</style>
