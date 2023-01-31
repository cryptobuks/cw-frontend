<template>
  <base-main-card
    v-bind="$attrs"
    :title="$t('entities.profile')"
    body-class="flex flex-col bg-gray-150 bg-opacity-90 h-full"
    :actions="[{ icon: 'dismiss', handler: close, size: 16 }]"
  >
    <nuxt-child
      v-bind="{
        hideSearch: true,
        showBackButton: true,
        profile,
        previousPage: `/chat/${$route.params.profileId}/business`
      }"
    />

    <cw-import-contacts-modal ref="ImportContactsModal" />

    <div class="bg-white py-4 px-8 w-screen md:w-auto">
      <div class="flex overflow-hidden">
        <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-150">
          <img
            :src="$utils.getAvatarUrl(profile.avatar)"
            alt="Business Profile"
            class="w-full max-h-full object-cover"
          >
        </div>

        <div class="flex-grow ml-3">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold">
              {{ profile.brand || profile.name }}
            </h4>

            <nuxt-link :to="`${$route.path}/profile-info`" @click.native="showCalendar = false">
              <base-icon
                name="chevron-right"
                class="text-gray-600 cursor-pointer"
              />
            </nuxt-link>
          </div>

          <p v-if="profile.shortDescription" class="mt-3 text-sm">
            {{ profile.shortDescription }}
          </p>
        </div>
      </div>

      <nuxt-link
        :to="
          viewingSelf($auth) || allowed('business.edit-gym-hours')
            ? `${$route.path}/gym-hours`
            : $route.path
        "
        class="flex items-center px-0 mt-4 cursor-pointer"
        @click.native="showCalendar = !showCalendar"
      >
        <base-icon name="opening-gym" size="20" />

        <span
          v-if="gymStatus().closed === true"
          class="ml-2 text-sm capitalize"
        >
          {{ $t('gym.open_hours.closed') }}
        </span>
        <span v-else class="ml-2 text-sm capitalize">
          {{ $t('gym.open_hours.open_now') }}:
          {{
            gymStatus()
              .time.map((t) => `${t.from} - ${t.to}`)
              .join(' | ')
          }}
        </span>
        <base-icon
          v-if="!allowed('business.edit-gym-hours') && !viewingSelf($auth)"
          name="chevron-down"
          size="10"
          :rotate="showCalendar ? -180 : 0"
          class="ml-3"
        />
      </nuxt-link>

      <base-flatpickr
        v-if="
          !allowed('business.edit-gym-hours') &&
            !viewingSelf($auth) &&
            showCalendar
        "
        v-model="date"
        v-bind="{
          flatpickrConfig: {
            inline: true,
            minDate: $dayjs().format()
          },
          theme: 'light'
        }"
        class="shadow-cw-card rounded-lg mt-3"
      />

      <nuxt-link
        class="flex items-center justify-between shadow-cw-card mt-8 rounded-md cursor-pointer"
        :to="`${$route.path}/address-map`"
      >
        <div class="ml-2 flex items-center">
          <base-icon name="map-pin" />
          <span class="text-xs ml-2">{{
            profile.address && profile.address.fulladdress
          }}</span>
        </div>

        <img
          src="/images/sample/google-maps-alternatives.png"
          alt="google maps alternatives"
          address="Via Dante 33 Milane"
          class="h-16 rounded-r-md"
        >
      </nuxt-link>

      <div
        v-if="profile.onlineLinks && profile.onlineLinks.length"
        class="mt-8 flex justify-between items-center"
      >
        <a
          v-for="site in profile.onlineLinks"
          :key="site._id"
          :href="site.link"
          rel="noopener noreferrer nofollow"
          target="_blank"
          class="inline-block no-underline hover:no-underline"
        >
          <base-icon
            :name="'social-' + (site.type === 'url' ? 'web' : site.type)"
            :size="site.type === 'url' ? 40 : 25"
          />
        </a>
      </div>
    </div>

    <div class="mt-1">
      <cw-profile-section-item
        v-for="section in sections"
        :key="section.to"
        v-bind="section"
        @click="onSectionClick(section)"
      >
        <template v-if="section.action" #right-content>
          <base-spinner v-if="section.loading" size="sm" class="mx-3" />
          <base-icon
            v-else
            name="chevron-right"
            size="15"
            class="text-gray-500"
          />
        </template>
      </cw-profile-section-item>
      <cw-block-profile
        v-if="
          allowed('business.block-unblock') ||
            !['active'].includes(userRelationship && userRelationship.status)
        "
        v-bind="{ profile }"
      />
    </div>
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { saveAs } from 'file-saver'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    relationship: true,
    date: new Date(),
    rolesLoading: true,
    showCalendar: false
  }),
  computed: {
    ...mapGetters('gym-hours', ['gymStatus']),
    ...mapGetters('profile', ['allowed', 'viewingSelf']),
    ...mapState('profile', ['userRelationship', 'userRoles']),
    sections () {
      return [
        {
          icon: 'contract',
          title: 'profile.entities.contracts',
          to: 'contracts'
        },
        {
          icon: 'auth-contact',
          title: 'profile.entities.auth_contacts',
          to: 'auth-contacts'
        },
        {
          icon: 'gym-device',
          title: 'profile.entities.gym_devices',
          to: 'gym-devices'
        },
        {
          icon: 'editor/image',
          title: 'profile.entities.app_background',
          to: 'app-background'
        },
        {
          icon: 'wallet',
          title: 'profile.entities.credit_wallet',
          to: 'wallet'
        },
        {
          icon: 'qr-code',
          title: 'profile.entities.qr_codes',
          to: 'qr-code'
        },
        {
          icon: 'cw-modules/payment',
          title: 'profile.entities.payment_systems',
          to: 'payment-systems'
        },
        {
          icon: 'chat-plugin',
          title: 'profile.entities.chat_plugin',
          to: 'chat-plugin'
        },
        {
          icon: 'export',
          title: 'profile.entities.export_contacts',
          to: 'export-contacts',
          action: section =>
            this.$confirm(
              `${this.$t('profile.entities.export_contacts')}?`,
              () => {
                this.exportContacts(section)
              }
            ),
          loading: false,
          noNavigation: true
        },
        {
          icon: 'import',
          title: 'profile.entities.import_contacts',
          modal: 'ImportContactsModal',
          to: 'import-contacts'
        },
        {
          icon: 'customer',
          title: 'profile.entities.assigned_contacts',
          to: `auth-contacts/${this.$auth.user._id}?prev=${this.$route.path}`,
          hide: true
        }
      ].filter(
        section =>
          !section.hide &&
          (this.viewingSelf(this.$auth) ||
            this.allowed(`business.${section.to}`))
      )
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (profile) {
        this.getGymHours(profile._id)
      }
    }
  },
  methods: {
    ...mapActions('gym-hours', ['getGymHours']),
    async exportContacts (section) {
      section.loading = true
      const content = await this.$repos.contactsRepo.exportContacts()
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
      saveAs(blob, 'contacts.csv')
      section.loading = false
      this.$notifier.success(this.$t('global.exported'))
    },
    close () {
      this.$router.push('/chat')
    },
    onSectionClick (section) {
      const { action, modal, title, to } = section
      if (action) {
        action(section)
      } else if (modal) {
        this.$refs[modal]?.show?.()
      } else if (to) {
        this.$router.push(`${this.$route.path}/${to}`)
      } else {
        this.$router.push(`${this.$route.path}/coming-soon?entity=${title}`)
      }
    }
  }
}
</script>

<style>
.text-horizontal-tb {
  writing-mode: horizontal-tb;
}
.text-vertical-rl {
  writing-mode: vertical-rl;
}
.text-vertical-lr {
  writing-mode: vertical-lr;
}
</style>
