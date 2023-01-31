<template>
  <div class="relative">
    <button
      v-show="!isExpanded"
      class="absolute top-0 left-0 w-8 h-full rounded-l-10px z-10"
      :style="{ backgroundColor: '#ee18ff' }"
      @click="$emit('filter-course')"
    />
    <base-swipe-card
      container-class="card-container"
      :class="{ 'cursor-pointer': !isExpanded }"
      :actions="[
        { icon: 'pen', handler: () => {} },
        { icon: 'copy', bgColor: '#2c57f4', color: '#ffffff', handler: () => {} },
        { icon: 'bin', color: '#ffffff', danger: true, handler: () => {} },
      ]"
      :style="{ borderLeftWidth: !isExpanded ? '32px' : null }"
      :hide-actions="isExpanded"
      horizontal-actions
      v-bind="$attrs"
      v-on="$listeners"
      @click="isExpanded = true"
    >
      <template #title>
        <div class="relative flex text-sm pr-16">
          <h3 class="flex-1 truncate">
            Swimming
          </h3>
          <button v-show="isExpanded" class="absolute text-white text-opacity-75 top-0 right-0" @click.stop="isExpanded = false">
            <base-icon name="chevron-up" />
          </button>
          <button v-show="!isExpanded" class="absolute right-0 transform" style="top: 50%">
            <base-icon name="door" size="30" :style="{ color: '#2c57f4' }" />
          </button>
        </div>
      </template>

      <div v-if="!isExpanded" class="text-sm pr-8">
        <span>13:00 - 14:00</span>
      </div>

      <div v-else class="my-2">
        <section class="mt-2">
          <p class="text-xs text-white text-opacity-75 mt-1">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat, voluptates?
          </p>
        </section>

        <div class="text-sm mt-2">
          Age suggested: 6 - 12
        </div>

        <section class="mt-2">
          <h4 class="text-sm">
            The course includes
          </h4>
          <div class="space-y-2 mt-1">
            <div class="text-xs bg-gray-500 px-3 py-1 rounded-10px">
              <div class="flex items-center">
                <span class="text-black flex-1">Monday 14:00 - 15:00</span>
                <div class="flex space-x-2">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                </div>
              </div>
              <div class="space-y-2 mt-1">
                <div class="flex items-center">
                  <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-5 h-5 border border-black rounded-full">
                  <div class="text-black truncate ml-2">
                    Sala New York City
                  </div>
                </div>
                <div class="flex items-center">
                  <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-5 h-5 border border-black rounded-full">
                  <div class="text-black truncate ml-2">
                    Sala Green
                  </div>
                </div>
                <div class="flex items-center">
                  <base-icon name="wifi" class="flex-shrink-0 text-black" :size="20" style="margin-left: 2px" />
                  <div class="text-black truncate ml-2">
                    Collegamento da remoto
                  </div>
                </div>
              </div>
            </div>
            <div class="text-xs bg-gray-500 px-3 py-1 rounded-10px">
              <div class="flex items-center">
                <span class="text-black flex-1">Thursday 16:00 - 17:00</span>
                <div class="flex space-x-2">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                </div>
              </div>
              <div class="space-y-2 mt-1">
                <div class="flex items-center">
                  <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-5 h-5 border border-black rounded-full">
                  <div class="text-black truncate ml-2">
                    Sala Blue
                  </div>
                </div>
              </div>
            </div>
            <div class="text-xs bg-gray-500 px-3 py-1 rounded-10px">
              <div class="flex items-center">
                <span class="text-black flex-1">Friday 18:00 - 19:30</span>
                <div class="flex space-x-2">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                  <img class="flex-shrink-0 w-5 h-5 rounded-full" src="~assets/img/default-contact-avatar.svg">
                </div>
              </div>
              <div class="space-y-2 mt-1">
                <div class="flex items-center">
                  <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-5 h-5 border border-black rounded-full">
                  <div class="text-black truncate ml-2">
                    Sala Red
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mt-2">
          <h4 class="text-sm">
            Notes
          </h4>
          <p class="text-xs text-white text-opacity-75 mt-1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos soluta aperiam omnis tempore architecto commodi!
          </p>
        </section>

        <div class="text-sm mt-2">
          CONI Reporting Active!
        </div>

        <section class="mt-2">
          <h4 class="text-sm">
            Trial Lessons:
          </h4>
          <div class="space-y-2 mt-1">
            <div class="flex text-xs text-white text-opacity-75">
              <span class="flex-1">
                07/02/2019 | 15:00 - 16:00
              </span>
              <span>123€</span>
            </div>
            <div class="flex text-xs text-white text-opacity-75">
              <span class="flex-1">
                08/02/2019 | 16:00 - 17:00
              </span>
              <span>200€</span>
            </div>
            <div class="flex text-xs text-white text-opacity-75">
              <span class="flex-1">
                09/02/2019 | 18:00 - 19:00
              </span>
              <span>575€</span>
            </div>
          </div>
        </section>

        <section class="flex mt-4 text-2xs text-white text-opacity-75">
          <div class="flex flex-col items-center flex-1">
            <base-icon name="performance-index" size="30" />
            <span class="mt-1">Economic</span>
          </div>
          <div class="flex flex-col items-center flex-1">
            <base-icon name="performance-index" size="30" />
            <span class="mt-1">Relationship</span>
          </div>
          <div class="flex flex-col items-center flex-1">
            <base-icon name="performance-index" size="30" />
            <span class="mt-1">Contribution</span>
          </div>
        </section>
      </div>

      <template #footer>
        <div v-if="isExpanded" class="w-full">
          <button class="w-full flex justify-center items-center py-2" @click.stop>
            <svg class="stroke-current w-5" viewBox="0 0 30 32" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(.053 1)" stroke-width="1.5" fill="none" fill-rule="evenodd">
                <circle cx="24.447" cy="25.5" r="4.5" />
                <circle cx="24.447" cy="4.5" r="4.5" />
                <circle cx="5.447" cy="14.5" r="4.5" />
                <path d="M19.818 6.92l-9.87 5.58M9.947 16.956l10.5 6.544" stroke-linecap="round" />
              </g>
            </svg>
          </button>
        </div>
      </template>
    </base-swipe-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    isExpanded: false
  })
}
</script>

<style lang="postcss" scoped>
.swipe-card {
  min-height: initial;

  & ::v-deep header {
    @apply pr-0;
  }

  & ::v-deep .swipe-card__title {
    overflow: initial !important;
  }

  & ::v-deep .swipe-card__menu-toggler {
    right: 50px;
    top: 50%;
    transform: translateY(-50%) scale(1.5);
  }

  & ::v-deep .swipe-card__actions__item {
    min-width: initial;
    @apply w-10;
  }

  & ::v-deep footer {
    @apply -mx-4 -mb-4 border-t-2 border-white border-opacity-50;
  }
}

::v-deep .card-container {
  max-width: 320px;
  @apply bg-black;
}
</style>
