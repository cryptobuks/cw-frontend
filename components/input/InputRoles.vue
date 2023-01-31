<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="value"
    :label="$attrs.label || 'Add role'"
    @add-item="showModal()"
  >
    <assign-role-modal
      ref="modal"
      :profile="profile"
      :country-code="countryCode"
      @done="onMakerDone"
    />

    <template #item="{ item }">
      <cw-invitation-card
        :title="$t('roles.' + item.role)"
        :hide-remove="value.length === 1"
        :last-sent-at="item.lastSentAt"
        :accepted-at="item.acceptedAt"
        @remove="remove"
        @edit="showModal(item)"
        @resend="resendInvitation(item)"
      />
    </template>
  </cw-input-subflow-wrapper>
</template>

<script>
import AssignRoleModal from '~/components/entities/role/AssignRoleModal'
export default {
  components: {
    AssignRoleModal
  },
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    profile: { type: Object, required: true },
    countryCode: { type: String, default: '' }
  },
  data () {
    return {
      tmpItemIndex: -1
    }
  },
  methods: {
    showModal (entity = null) {
      this.tmpItemIndex = this.value.indexOf(entity)
      this.$refs.modal.show(entity)
    },

    onMakerDone (entity) {
      const newRelation = {
        lastSentAt: new Date(),
        acceptedAt: null,
        ...entity
      }

      if (this.tmpItemIndex !== -1) {
        this.value.splice(this.tmpItemIndex, 1, newRelation)
      } else {
        const i = this.value.indexOf(v => v._id === newRelation._id)
        if (~i) {
          this.value.splice(i, 1, newRelation)
        } else {
          this.value.push(newRelation)
        }
      }

      const { validated } = this.$attrs.listeners
      validated && validated()
    },

    resendInvitation (relation) {
      // TODO Integrate api
      Object.assign(relation, { lastSentAt: new Date() })
    },

    remove (item) {
      this.$confirm(this.$t('input.roles.confirm_remove', { role: this.$t('roles.' + item.role) }), () => {
        this.value.splice(this.value.indexOf(item), 1)
      })
    }
  }
}
</script>
