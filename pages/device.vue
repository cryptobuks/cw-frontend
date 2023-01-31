<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: 'auth',
  async middleware ({ $pwa, route, $auth, $repos, redirect }) {
    await $pwa.serviceWorkerReady()

    if (!$pwa.isStandalone) {
      if (!route.path.startsWith('/device/install')) {
        return redirect('/device/install' + location.search)
      }

      return
    }

    const gymId = route.query.gymId || $pwa.deviceInfo?.gymId
    const deviceId = route.query.deviceId || $pwa.deviceInfo?.id
    let deviceName = $pwa.deviceInfo?.name

    if (!$auth.isAuthenticated && gymId && deviceId) {
      const res = await $repos.gymDeviceRepo.login({ deviceId, gymId })
      if (res.success) {
        // Need to set device info before auth login so login could use the right api for gym device
        $pwa.setDeviceInfo({ id: deviceId, gymId })
        await $auth.login({ user: res.data, token: res.auth.cwtoken })
        deviceName = res.data?.company?.devices?.[0]?.name
      }
    }

    $pwa.setDeviceInfo(gymId && deviceId ? {
      id: deviceId,
      name: deviceName,
      gymId
    } : null)

    if (!$pwa.deviceInfo && route.path.length > '/device/'.length) {
      return redirect('/device' + location.search)
    }
  },
  head () {
    return {
      link: [
        { hid: 'manifest', rel: 'manifest', href: '/device-manifest.json' + location.search }
      ]
    }
  }
}
</script>
