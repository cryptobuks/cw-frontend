<template>
  <base-main-card
    :title="$t('pages.vat_rate')"
    :actions="[
      {
        icon: 'add',
        tooltip: $t('global.action_add_tooltip'),
        handler: () => this.$refs.vatRateMaker.show()
      }
    ]"
    show-back-button
    previous-page="/settings/countries"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredVatRates">
      <template #item="{ item: vatRate }">
        <base-swipe-card
          :title="vatRate.text"
          @remove="deleteEntity(vatRate)"
          @edit="openEditModal(vatRate)"
        >
          <template #footer>
            <div class="default">
              <input
                :id="vatRate.text"
                :checked="vatRate.isDefault"
                type="checkbox"
                class="checkbox"
                @input="defaultVatChange($event, vatRate)"
              >
              <label :for="vatRate.text" />
              <span v-if="vatRate.isDefault">{{ $t("global.default") }}</span>
            </div>
            <div class="ml-auto flex items-center">
              <base-icon name="person" size="14" class="mr-1" /> 10.001
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-vat-rate-maker ref="vatRateMaker" />
  </base-main-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    await this.getVatRateList({ countryId: this.$route.params.id })
  },
  data () {
    return {
      keywords: '',
      isSearchOpened: false
    }
  },
  computed: {
    ...mapState('country', ['vatRates']),

    filteredVatRates () {
      const keywords = this.keywords.trim().toLowerCase()
      if (keywords) {
        return this.vatRates.filter(
          ({ text, shortDescription, longDescription }) => {
            return (
              text.toLowerCase().includes(keywords) ||
              (longDescription &&
                longDescription.toLowerCase().includes(keywords))
            )
          }
        )
      }
      return this.vatRates
    }
  },
  methods: {
    ...mapActions('country', [
      'getVatRateList',
      'removeVatRate',
      'mutateVatRate'
    ]),
    toggleSearchInput () {
      this.isSearchOpened = !this.isSearchOpened
    },
    openEditModal (vatRate) {
      this.$refs.vatRateMaker.show(vatRate)
    },
    deleteEntity (vatRate) {
      this.$confirm(
        {
          text: this.$t('settings.countries.vat_rate.confirm_delete')
        },
        () => {
          this.removeVatRate(vatRate._id).then((response) => {
            response.success && this.$notifier.success(response.message)
          })
          this.getVatRateList({ countryId: this.$route.params.id })
        }
      )
    },
    async defaultVatChange (e, vatRate) {
      if (!vatRate.isDefault) {
        e.target.checked = false
        try {
          await this.$confirm(
            this.$t('settings.countries.vat_rate.confirm_default')
          )
          this.mutateVatRate({
            ...vatRate,
            isDefault: true
          })
          this.getVatRateList({ countryId: this.$route.params.id })
        } catch (error) {
          e.target.checked = false
        }
      }
    }
  }
}
</script>

<style lang="scss">
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
</style>
