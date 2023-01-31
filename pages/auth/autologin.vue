<template>
  <div />
</template>

<script>
export default {
  auth: 'guest',
  async middleware ({ route, $auth, $axios, redirect }) {
    if (!route.query.token) {
      return redirect('/')
    }

    await $axios
      .post('/api/auth/profile/auto-login/token', { cwtoken: route.query.token })
      .then(res => $auth.login({ token: res.data.auth.cwtoken }))
      .catch(() => {})
  }
}
</script>
