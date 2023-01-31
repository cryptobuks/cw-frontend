<template>
  <base-main-card
    v-slot="{ items }"
    :title="$t('nav.contacts')"
    :items="menus"
    :item-text="(item) => $t(item.title)"
  >
    <base-card-list-container :items="items">
      <template #item="{ item: menu }">
        <div class="relative">
          <button
            class="absolute top-0 left-0 w-5 h-full rounded-l-10px z-10"
            :class="[menu.color]"
            @click="$emit('filter-course')"
          />
          <base-swipe-card hide-actions bg-color="gray" class="ml-2">
            <template #title>
              <span class="text-xs">{{ menu.title }}</span>
            </template>

            <template #default>
              <div class="text-sm">
                13,412 - Active profiles
              </div>
              <div class="text-sm">
                132 - Negligibles profiles
              </div>
              <div class="text-sm">
                600 - Companies
              </div>
            </template>
          </base-swipe-card>
        </div>
      </template>
    </base-card-list-container>
  </base-main-card>
</template>

<script>
export default {
  data () {
    return {
      menus: [
        {
          title: 'Contacts',
          to: '/reports/subscribers',
          color: 'bg-green'
        },
        {
          title: 'Contacts per interest',
          to: '/reports/orders',
          color: 'bg-orange'
        },
        {
          title: 'Contacts per channel',
          to: '/reports/sales',
          color: 'bg-blue'
        },
        {
          title: 'Gym Accesses',
          to: '/reports/earnings',
          color: 'bg-yellow-500'
        }
      ]
    }
  }
}
</script>
