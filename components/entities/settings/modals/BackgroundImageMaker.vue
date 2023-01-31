<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${draftName || $t('entities.background_image')}`"
    :loading="$nuxt.$loading.show"
    :disabled="disabled"
    @done="save"
  >
    <base-form ref="form" v-slot="{ rules }" class="add-background">
      <base-input-text
        v-model="draft.name"
        :tooltip="$t('background.name_tooltip')"
        :label="$t('background.name_label')"
        :rules="[rules.required, rules.maxLength(100), rules.unique(listOfBackgrounds)]"
      >
        <template #prepend-icon>
          <img src="/images/flag/en.svg">
        </template>
      </base-input-text>

      <base-input-photo
        :value="draft.files.landscape.base64 || draft.files.landscape.url"
        :label="$t('background.landscape_label')"
        :tooltip="$t('background.landscape_tooltip')"
        class="landscape-image"
        quality="1"
        :max="0.5"
        required-resolution="2560x1440"
        image-width="170"
        image-height="80"
        no-crop
        @change="onImageChange('landscape', $event)"
      />

      <base-input-photo
        :value="draft.files.portrait.base64 || draft.files.portrait.url"
        :label="$t('background.potrait_label')"
        :tooltip="$t('background.portrait_tooltip')"
        class="portrait-image"
        quality="0.7"
        :max="0.5"
        required-resolution="1080x1920"
        image-width="100"
        image-height="170"
        no-crop
        @change="onImageChange('portrait', $event)"
      />

      <base-select
        v-model="draft.sportIds"
        :label="$t('background.sport_label')"
        :placeholder="$t('background.sport_placeholder')"
        :tooltip="$t('background.sport_tooltip')"
        :items="sportInterests"
        item-text="name"
        item-value="_id"
        hide-selected
        searchable
        sort-by-text
      >
        <template #empty>
          Not option left
        </template>

        <template #not-found>
          No result found
        </template>
      </base-select>

      <base-select
        v-if="!draft.isDefault || !draft._id"
        v-model="draft.profileIds"
        :label="$t('background.profiles_label')"
        :tooltip="$t('background.profiles_tooltip')"
        :items="suggestedProfiles"
        item-text="displayName"
        item-value="_id"
        return-object
        hide-selected
        sort-by-text
        @search="searchProfiles"
      >
        <template #empty>
          Not option left
        </template>

        <template #not-found>
          No result found
        </template>
      </base-select>
    </base-form>
  </base-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CWMixin from '~/mixins/CWMixin'

export default {
  mixins: [
    CWMixin
  ],
  data () {
    return {
      draftName: null,
      draft: {
        name: null,
        files: {
          landscape: {
            url: null,
            base64: null
          },
          portrait: {
            url: null,
            base64: null
          }
        },
        isDefault: false,
        sportIds: [],
        sports: [],
        profileIds: []
      },
      tmpFiles: {
        landscape: null,
        portrait: null
      },
      selectedFile: null,
      suggestedProfiles: []
    }
  },
  computed: {
    ...mapGetters({
      sportInterests: 'settings/sportInterests',
      backgroundImages: 'settings/backgroundImages'
    }),
    listOfBackgrounds () {
      const arr = []
      this.backgroundImages.forEach((bg) => {
        if (!this.draft._id || this.draft._id !== bg._id) {
          arr.push(bg.name.toLowerCase())
        }
      })
      return arr
    },
    disabled () {
      const { name, files: { landscape, portrait } } = this.draft
      return !name || (!landscape.url && !landscape.base64) || (!portrait.url && !portrait.base64)
    }
  },
  mounted () {
    this.getSportInterests()
  },
  methods: {
    ...mapActions({
      getSportInterests: 'settings/getSportInterests',
      saveBackgroundImage: 'settings/saveBackgroundImage'
    }),
    async show (draft) {
      const detail = draft?._id && await this.$repos.settingsRepo.background.getOneById(draft._id)

      this.draft = this.$utils.extract(detail?.background, {
        _id: undefined,
        name: null,
        files: {
          landscape: {
            base64: null
          },
          portrait: {
            base64: null
          }
        },
        isDefault: false,
        sportIds: [],
        profileIds: []
      })

      this.draftName = this.draft.name

      this.$refs.modal.show()
    },
    async searchProfiles (keyword) {
      if (!keyword || keyword.length < 2) {
        this.suggestedProfiles = []
      } else {
        this.suggestedProfiles = await this.$repos.profileRepo.searchProfiles(keyword)
      }
    },
    onImageChange (prop, { file, src }) {
      Object.assign(this.draft, {
        files: {
          ...this.draft.files,
          [prop]: {
            base64: src
          }
        }
      })

      this.tmpFiles[prop] = file
    },

    async save () {
      const draft = this.$utils.clone(this.draft)

      draft.profileIds = draft.profileIds.map(p => p._id)

      const { files: { landscape, portrait } } = draft

      if (!landscape._id) {
        const file = this.tmpFiles.landscape
        landscape.base64 = landscape.base64.replace(/^data:image\/(png|jpeg);base64,/, '')
        landscape.filename = file.name
        landscape.size = file.size
        landscape.extension = file.type
      }

      if (!portrait._id) {
        const file = this.tmpFiles.portrait
        portrait.base64 = portrait.base64.replace(/^data:image\/(png|jpeg);base64,/, '')
        portrait.filename = file.name
        portrait.size = file.size
        portrait.extension = file.type
      }

      await this.saveBackgroundImage(draft).then((response) => {
        if (response.success) {
          this.$notifier.success(response.message)
          this.$refs.modal.hide()
        }
      })

      this.tmpFiles = {}
    }
  }
}
</script>
