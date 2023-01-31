<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    @add-item="showModal"
  >
    <base-swipe-card
      v-if="transformedValue.length"
      bg-color="#262626"
      hide-remove
      auto-height
      toggler-class="-mr-2 -mt-2"
      body-class="pr-3"
      class="mt-2"
      @edit="showModal"
    >
      <h4 class="text-xl text-right font-bold mb-2">
        {{ $t('authorization.card.customized') }}

        <span class="text-sm">
          12.12.2020 {{ $t('global.by') }} James Brown
        </span>
      </h4>

      <div class="flex flex-wrap text-base">
        <template
          v-for="([entityKey, actionKey], i) in transformedValue"
        >
          <template v-if="entities[entityKey]">
            <span v-if="!!i" :key="entityKey + '_separator'" class="mr-1 inline-block">
              |
            </span>

            {{ $t('authorization.entities.' + entityKey) }}

            <span
              :key="entityKey + '_perm'"
              class="inline-block h-4 mx-1 rounded-lg text-2xs uppercase px-2 self-center"
              :class="[actionKey === 'hide' ? 'bg-red text-white' : 'bg-white text-black']"
            >
              {{ $t('authorization.actions.' + actionKey) }}
            </span>
          </template>
        </template>
      </div>
    </base-swipe-card>

    <base-modal
      v-if="profile"
      ref="modal"
      :title="$t('authorization.modal.title') + ' ' + $t('roles.' + role) + ' ' + profile.displayName"
      @done="onModalDone"
    >
      <div v-show="$utils.isModified(draft, originalDraft)" class="flex">
        <base-switcher
          true-text="DEFAULT"
          false-text="CUSTOMIZED"
          true-color="#262626"
          false-color="#262626"
          class="ml-auto"
          @input="draft = $utils.clone(originalDraft)"
        />
      </div>

      <div v-for="group in permissionsByGroup" :key="group.key" class="mb-8">
        <div class="uppercase mb-6 flex items-center text-xl">
          {{ $t('authorization.groups.' + group.key + '.label') }}

          <base-icon
            v-if="group.key === 'profile'"
            v-tippy="$t('authorization.groups.' + group.key + '.tooltip')"
            name="question-circle"
            class="ml-2"
          />

          <base-icon v-else name="circle" class="ml-2" />
        </div>

        <div v-for="item in group.items" :key="item.key" class="flex flex-wrap pl-6 mb-2">
          <div class="w-full sm:w-1/2 truncate flex items-center pr-2">
            {{ $t('authorization.entities.' + item.key + '.label') }}

            <base-icon
              v-if="item.hasTooltip"
              v-tippy="$t('authorization.entities.' + item.key + '.tooltip')"
              name="question-circle"
              class="ml-2 flex-shrink-0"
            />

            <base-switcher
              v-if="item.key === 'contact'"
              v-model="draft.relatedContactOnly"
              true-text="RELATED"
              false-text="ALL"
              true-color="#262626"
              false-color="#262626"
              class="ml-2"
            />
          </div>

          <div class="w-4/5 sm:w-1/2 my-2 sm:my-0 ml-auto">
            <base-input-selection-slider
              v-model="draft[item.key]"
              :items="item.permissions.map(p => ({ value: p, text: $t('authorization.actions.' + p), danger: p === 'hide' }))"
              :class="[item.permissions.length === 2 ? 'w-1/2' : '']"
            />
          </div>
        </div>
      </div>
    </base-modal>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  props: {
    // { contact: 'hide', relatedContact: 'read' }
    value: { type: Object, required: true },
    role: { type: String, required: true },
    profile: { type: Object, required: true }
  },
  data () {
    return {
      draft: {
        relatedContactOnly: true,
        contact: 'hide',
        import: 'hide',
        profile: 'read',
        contracts: 'hide',
        device: 'hide',
        wallet: 'hide',
        chat: 'hide',
        roleContacts: 'hide',
        group: 'hide',
        broadcast: 'read'
      },

      originalDraft: null,

      entities: {
        contact: { group: 'profile' },
        import: { group: 'profile' },
        profile: { group: 'settings' },
        contract: { group: 'settings', hasTooltip: true },
        collaborator: { group: 'settings' },
        device: { group: 'settings' },
        background: { group: 'settings' },
        wallet: { group: 'settings', hasTooltip: true },
        chat: { group: 'settings' },
        mailInChat: { group: 'settings' },
        roleContacts: { group: 'settings', hasTooltip: true },
        group: { group: 'chat', hasTooltip: true },
        broadcast: { group: 'chat' }
      }
    }
  },
  computed: {
    transformedValue () {
      const { relatedContact, ...value } = this.value
      if (relatedContact) {
        value.contact = relatedContact
      }
      return Object.entries(value)
    },

    permissions () {
      // TODO dynamic permissions by this.role
      return {
        contact: ['hide', 'read', 'change'],
        import: ['hide', 'read'],
        profile: ['read', 'change'],
        contracts: ['hide', 'read', 'change'],
        device: ['hide', 'read', 'change'],
        background: ['hide', 'read', 'change'],
        wallet: ['hide', 'read', 'pay'],
        chat: ['hide', 'change'],
        roleContacts: ['hide', 'read', 'change'],
        group: ['read', 'update'],
        broadcast: ['hide', 'create']
      }
    },

    permissionsByGroup () {
      const groups = {}

      for (const [key, permissions] of Object.entries(this.permissions)) {
        const entity = this.entities[key]
        if (!entity) {
          continue
        }

        if (!groups[entity.group]) {
          groups[entity.group] = {
            key: entity.group,
            items: []
          }
        }

        groups[entity.group].items.push({
          key,
          permissions,
          hasTooltip: entity.hasTooltip
        })
      }

      return Object.values(groups)
    }
  },
  methods: {
    showModal () {
      const draft = this.$utils.extract(
        this.value,
        Object.entries(this.permissions).map(([entityKey, actions]) => ({
          from: entityKey,
          default: actions[actions.length - 1]
        }))
      )
      draft.relatedContactOnly = draft.contact === 'hide'
      if (draft.relatedContactOnly) {
        draft.contact = this.value.relatedContact || null
      }
      this.draft = draft
      this.originalDraft = this.$utils.clone(draft)
      this.$refs.modal.show()
    },

    onModalDone () {
      const { relatedContactOnly, ...draft } = this.draft
      draft.relatedContact = draft.contact
      draft.contact = relatedContactOnly ? 'hide' : draft.relatedContact
      this.$emit('input', draft)
      this.$refs.modal.hide()
    }
  }
}
</script>
