<template>
  <div class="fixed w-full h-full overflow-auto flex flex-col text-center text-white">
    <header class="relative pt-5 border-b border-gray-400 mb-10 min-h-16 flex-shrink-0">
      <span
        class="absolute left-0 bottom-0 h-10 w-12 inline-flex justify-center items-center"
        @click="back"
      >
        <base-icon name="chevron-left" />
      </span>

      <h1 class="text-2xl ledaing-loose">
        {{ $t('pages.book_shift') }}
      </h1>
    </header>

    <main class="px-5 sm:px-6 overflow-hidden flex-shrink-0 flex-grow relative max-w-lg w-full mx-auto">
      <template v-if="!isSubmitted && !isDeleted">
        <div v-if="saving" class="absolute inset-0 z-10" />

        <base-progressive-fields-container
          ref="fields"
          :fields="fields"
          :data="draft"
          :validated-data="validatedData"
          :hidden-fields="isDocumentsShown ? [] : ['documents']"
          show-all-fields
          @can-save-change="disabled = !$event"
        >
          <template #identifier="{ inputAttrs }">
            <cw-input-email-or-mobile
              ref="identiier"
              v-model="draft.identifier"
              v-bind="inputAttrs"
              :type-codes="['IN', 'TU']"
              @existed-profile="onProfileExisted"
              @new-profile="onNewProfile"
              @input="onIdentifierChange"
            />
          </template>

          <template #firstname="{ inputAttrs }">
            <base-input-text
              v-model="draft.firstname"
              v-bind="inputAttrs"
              :readonly="!!draft._id"
            />
          </template>

          <template #lastname="{ inputAttrs }">
            <base-input-text
              v-model="draft.lastname"
              v-bind="inputAttrs"
              :readonly="!!draft._id"
            />
          </template>

          <template v-if="isDocumentsShown" #documents="{ inputAttrs }">
            <cw-input-document-flags
              v-model="draft.documents"
              :profile="draft"
              :gym-id="$auth.user._id"
              v-bind="inputAttrs"
            />
          </template>
        </base-progressive-fields-container>
      </template>

      <div v-else class="text-center">
        <base-icon name="check-circle-black" class="mt-16 mb-10" size="120" />

        <p v-if="isDeleted">
          {{ $t('book_shift.delete_successfully') }}
        </p>

        <p v-else>
          {{ isDuplicated ? $t('book_shift.booking_existed_for') : $t('book_shift.booking_successfully_for') }}
          <br>
          <span class="text-4xl">
            {{ displayName }}
          </span>
          <template v-if="$route.query.bookingNumber">
            <br>
            {{ $t('book_shift.ahead_of_you', { bookingNumber: $route.query.bookingNumber }) }}
            <br>
            {{ $t('book_shift.we_will_call') }}
          </template>
        </p>
      </div>
    </main>

    <footer class="px-5 sm:px-6 mt-12 flex-shrink-0 max-w-lg w-full mx-auto pb-10 flex">
      <template v-if="!isSubmitted">
        <base-button xl :disabled="disabled" :loading="saving" @click="submit">
          <base-icon name="send" class="text-3xl" />
        </base-button>
      </template>

      <template v-else>
        <base-button v-if="isDuplicated && !isDeleted" xl inline class="mr-5 flex-shrink-0" @click="removeOldBooking">
          <base-icon name="bin" class="text-3xl" />
        </base-button>

        <base-button xl @click="back">
          <base-icon name="dismiss" class="text-3xl" />
        </base-button>
      </template>
    </footer>
  </div>
</template>

<script>
export default {
  data () {
    return {
      fields: [
        { name: '_id', hidden: true },
        { name: 'identifier', required: true },
        { name: 'firstname', required: true },
        { name: 'lastname', required: true },
        { name: 'documents', default: [] }
      ].map(f => ({
        ...f,
        label: this.$t('book_shift.' + f.name + '.label'),
        tooltip: this.$t('book_shift.' + f.name + '.tooltip')
      })),

      draft: {
        _id: undefined,
        identifier: null,
        firstname: null,
        lastname: null
      },
      validatedData: {},
      disabled: true,
      saving: false,
      hasRelation: false,
      hasActiveRelation: false,
      isDocumentsShown: false,

      isDuplicated: false,
      bookingNumber: 0,
      timeout: null,

      isDeleted: false
    }
  },
  computed: {
    displayName () {
      return decodeURIComponent(this.$route.query.displayName)
    },
    isSubmitted: {
      get () {
        return !!this.$route.query.done
      },
      set (done) {
        this.$router.replace({
          path: this.$route.path,
          query: done
            ? {
              done: true,
              displayName: encodeURIComponent(this.draft.firstname + ' ' + this.draft.lastname),
              bookingNumber: this.bookingNumber
            }
            : {}
        })
      }
    }
  },
  methods: {
    async onProfileExisted (profile) {
      const relation = await this.$repos.gymDeviceRepo.verifyUserRelation(profile._id)
      this.hasRelation = !!relation
      this.hasActiveRelation = relation?.status === 'active'
      this.isDocumentsShown = !this.hasActiveRelation

      this.validatedData = {
        _id: profile._id,
        firstname: profile.firstname,
        lastname: profile.lastname
      }

      Object.assign(this.draft, this.validatedData)

      setTimeout(() => this.$refs.fields.forceUpdate())
    },

    onNewProfile () {
      this.hasRelation = this.hasActiveRelation = false
      this.isDocumentsShown = !!this.draft.identifier
      if (this.draft._id) {
        Object.assign(this.draft, { _id: undefined, firstname: null, lastname: null })
      }
    },

    onIdentifierChange (val) {
      if (this.draft._id && this.$utils.isModified(this.validatedData.identifier, val)) {
        Object.assign(this.draft, { _id: undefined, firstname: null, lastname: null })
      }
    },

    async submit () {
      this.saving = true

      const profile = this.draft._id
        ? this.draft
        : await this.$repos.profileRepo.mutateProfile({
          _id: this.draft._id,
          typeCode: 'IN',
          firstname: this.draft.firstname,
          lastname: this.draft.lastname,
          ...({ [this.$refs.identiier.type === 'email' ? 'emails' : 'mobiles']: [this.draft.identifier] })
        })

      // If no relation create one
      if (!this.hasRelation && this.draft._id) {
        await this.$repos.gymDeviceRepo.createRelation(profile._id)
      }

      this.draft._id = profile._id

      // If inactive relation activate it
      if (!this.hasActiveRelation) {
        const payload = {
          profileId: profile._id,
          deviceId: this.$pwa.deviceInfo.id
        }
        if (this.isDocumentsShown) {
          payload.documents = this.draft.documents
        }
        await this.$repos.contractsRepo.acceptDocuments(payload)
      }

      const res = await this.$repos.gymDeviceRepo.bookShift({
        userId: profile._id
      })

      this.isDuplicated = res.data?.existing
      this.bookingNumber = res.data?.count || 0
      this.isSubmitted = !!res
      if (this.isSubmitted) {
        this.timeout = setTimeout(() => this.back(), 10000)
      }

      this.saving = false
    },

    removeOldBooking () {
      this.$confirm(this.$t('book_shift.confirm_cancel'), async () => {
        this.isDeleted = true
        await this.$repos.gymDeviceRepo.cancelShift(this.draft._id)
      })
    },

    back () {
      clearTimeout(this.timeout)
      this.$router.push('/device')
    }
  }
}
</script>
