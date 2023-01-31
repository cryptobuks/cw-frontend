<template>
  <div class="space-y-2">
    <div class="flex items-center">
      <div class="flex items-center flex-1">
        <span class="uppercase">{{ $attrs.courseChatLabel }}</span>
        <base-icon
          v-tippy="{
            content: $attrs.courseChatTooltip,
            placement: 'bottom',
          }
          "
          class="ml-2"
          name="question-circle"
          size="20"
        />
      </div>
      <base-switcher
        :value="chatGroup"
        :true-text="$t('global.yes')"
        :false-text="$t('global.no')"
        false-color="#be0000"
        @input="$emit('update:chatGroup', $event)"
      />
    </div>
    <div class="flex items-center">
      <div class="flex items-center flex-1">
        <span class="uppercase">{{ $attrs.coniReportingLabel }}</span>
        <base-icon
          v-tippy="{
            content: $attrs.coniReportingTooltip,
            placement: 'bottom',
          }
          "
          class="ml-2"
          name="question-circle"
          size="20"
        />
      </div>
      <base-switcher
        :value="reporting"
        :true-text="$t('global.yes')"
        :false-text="$t('global.no')"
        false-color="#be0000"
        @input="$emit('update:reporting', $event)"
      />
    </div>
    <div class="flex items-center">
      <div class="flex items-center flex-1">
        <span class="uppercase">{{ $attrs.courseTypeLabel }}</span>
        <base-icon
          v-tippy="{
            content: $attrs.courseTypeTooltip,
            placement: 'bottom',
          }
          "
          class="ml-2"
          name="question-circle"
          size="20"
        />
      </div>
      <base-switcher
        :value="isPublic"
        :true-text="$t('global.public')"
        :false-text="$t('global.private')"
        false-color="#be0000"
        @input="$emit('update:isPublic', $event)"
      />
    </div>
    <base-select
      v-show="!isPublic"
      :items="businessUsers"
      :value="guests"
      item-text="displayName"
      item-value="_id"
      :label="$attrs.guestsLabel"
      :placeholder="$attrs.guestsPlaceholder"
      hide-selected
      @input="$emit('update:guests', $event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    chatGroup: Boolean,
    reporting: Boolean,
    isPublic: { type: Boolean, default: true },
    guests: { type: Array, default: () => [] }
  },
  data: () => ({
    businessUsers: []
  }),
  async created () {
    this.businessUsers = await this.$repos.contactsRepo.getBusinessUsers(
      this.$auth.user._id
    )
  }
}
</script>
