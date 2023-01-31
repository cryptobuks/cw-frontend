<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="value"
    :label="$attrs.label || $t('roles.' + role)"
    @add-item="showModal()"
  >
    <assign-role-modal
      ref="modal"
      :role="role"
      :country-code="countryCode"
      :company-id="companyId"
      :hidden-profiles-id="hiddenProfilesId"
      @done="onMakerDone"
    />

    <template #item="{ item }">
      <invitation-card
        :hide-remove="required && value.length === 1"
        :last-sent-at="item.lastSentAt"
        :accepted-at="item.acceptedAt"
        :title="`${getProfileDisplayName(item.profile)} (${$t('roles.' + role)})`"
        @remove="remove(item)"
        @edit="showModal(item)"
        @resend="resendInvitation(item)"
      />
    </template>
  </cw-input-subflow-wrapper>
</template>

<script>
import InvitationCard from './organisms/InvitationCard'
import AssignRoleModal from '~/components/entities/role/AssignRoleModal'
export default {
  components: {
    AssignRoleModal,
    InvitationCard
  },
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    role: { type: String, required: true },
    countryCode: { type: String, default: '' },
    companyId: { type: String, default: null },
    required: Boolean
  },
  data () {
    return {
      tmpItemIndex: -1
    }
  },
  computed: {
    hiddenProfilesId () {
      return this.value?.map?.(relation => relation.profile._id) || []
    }
  },
  methods: {
    showModal (relation = null) {
      this.tmpItemIndex = this.value.indexOf(relation)
      this.$refs.modal.show(relation)
    },

    onMakerDone (relation) {
      const newRelation = {
        lastSentAt: new Date(),
        acceptedAt: null,
        ...relation
      }

      if (this.tmpItemIndex !== -1) {
        this.value.splice(this.tmpItemIndex, 1, newRelation)
      } else {
        this.value.push(newRelation)
      }

      this.$attrs.listeners?.validated?.()
    },

    resendInvitation (relation) {
      // TODO Integrate api
      const i = this.value.indexOf(relation)
      ~i && this.value.splice(i, 1, {
        ...this.value[i],
        lastSentAt: new Date()
      })
    },

    remove (item) {
      this.$confirm(this.$t('input.relations.confirm_remove', {
        name: item.profile.displayName,
        role: this.$t('roles.' + this.role)
      }), async () => {
        if (this.companyId && item._id) {
          if (this.role === 'TT') {
            await this.$repos.profileRepo.removeTutor(item, this.companyId)
          } else {
            await this.$repos.profileRepo.removeGymRole(item, this.companyId)
          }
        }
        this.value.splice(this.value.indexOf(item), 1)
      })
    },

    getProfileDisplayName (profile) {
      return profile.displayName ||
        profile.emails?.[0] ||
        profile.pins?.[0]?.value ||
        profile.mobiles?.[0]?.phoneNumber
    }
  }
}
</script>
