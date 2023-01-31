<template>
  <base-main-cards-wrapper>
    <base-main-card
      v-show="!profileListShown"
      v-bind="$attrs"
      :title="title"
      :actions="actions"
      hide-search
      show-back-button
      body-class="bg-white py-8 md:px-16 lg:px-25 border-r border-gray-300 px-3"
      class="md:w-2/3"
      @back="back"
    >
      <div
        v-if="isMobileView"
        class="inline-flex items-center mb-8"
        @click="profileListShown = true"
      >
        <img
          v-for="i in 4"
          :key="i"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
          class="w-5 h-5 rounded-full -mr-1 border"
        >
      </div>

      <base-printer ref="printer">
        <div class="mb-8">
          <span v-if="entity.status === 'expired'" style="color: red">
            {{ $utils.formatDate(entity.activatedAt) }} -
            {{ $utils.formatDate(entity.expiredAt) }}
          </span>

          <span v-else-if="entity.status === 'active'" class="text-black">
            Active from {{ $utils.formatDate(entity.activatedAt) }}
          </span>

          <span v-else class="text-gray-500">To be activated</span>
        </div>

        <slot />
      </base-printer>
    </base-main-card>

    <base-main-card
      v-if="!isMobileView || profileListShown"
      show-search-toggler
      :show-back-button="isMobileView && profileListShown"
      body-class="bg-white flex flex-col overflow-hidden"
      class="md:w-1/3"
      @back="profileListShown = false"
    >
      <template #title-text>
        <span class="font-normal">Profile list</span>
      </template>

      <div class="flex-shrink-0 flex justify-around py-3 border-b font-bold">
        <a
          href="#"
          class=""
        >Accepted <span class="text-xs font-normal">(123.434)</span></a>

        <a
          href="#"
        >Not Accepted <span class="text-xs font-normal">(123.434)</span></a>
      </div>

      <base-scroll class="flex-grow p-2 md:p-3">
        <div
          v-for="profile in acceptedProfiles"
          :key="profile.name"
          class="w-full flex items-center rounded-lg border p-5 mb-2 shadow-lg"
        >
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
              class="w-full"
            >
          </div>

          <div class="ml-6">
            <p class="text-black">
              {{ profile.name }}
            </p>

            <p class="text-sm">
              {{ profile.date }}
            </p>
          </div>
        </div>
      </base-scroll>
    </base-main-card>
  </base-main-cards-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    title: { type: String, default: '' },
    printTitle: { type: String, default: '' },
    entity: { type: Object, required: true }
  },
  data () {
    return {
      acceptedProfiles: [
        {
          name: 'John Snow',
          date: '20/10/2020 04:30'
        },
        {
          name: 'John Doe',
          date: '20/10/2020 04:30'
        },
        {
          name: 'Michael Ballack',
          date: '20/10/2020 04:30'
        },
        {
          name: 'Francesco Totti',
          date: '20/10/2020 04:30'
        }
      ],

      profileListShown: false
    }
  },
  computed: {
    actions () {
      const actions = [
        {
          icon: 'printer',
          tooltip: this.$t('contract.action.print'),
          handler: entity =>
            this.$refs.printer.print({ title: this.printTitle || this.title })
        }
      ]

      if (this.entity.status === 'draft') {
        actions.push({
          icon: 'pen',
          tooltip: this.$t('contract.action.edit'),
          handler: entity => this.$emit('edit', entity)
        })
      } else {
        actions.push({
          icon: 'copy',
          tooltip: this.$t('contract.action.duplicate'),
          handler: entity => this.$emit('duplicate', entity)
        })
      }

      return actions
    },

    isMobileView () {
      return this.$mq === 'mobile'
    }
  },
  methods: {
    back () {
      if (this.profileListShown) {
        this.profileListShown = false
      } else {
        this.$emit('back')
      }
    }
  }
}
</script>
