<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col items-center bg-white h-profile-body',
      showBackButton: true,
      title: `${profile.brand || profile.name} ${$t('global.address')}`
    }"
    v-on="$listeners"
  >
    <base-google-map
      :address="profile.address && profile.address.fulladdress"
      class="h-full w-full"
    />

    <div class="fixed bottom-0 mx-4 pb-10">
      <div class="bg-white shadow-cw-card w-full py-3 px-6 rounded-lg">
        <div class="flex items-center">
          <img
            class="object-cover rounded-full h-6 w-6"
            src="~/assets/img/default-contact-avatar.svg"
            alt="Business Profile"
          >
          <span class="ml-4 text-sm"> {{ profile.brand || profile.name }}</span>
        </div>

        <div class="flex items-center mt-2">
          <base-icon name="map-pin" />

          <span class="ml-4 text-sm">{{
            profile.address && profile.address.fulladdress
          }}</span>
        </div>
      </div>
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } }
}
</script>
