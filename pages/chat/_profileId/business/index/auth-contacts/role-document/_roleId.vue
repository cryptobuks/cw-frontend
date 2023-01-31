<template>
  <base-main-card
    v-bind="$attrs"
    :title="title"
    body-class="flex flex-col px-4 py-4 h-profile-body bg-white"
    :actions="[{ name: 'role' }, { icon: 'copy' }, { icon: 'bin' }]"
    hide-search
    show-back-button
    v-on="$listeners"
  >
    <template #action:role>
      <cw-custom-select
        v-model="currentRole"
        v-bind="{ items: roles }"
        class="bg-transparent p-2"
      >
        <template #display="{ data: role }">
          <span class="text-sm">{{ role }}</span>
        </template>
      </cw-custom-select>
    </template>
    <div class="flex flex-col space-y-4">
      <h4 class="font-bold text-center">
        SALES ROLE DOCUMENT
      </h4>
      <p>
        Dictum id lorem, ridiculus risus. Incididunt suspendisse, purus
        torquent, aptent aenean nostra dictum eros dolorum penatibus doloremque
        risus neque placerat aute sit id nunc. Corporis aute eligendi etiam
        ligula tristique laborum deserunt, cras eleifend proin, quas? Feugiat
        ullamcorper velit numquam ad, phasellus? Etiam mus magni massa a mus.
      </p>
      <p>
        Dictum id lorem, ridiculus risus. Incididunt suspendisse, purus
        torquent, aptent aenean nostra dictum eros dolorum penatibus doloremque
        risus neque placerat aute sit id nunc. Corporis aute eligendi etiam
        ligula tristique laborum deserunt, cras eleifend proin, quas? Feugiat
        ullamcorper velit numquam ad, phasellus? Etiam mus magni massa a mus.
      </p>
      <div>
        <span class="block">Role start date: 01.01.2022</span>
        <span class="block">Role end date: 31.02.2022</span>
      </div>
      <div class="border-dashed border-gray-600 border-t-2 w-1/2" />
      <div class="text-blue">
        <h4>Role Document History:</h4>
        <ul class="ml-6">
          <li
            v-for="(history, index) in docHistory"
            :key="`doc-history-${history}-${index}`"
            class="list-disc"
          >
            {{ history }}
          </li>
        </ul>
      </div>
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    currentRole: 'Salesman',
    docHistory: Array(4).fill(
      '12.02.2020 12.30.12 role assigned by director %name% %surname% %Pin% on behalf of %companyname & vat or fiscal code%, via IP address: 122833646467467467467647'
    ),
    roles: ['Salesman', 'Director']
  }),
  computed: {
    displayedContacts () {
      return this.contacts.filter(
        contact => contact.status === this.activeTab
      )
    }
  },
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        this.title = $route.params.roleId
      }
    }
  }
}
</script>

<style>
</style>
