<template>
  <div
    class="flex"
    :class="[
      certificate.status === 'expired' ? 'text-cw-red' : 'text-gray-600',
    ]"
  >
    <base-icon name="document" size="14" class="mr-2" />
    <span class="text-xs uppercase">
      {{
        certificate.type === "enable"
          ? $t("certificates.detail.release_date")
          : $t("certificates.detail.expires")
      }}
      {{ $dayjs(certificate.dates.expiry).format("DD.MM.YYYY") }}
    </span>
  </div>
</template>

<script>
export default {
  props: { certificate: { type: Object, required: true } }
}
</script>
