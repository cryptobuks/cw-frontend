<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions: [{ icon: 'add' }],
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-full',
      title: 'Role Characteristics',
    }"
  >
    <base-scroll class="max-h-48">
      <cw-profile-section-item
        v-for="link in links"
        :key="link.title"
        v-bind="link"
      >
        <template #right-content>
          <span
            class="mr-4 uppercase text-sm"
            :class="[
              link.status === 'active'
                ? 'text-green'
                : link.status === 'pending'
                  ? 'text-red'
                  : '',
            ]"
          >{{ link.status }}</span>
        </template>
      </cw-profile-section-item>
    </base-scroll>

    <div class="bg-white flex flex-col py-4 px-4 space-y-3">
      <div class="flex flex-col">
        <div class="flex items-center mb-1">
          <span class="font-bold uppercase mr-2">
            {{ $t("assign_role.authorization.label") }}
          </span>
          <base-icon name="question-circle" size="17" />
        </div>
        <base-swipe-card
          auto-height
          bg-color="white"
          container-class="text-black"
          class="shadow-cw-card ml-4"
          toggler-class="text-black"
          :actions="[{ icon: 'pen' }]"
        >
          <div class="flex flex-col">
            <div class="flex justify-end space-x-2 items-center mr-4">
              <span class="text-xs font-bold capitalize">
                {{ $t("authorization.card.customized") }}
              </span>
              <span class="text-2xs"> 12.12.2020 {{ $t("global.by") }} </span>
              <span class="font-bold text-2xs">James Brown</span>
            </div>
            <div class="flex flex-wrap h-20 truncate">
              <div
                v-for="auth in platformAuths"
                :key="auth.title"
                class="flex flex-wrap items-center mr-2"
              >
                <span class="text-2xs capitalize">{{ auth.title }}</span>
                <div
                  class="text-2xs rounded-full px-1 ml-2"
                  :class="[auth.class || 'bg-gray-400']"
                >
                  {{ auth.action }}
                </div>
              </div>
            </div>
          </div>
        </base-swipe-card>
      </div>

      <div class="flex flex-col">
        <div class="flex items-center mb-1">
          <span class="font-bold uppercase mr-2">
            {{ $t("payroll.payroll.label") }}
          </span>
          <base-icon name="question-circle" size="17" />
        </div>
        <base-swipe-card
          auto-height
          bg-color="white"
          container-class="text-black"
          class="shadow-cw-card"
          toggler-class="text-black"
          :actions="[{ icon: 'pen' }]"
        >
          <div class="flex flex-col">
            <div class="flex justify-end space-x-2 items-center mr-4">
              <span class="text-xs font-bold capitalize">{{
                $t("global.active")
              }}</span>
              <span class="text-2xs"> 12.12.21</span>
              <span class="font-bold text-2xs">
                {{ $t("role_characterisitics.no_end") }}
              </span>
            </div>
            <div class="flex flex-col h-16 space-y-1">
              <span
                v-for="payroll in payrolls"
                :key="payroll.title"
                class="text-xs"
              >
                <span class="uppercase"> {{ payroll.title }} </span>:
                {{ $t(`payroll.periods.${payroll.frequency}`) }} |
                {{ $t(`payroll.variables.${payroll.variable}`) }} |
                {{ payroll.price }}
              </span>
            </div>
          </div>
        </base-swipe-card>
      </div>

      <div class="flex flex-col">
        <div class="flex items-center mb-1">
          <span class="font-bold uppercase mr-2 text-sm">
            {{ $t("authorized_sports.modal.title") }}
          </span>
          <base-icon name="question-circle" size="17" />
        </div>
        <base-swipe-card
          auto-height
          bg-color="white"
          container-class="text-black"
          class="shadow-cw-card"
          toggler-class="text-black"
          :actions="[{ icon: 'pen' }]"
        >
          <div class="flex flex-col">
            <div class="flex justify-end space-x-2 items-center mr-4">
              <span class="text-xs font-bold capitalize">{{
                $t("global.active")
              }}</span>
              <span class="text-2xs"> 12.12.21</span>
            </div>
            <div class="flex flex-col space-y-1">
              <div class="flex-col">
                <span class="font-bold uppercase">
                  {{ $t("authorized_sports.card.courses") }}
                </span>
                <div class="flex flex-wrap">
                  <div
                    v-for="courseAuth in courseAuths"
                    :key="`c-auths-${courseAuth}`"
                    class="bg-gray-400 flex items-center justify-between rounded-full text-2xs px-1 mb-1 mr-2"
                  >
                    <span class="mr-3">{{ courseAuth }}</span>
                    <button>
                      <base-icon name="dismiss" size="7" />
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex-col">
                <span class="font-bold uppercase text-sm">
                  {{ $t("authorized_sports.card.lessons") }}
                </span>
                <div class="flex flex-wrap">
                  <div
                    v-for="auth in personalLessonAuths"
                    :key="`c-auths-${auth}`"
                    class="bg-gray-400 flex items-center justify-between rounded-full text-2xs px-1 mb-1 mr-2"
                  >
                    <span class="mr-3">{{ auth }}</span>
                    <button>
                      <base-icon name="dismiss" size="7" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </base-swipe-card>
      </div>
    </div>

    <base-scroll class="max-h-48">
      <cw-profile-section-item
        v-for="link in links"
        :key="link.title"
        v-bind="link"
      >
        <template #right-content>
          <span
            class="mr-4 uppercase text-sm"
            :class="[
              link.status === 'active'
                ? 'text-green'
                : link.status === 'pending'
                  ? 'text-red'
                  : '',
            ]"
          >{{ link.status }}</span>
        </template>
      </cw-profile-section-item>
    </base-scroll>
  </base-main-card>
</template>

<script>
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    courseAuths: [
      'Classic Dance',
      'Modern Dance',
      'Contemporary Dance',
      'Hip Hop Dance',
      'Bell Dance'
    ],
    links: [
      {
        icon: 'mask',
        title: 'role_characterisitics.contracts.salesman',
        status: 'pending'
      },
      {
        icon: 'mask',
        title: 'role_characterisitics.contracts.trainer',
        status: 'active'
      },
      { icon: 'person', title: 'profile.entities.assigned_contacts' }
    ],
    payrolls: [
      {
        title: 'Payroll 1',
        frequency: 'monthly',
        variable: 'week',
        price: '250,00 Euros'
      },
      {
        title: 'Payroll 2',
        frequency: 'monthly',
        variable: 'new_client',
        price: '12,00 Euros'
      },
      {
        title: 'Payroll 1',
        frequency: '31.12.21',
        variable: 'new_client',
        price: '1.500,00 Euros'
      }
    ],
    personalLessonAuths: ['Calssic Dance', 'Modern Dance'],
    platformAuths: [
      { title: 'Contacts', action: 'change' },
      { title: 'Import/Export', action: 'download' },
      { title: 'Gym Profile', action: 'hide', class: 'bg-red text-white' },
      { title: 'Gym Contracts', action: 'change' },
      { title: 'Gym Collaborator', action: 'hide', class: 'bg-red text-white' },
      { title: 'Gym Device', action: 'change' },
      { title: 'Background', action: 'request' },
      { title: 'Credit Wallet', action: 'read' },
      { title: 'Web Chat', action: 'read' },
      { title: 'Email in chat', action: 'read' },
      { title: 'Related contacts', action: 'change' }
    ]
  })
}
</script>
