<template>
  <base-main-card
    v-bind="$attrs"
    :title="`Terms and Conditions`"
    body-class="flex flex-col px-4 py-4 h-profile-body bg-white"
    :actions="[{ icon: 'search' }, { icon: 'add' }]"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        policies,
        profile,
        previousPage: `${$attrs.previousPage}/t-and-c`,
      }"
    />
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    policies: [
      {
        status: { code: 'pending', title: 'To be activated' },
        title: 'CW T & C 1.2.45'
      },
      {
        status: { code: 'active', title: 'Active from 03.09.2013 13:40' },
        title: 'T & C 3',
        acceptanceCount: '10, 001'
      },
      {
        status: { code: 'disabled', title: '03.09.2013 to 03.11.2019' },
        title: 'T & C 3',
        acceptanceCount: '10, 001'
      },
      {
        status: { code: 'disabled', title: '03.01.2010 to 03.09.2013' },
        title: 'T & C 1',
        acceptanceCount: '1,002'
      }
    ]
  }),
  methods: {
    statusClass (status) {
      const statusMap = {
        pending: 'border-gray-600',
        active: 'bg-green',
        disabled: 'hidden'
      }

      return statusMap[status.code]
    }
  }
}
</script>

<style></style>
