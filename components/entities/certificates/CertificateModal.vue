<template>
  <base-modal
    v-bind="{
      disabled,
      loading: saving,
      ref: 'modal'
    }"
    @done="submit"
    @dismiss="hide"
  >
    <template #title>
      <span class="capitalize">
        {{ $t('global.manage') }} {{ $t(`certificates.${certType}`) }}
      </span>
    </template>
    <base-form v-slot="{ rules }" class="h-full flex flex-col">
      <div class="flex items-center mb-6">
        <base-switcher
          v-if="['medical'].includes(certType)"
          v-model="certificate.competitive"
          v-bind="{
            disabled: !!certificate._id,
            falseText: $t('certificates.subtype.nonCompetitive'),
            trueText: $t('certificates.subtype.competitive'),
            falseColor: 'blue',
            class: 'rounded-full mr-4'
          }"
        />
        <div
          v-if="
            !addExisting && certificate._id && !editing && pendingCertificate
          "
          class="max-w-xs xl:max-w-sm"
        >
          {{ $t('certificates.create.existing_certificate') }}
          <button class="underline uppercase" @click="addExisting = true">
            {{ $t('yes') }}
          </button>
          {{ $t('global.or') }}
          <button class="underline uppercase" @click="resetCertificate()">
            {{ $t('no') }}
          </button>
        </div>
      </div>
      <base-select
        v-if="['identity'].includes(certType)"
        v-model="certificate.subtype"
        :label="$t('certificates.create.document_type')"
        :placeholder="$t('certificates.create.document_type')"
        :items="subTypes"
        item-text="name"
        item-value="value"
        hide-selected
        searchable
        sort-by-text
      />
      <base-input-text
        v-if="certType === 'enable'"
        v-model="certificate.name"
        v-bind="{
          label: $t('certificates.detail.document_name'),
          rules: [rules.maxLength(50)],
          tooltip: $t('certificates.detail.document_name')
        }"
      />
      <base-select
        v-if="certificate.competitive && !['curriculum'].includes(certType)"
        v-model="certificate.sports"
        :label="$t('global.sports')"
        :placeholder="$t('global.sports')"
        :items="sportInterests"
        item-text="name"
        item-value="_id"
        hide-selected
        searchable
        sort-by-text
      />
      <base-input-date
        v-if="!['curriculum'].includes(certType)"
        v-model="certificate.expiry"
        :label="
          certType === 'enable'
            ? $t('certificates.detail.release_date')
            : $t('global.expiry_date')
        "
        :tooltip="$t('global.expiry_date')"
        initial-view="year"
      />

      <span class="font-bold text-xl mb-2">{{ $t('input.select_file') }}</span>
      <p>{{ $t('input.allowed_files', { allowed: '.pdf, jpg or .png' }) }}</p>
      <base-input-file
        v-slot="{ fileURL }"
        v-model="certificate.file"
        accept="image/jpeg,image/gif,image/png,application/pdf"
        class="mt-6 w-full h-full"
      >
        <div
          v-if="!certificate.file && !existingFile.url"
          class="rounded-lg focus:outline-none h-24 w-24 border-dashed border-4 flex items-center justify-center"
        >
          <base-icon name="add" size="40" />
        </div>
        <div v-else class="flex flex-col items-center space-y-2 w-full h-full">
          <div class="flex items-center justify-between w-full">
            <span class="font-bold">File Preview</span>
            <button
              class="bg-gray-600 text-white h-4 w-4 rounded-full flex items-center justify-center focus:outline-none -mt-3"
              type="button"
              @click="clearFile()"
            >
              <base-icon name="dismiss" size="5" />
            </button>
          </div>
          <embed
            :src="fileURL || existingFile.url"
            :alt="
              (certificate.file && certificate.file.name) || existingFile.name
            "
            class="w-full h-full"
          >
        </div>
      </base-input-file>
    </base-form>
  </base-modal>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
  props: {
    certType: { type: String, default: '' },
    profile: { type: Object, required: true }
  },
  data: () => ({
    addExisting: false,
    certificate: {
      name: null,
      competitive: false,
      subtype: null,
      sports: [],
      expiry: null,
      file: null
    },
    editing: false,
    existingFile: { name: null, url: null },
    saving: false
  }),
  computed: {
    ...mapGetters('certificates', ['certificateTypes']),
    ...mapState('settings', ['sportInterests']),
    disabled () {
      return (
        (!this.$auth.isBusiness() || !this.certificate.expiry) &&
        !this.certificate.file &&
        !this.existingFile.url
      )
    },
    pendingCertificate () {
      return (
        this.$auth.isBusiness() &&
        this.certificateTypes()[this.certType]?.pendingCertificate
      )
    },
    subTypes () {
      return ['idCard', 'passport', 'drivingLicense', 'fiscalCard'].map(
        value => ({
          name: this.$t(`certificates.subtype.${value}`),
          value
        })
      )
    }
  },
  methods: {
    clearFile () {
      this.certificate.file = null
      this.existingFile = { name: null, url: null }
    },
    hide () {
      Object.assign(this.$data, this.$options.data())
      this.$refs.modal.hide()
    },
    resetCertificate () {
      this.certificate = {
        competitive: false,
        subtype: null,
        sports: [],
        expiry: null,
        file: null
      }
      this.clearFile()
    },
    show (certificate = null) {
      this.editing = !!certificate
      certificate = certificate || this.pendingCertificate
      if (certificate) {
        this.certificate = this.$utils.clone({
          ...certificate,
          expiry: certificate.dates.expiry,
          competitive: certificate.subtype === 'competitive',
          file: null
        })
        this.existingFile = {
          name: certificate.file.filename,
          url: this.$utils.getFileUrl(
            certificate.file.id,
            certificate.file.filename
          )
        }
      }
      this.$refs.modal.show()
    },
    async submit () {
      this.saving = true
      const certificate = await this.$repos.certificatesRepo.save({
        id: !this.certificate._id ? undefined : this.certificate._id,
        type: this.certType,
        subtype: !['medical', 'identity'].includes(this.certType)
          ? undefined
          : this.certificate.subtype
            ? this.certificate.subtype
            : this.certificate.competitive
              ? 'competitive'
              : 'nonCompetitive',
        sports:
          this.certificate.sports?.length < 1
            ? undefined
            : this.certificate.sports,
        expiry: !this.certificate.expiry
          ? undefined
          : Number(this.$dayjs(this.certificate.expiry).format('YYYYMMDD')),
        fileName: !this.certificate.file
          ? undefined
          : this.certificate.file.name,
        file: !this.certificate.file
          ? undefined
          : await this.$utils
            .readFile(this.certificate.file, 'base64')
            .then(base64File => base64File.split(',')[1]),
        name: this.certificate.name
          ? this.certificate.name
          : !this.certificate.file
            ? undefined
            : this.certificate.file.name,
        profileId: this.$auth.isUser() ? this.$auth.user._id : this.profile._id,
        ownerId: this.$auth.isBusiness() ? this.$auth.user._id : undefined,
        createdBy: this.$auth.user._id
      })
      if (this.$auth.isBusiness()) {
        await this.$repos.certificatesRepo.approveOrDisapprove(
          { id: certificate._id, ownerId: this.$auth.user._id },
          'approve'
        )
      }
      this.saving = false
      this.content = null
      this.$notifier.success('Document Saved')
      this.$emit('saved')
      this.hide()
    }
  }
}
</script>
