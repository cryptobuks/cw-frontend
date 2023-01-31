<template>
  <base-modal v-model="isModalShown" title="New Background ADV">
    <base-form>
      <base-progressive-fields-container
        :data="{name: null, landscape: null, portrait: null, sports: null, date: null, countries: null}"
        disabled
      >
        <template #name="{ inputAttrs, inputListeners }">
          <base-input-text
            v-model="image.name"
            tooltip="Background image name"
            label="Name"
            placeholder="Name"
            clearable
            v-bind="inputAttrs"
            v-on="inputListeners"
          >
            <template #prepend-icon>
              <img src="/images/flag/en.svg">
            </template>
          </base-input-text>
        </template>

        <template #landscape="{ inputAttrs, inputListeners }">
          <h3 :style="[image.files.landscape.url ? {color:'#fff'} : '']">
            Landscape Image
          </h3>
          <base-input-image-file
            v-model="image.files.landscape.url"
            quality="1"
            clearable
            v-bind="inputAttrs"
            v-on="inputListeners"
            @file-change="uploadLandscapeImage"
          />
        </template>

        <template #portrait="{ inputAttrs, inputListeners }">
          <h3 :style="[image.files.portrait.url ? {color:'#fff'} : '']">
            Portrait Image
          </h3>
          <base-input-image-file
            v-model="image.files.portrait.url"
            quality="0.7"
            clearable
            v-bind="inputAttrs"
            v-on="inputListeners"
            @file-change="uploadPortraitImage"
          />
        </template>

        <template #sports="{ inputAttrs, inputListeners }">
          <base-select
            v-model="image.sportIds"
            label="Sport"
            placeholder="Related Sport"
            :items="sportInterest"
            item-text="name"
            item-value="_id"
            hide-selected
            searchable
            sort-by-text
            v-bind="inputAttrs"
            v-on="inputListeners"
          >
            <template #empty>
              Not option left
            </template>

            <template #not-found>
              No result found
            </template>
          </base-select>
        </template>

        <template #date="{ inputAttrs, inputListeners }">
          <div class="is-flex">
            <base-input-date
              v-model="image.fromDate"
              class="column"
              label="From Date"
              placeholder="From Date"
              clearable
              v-bind="inputAttrs"
              v-on="inputListeners"
            />

            <base-input-date
              v-model="image.toDate"
              class="column"
              label="To Date"
              placeholder="To Date"
              clearable
              v-bind="inputAttrs"
              v-on="inputListeners"
            />
          </div>
        </template>

        <template #countries="{ inputAttrs, inputListeners }">
          <base-select
            v-model="image.countries"
            label="Countries"
            placeholder="Countries"
            :items="countries"
            item-text="name"
            item-value="name"
            hide-selected
            searchable
            sort-by-text
            v-bind="inputAttrs"
            v-on="inputListeners"
          >
            <template #empty>
              Not option left
            </template>

            <template #not-found>
              No result found
            </template>
          </base-select>
        </template>
      </base-progressive-fields-container>
    </base-form>

    <template #actions>
      <div class="save-action">
        <base-button class="is-secondary is-fullwidth background-image-save" @click="save">
          <base-icon size="25">
            save
          </base-icon>
        </base-button>
      </div>
    </template>
  </base-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ModalMixin from '~/mixins/ModalMixin'
import CWMixin from '~/mixins/CWMixin'

export default {
  mixins: [
    ModalMixin,
    CWMixin
  ],
  data () {
    return {
      selectedFile: null,
      image: {
        name: null,
        files: {
          landscape: {
            url: ''
          },
          portrait: {
            url: ''
          }
        },
        active: false,
        sportIds: [],
        countries: []
      },
      countries: [
        { _id: 'afsdngsjkflm', name: 'Italy' },
        { _id: 'dzckmvkjnsld', name: 'France' },
        { _id: 'afsadgfgewrt', name: 'Germany' },
        { _id: '3oiekdfmfads', name: 'Spain' }
      ]
    }
  },
  computed: {
    ...mapGetters({
      sportInterest: 'settings/sportInterest'
    }),
    landscapeBackgroundStyle () {
      return {
        backgroundImage: 'url(' + this.image.files.landscape.url + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    portraitBackgroundStyle () {
      return {
        backgroundImage: 'url(' + this.image.files.portrait.url + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
  },
  mounted () {
    this.getSportInterests()
  },
  methods: {
    ...mapActions({
      getSportInterests: 'settings/getSportInterests',
      createBackgroundAdv: 'settings/createBackgroundAdv'
    }),
    uploadLandscapeImage (image) {
      this.image.files.landscape.filename = image.name
      this.image.files.landscape.url = image.url
      this.image.files.landscape.size = image.size
    },

    uploadPortraitImage (image) {
      this.image.files.portrait.filename = image.name
      this.image.files.portrait.url = image.url
      this.image.files.portrait.size = image.size
    },
    save () {
      this.image._id = Math.random()
      this.createBackgroundAdv(this.image)
      this.cleanObject()
      this.$notifier.success('Background ADV is successfully created.')
      this.closeModal()
    },
    cleanObject () {
      this.image = {
        name: null,
        files: {
          landscape: {
            url: ''
          },
          portrait: {
            url: ''
          }
        },
        active: false,
        sportIds: [],
        countries: []
      }
    }
  }
}
</script>

<style lang="scss">
.save-action {
  width: 100%;
  padding: 0 100px;

  .background-image-save {
    margin-bottom: 1.5rem;
  }
}
</style>
