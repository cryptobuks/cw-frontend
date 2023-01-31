<template>
  <cw-country-setting-page-template
    :title="$t('pages.age_target')"
    :areas="areas"
    hide-actions
    hide-group-actions
  >
    <template #item="{ area, item }">
      <base-swipe-card
        class="age-target__item"
        hide-remove
        @edit="$refs.maker.show({ area, item, name: area.title })"
      >
        <div class="age-target-content">
          <div class="age-target-content__header">
            <div class="age-target-content__status">
              <span>{{ area.title }}</span>
            </div>

            <div class="age-target-content__title">
              <h2>{{ item.age }} years</h2>
            </div>
          </div>

          <div class="age-target-content__more">
            <div v-if="item.accepted" class="accepted-by">
              <base-icon size="20">
                person
              </base-icon>

              <span>{{ item.accepted }}</span>
            </div>
          </div>
        </div>
      </base-swipe-card>
    </template>

    <template #modals>
      <cw-age-target-maker ref="maker" />
    </template>
  </cw-country-setting-page-template>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    await this.getAgeTargetList({ countryId: this.$route.params.id })
  },
  computed: mapState('country', ['areas']),
  methods: mapActions('country', [
    'getAgeTargetList'
  ])
}
</script>

<style lang="scss">
.age-target__item {
  .age-target-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__status {
      color: darkgrey;
    }

    &__title {
      margin-top: 10px;
      h2 {
        color: #fff;
        font-size: 19px;
        font-weight: 700;
      }
    }

    &__more {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .accepted-by {
        display: flex;
        align-items: center;
        color: #fff;

        span {
          font-size: 18px;
          margin-left: 5px
        }
      }

      .activate-privacy {
        display: flex;
        flex: 1;
        justify-content: flex-end;

        .activate {
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
              content: '';
              margin-right: 10px;
              @apply inline-block bg-white align-text-top w-5 h-5 rounded-1/2;
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
              content: '';
              position: absolute;
              left: 5px;
              top: 9px;
              background: white;
              width: 2px;
              height: 2px;
              box-shadow:
                2px 0 0 white,
                4px 0 0 white,
                4px -2px 0 white,
                4px -4px 0 white,
                4px -6px 0 white,
                4px -8px 0 white;
              transform: rotate(45deg);
            }
          }
        }
      }
    }
  }
}
</style>
