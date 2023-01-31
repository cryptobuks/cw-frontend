<template>
  <base-modal
    ref="baseModal"
    :disabled="!tmp.name || !tmp.target.length"
    :loading="submitting"
    @shown="onShown"
    @done="done"
  >
    <template #activator>
      <slot />
    </template>

    <template #title>
      <div class="flex items-center">
        <span>
          {{ title }}
        </span>
        <!-- <svg xmlns="http://www.w3.org/2000/svg" class="fill-current stroke-current w-5 h-5 ml-2">
          <use :href="`#profile-svg-icon-${_uid}`" />
        </svg>
        <span class="text-base font-normal ml-2">
          0/1125
        </span> -->
      </div>
    </template>

    <base-form v-slot="{ rules }" @submit="done">
      <base-progressive-fields-container
        :fields="fields"
        :data="tmp"
        show-all-fields
      >
        <template #name="{ inputAttrs }">
          <base-input-text
            v-model.trim="tmp.name"
            :label="nameFieldLabel"
            :tooltip="nameFieldTooltip"
            v-bind="inputAttrs"
            required
            @blur="titleName = $event.target.value"
          >
            <template #prepend>
              <base-photo-uploader
                :value="tmp.image && `/api/files${tmp.image}`"
                @change="updateImage"
              />
            </template>
          </base-input-text>
        </template>

        <template #target="{ inputAttrs }">
          <base-select
            v-model="tmp.target"
            :items="targets"
            item-text="text"
            item-value="value"
            :label="$t('chat.broadcast_modal.target_label')"
            :tooltip="$t('chat.broadcast_modal.target_tooltip')"
            v-bind="inputAttrs"
            hide-selected
          >
            <template #selected-item-text="{ item }">
              <div class="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="flex-shrink-0 fill-current stroke-current w-4 h-4"
                >
                  <use :href="`#${item.value.type}-svg-icon-${_uid}`" />
                </svg>
                <span class="truncate ml-1">{{ item.text }}</span>
              </div>
            </template>

            <template #item-text="{ item }">
              <div class="flex items-center text-sm px-2 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="fill-current stroke-current w-4 h-4"
                >
                  <use :href="`#${item.value.type}-svg-icon-${_uid}`" />
                </svg>
                <span class="ml-2">{{ item.text }}</span>
              </div>
            </template>
          </base-select>
        </template>

        <template #description="{ inputAttrs }">
          <base-textarea
            v-model.trim="tmp.description"
            maxlength="1000"
            :rules="[rules.maxLength(1000)]"
            :label="$t('chat.broadcast_modal.description_label')"
            :tooltip="descriptionFieldTooltip"
            v-bind="inputAttrs"
          />
        </template>

        <!-- Only for broadcasts -->
        <template v-if="isManagedByFieldShown" #managedBy="{ inputAttrs}">
          <base-select
            v-model="tmp.managedBy"
            :items="salespeople"
            item-text="displayName"
            item-value="_id"
            :label="$t('chat.broadcast_modal.managedby_label')"
            :placeholder="$t('chat.broadcast_modal.managedby_placeholder')"
            :tooltip="$t('chat.broadcast_modal.managedby_tooltip')"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <!-- SVG ICONS -->
    <svg xmlns="http://www.w3.org/2000/svg" class="hidden">
      <!-- profile -->
      <symbol :id="`profile-svg-icon-${_uid}`" viewBox="0 0 32 32">
        <g
          transform="translate(1 1)"
          stroke-width="1.5"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            d="M.492 29.78h29.2v-7.329c0-1.962-1.802-3.553-4.025-3.553H4.518c-2.223 0-4.026 1.59-4.026 3.553v7.33z"
          />
          <circle cx="14.729" cy="6.689" r="6" />
        </g>
      </symbol>

      <!-- course -->
      <symbol :id="`course-svg-icon-${_uid}`" viewBox="0 0 21 22">
        <g transform="translate(-36.506 .09)" fill="none" stroke-width=".95">
          <path
            d="M38.885 4.449a.25.25 0 000 .352l1.404 1.424h.002a.25.25 0 00.353 0l1.65-1.65a.25.25 0 00.001-.352L40.89 2.8l-.001-.001a.25.25 0 00-.354 0z"
          />
          <rect
            transform="rotate(-45)"
            x="19.773"
            y="33.158"
            width="11.5"
            height="3.5"
            rx="1"
          />
          <path
            d="M53.463 19l-.002.002a.25.25 0 01-.353-.004l-1.397-1.432a.25.25 0 01.002-.351l1.65-1.65.002-.002a.25.25 0 01.354.004L55.115 17a.25.25 0 01-.002.351z"
          />
          <rect
            transform="scale(1 -1) rotate(45)"
            x="19.773"
            y="-48.749"
            width="11.5"
            height="3.5"
            rx="1"
          />
          <path d="M43.29 8.64l6.004 6.005 1.446-1.446-6.004-6.005z" />
        </g>
      </symbol>

      <!-- interest -->
      <symbol :id="`interest-svg-icon-${_uid}`" viewBox="2 0 1000 1000">
        <path
          d="M832.7 270.7c-82.4 0-150 63.7-156.6 144.4-2.4-.1-4.8-.4-7.3-.4s-4.8.3-7.3.4C655 334.4 587.3 270.7 505 270.7c-82.4 0-150 63.7-156.6 144.4-2.4-.1-4.8-.4-7.3-.4-5.8 0-11.5.4-17.2 1-6.3-81-74.1-145-156.6-145C80.5 270.7 10 341.3 10 428s70.5 157.3 157.3 157.3c5.8 0 11.5-.3 17.2-1 6.3 81 74.1 145 156.6 145 82.4 0 150-63.7 156.6-144.4 2.4.1 4.8.3 7.3.3s4.8-.3 7.3-.3c6.6 80.7 74.2 144.4 156.6 144.4 82.4 0 150-63.7 156.6-144.4 2.4.1 4.8.3 7.3.3 86.7 0 157.3-70.6 157.3-157.3s-70.6-157.2-157.4-157.2zM36.5 428c0-72.1 58.7-130.8 130.8-130.8 69.7 0 126.7 54.9 130.4 123.8-61.2 17.6-107.1 71.3-113.1 136.5-5.7.8-11.4 1.3-17.3 1.3-72.2 0-130.8-58.7-130.8-130.8zm259.6 21.4c-7.7 46.9-40.4 85.3-83.9 101.3 7.8-46.9 40.4-85.3 83.9-101.3zm45 253.4c-69.7 0-126.7-54.9-130.4-123.8 61.2-17.6 107.1-71.3 113.1-136.5 5.7-.8 11.4-1.3 17.3-1.3 2.5 0 4.9.3 7.3.3 6 69.1 56.7 125.5 123 140-4.9 67.7-61.4 121.3-130.3 121.3zM375.6 446c49.8 13.7 87.7 56 94.9 108-49.8-13.7-87.7-55.9-94.9-108zm122.1 112.4c-6-69.1-56.7-125.5-123-140 4.9-67.6 61.4-121.2 130.3-121.2s125.4 53.6 130.3 121.2c-66.3 14.5-117 70.9-123 140-2.5.1-4.8.4-7.3.4s-4.9-.3-7.3-.4zM634.4 446c-7.2 52.1-45.1 94.4-94.9 108 7.2-52.1 45.1-94.4 94.9-108zm34.5 256.8c-68.9 0-125.4-53.6-130.3-121.2 66.3-14.5 117-70.9 123-140 2.4-.1 4.8-.3 7.3-.3s4.9.3 7.3.3c5.9 69.1 56.7 125.5 123 140-5 67.6-61.5 121.2-130.3 121.2zM703.4 446c49.7 13.7 87.7 56 94.9 108-49.8-13.7-87.7-55.9-94.9-108zm129.3 112.8c-2.5 0-4.9-.2-7.3-.3-6-69.1-56.7-125.5-123-140 4.9-67.6 61.4-121.2 130.3-121.2 72.1 0 130.8 58.7 130.8 130.8 0 72-58.7 130.7-130.8 130.7z"
        />
      </symbol>

      <!-- role -->
      <symbol :id="`role-svg-icon-${_uid}`" viewBox="0 0 15 15">
        <path
          d="M2 1S1 1 1 2v5.158C1 8.888 1.354 11 4.5 11H5V8L2.5 9s0-2.5 2.5-2.5V5c0-.708.087-1.32.5-1.775.381-.42 1.005-1.258 2.656-.471L9 3.303V2s0-1-1-1c-.708 0-1.978 1-3 1S2.787 1 2 1zm1 2a1 1 0 110 2 1 1 0 010-2zm4 1S6 4 6 5v5c0 2 1 4 4 4s4-2 4-4V5c0-1-1-1-1-1-.708 0-1.978 1-3 1S7.787 4 7 4zm1 2a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2zm-4.5 4h5s0 2.5-2.5 2.5S7.5 10 7.5 10z"
        />
      </symbol>
    </svg>
  </base-modal>
</template>

<script>
import { mapState } from 'vuex'
import FilterMixin from '@/mixins/FilterMixin'

export default {
  mixins: [FilterMixin],
  props: {
    modalType: { type: String, required: true },
    getAction: { type: Function, required: true },
    createAction: { type: Function, required: true },
    updateAction: { type: Function, required: true },
    nameFieldLabel: { type: String, required: true },
    nameFieldTooltip: { type: String, required: true },
    descriptionFieldTooltip: { type: String, required: true }
  },
  data: () => ({
    titleName: '',
    id: null,
    fields: [
      {
        name: 'name',
        required: true
      },
      {
        name: 'target',
        required: true
      },
      { name: 'description' },
      { name: 'managedBy' }
    ],
    tmp: {
      name: '',
      base64: '',
      image: '',
      target: [],
      description: '',
      managedBy: '' // only for broadcasts
    },
    submitting: false
  }),
  computed: {
    ...mapState('contacts', ['businessUsers']),
    ...mapState('chat', ['filterTarget']),
    title () {
      return `${
        this.id
          ? this.$t('chat.broadcast_modal.manage')
          : this.$t('chat.broadcast_modal.create')
      } ${this.titleName || this.modalType}`
    },

    targets () {
      return this.normalizeFilter(this.filterTarget)
    },

    selectedTargets () {
      return this.tmp.target.map(t => t._id) || []
    },

    isManagedByFieldShown () {
      const roles = new Set(this.$auth.user.roles)
      return this.modalType === 'Broadcast' && (roles.has('DI') || roles.has('OP'))
    },

    salespeople () {
      return this.businessUsers.filter(u => u.roles.some(({ role }) => role === 'SP'))
    }
  },
  methods: {
    show (source) {
      this.id = source?.chatId || null
      this.$refs.baseModal.show()
    },

    async onShown () {
      if (this.id) {
        const { data } = await this.getAction(this.id)
        const { name, image, filter, description, managedBy } =
          data.group ?? data.broadcast
        this.titleName = name

        // Using a lookup dictionary because it's faster than repeatedly traversing lists to find matches
        // TODO: Handle `courses` as well

        const filterIds = {
          profiles: {},
          roles: {},
          courses: {},
          interests: {}
        }
        filter.profiles?.forEach((i) => {
          filterIds.profiles[i] = true
        })
        filter.roles?.forEach((i) => {
          filterIds.roles[i] = true
        })
        filter.interests?.forEach((i) => {
          filterIds.interests[i] = true
        })

        const target = this.targets
          .filter(
            t =>
              (t.value.type === 'profile' && filterIds.profiles[t.value._id]) ||
              (t.value.type === 'role' && filterIds.roles[t.value.key]) ||
              (t.value.type === 'interest' && filterIds.interests[t.value._id])
          )
          .map(t => t.value)

        Object.assign(this.tmp, { name, image, target, description, managedBy })
      } else {
        Object.assign(this.$data, this.$options.data.call(this))
      }
    },
    async done () {
      this.submitting = true

      const { name, base64, description } = this.tmp
      const filter = {}

      this.tmp.target.forEach((target) => {
        const category = `${target.type}s`
        filter[category] = filter[category] || []
        if (['profiles', 'interests'].includes(category)) {
          filter[category].push(target._id)
        } else if (category === 'roles') {
          filter[category].push(target.key)
        }
      })

      const payload = { name, base64, description, filter }

      const roles = new Set(this.$auth.user.roles)
      if (
        this.modalType === 'Broadcast' &&
        (roles.has('DI') || roles.has('OP') || roles.has('SP'))
      ) {
        payload.managedBy = roles.has('DI') || roles.has('OP')
          ? this.tmp.managedBy
          : this.$auth.user.loginUser
      }

      if (this.id) {
        await this.updateAction({
          chatId: this.id,
          ...payload
        })
      } else {
        await this.createAction(payload)
      }

      this.submitting = false
      this.$refs.baseModal.hide()
    },
    updateImage ({ file }) {
      this.tmp.base64 = file.url.split(',')[1]
    }
  }
}
</script>
