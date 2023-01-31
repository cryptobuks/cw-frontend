<template>
  <div class="page-reset-pw px-4 py-12">
    <header v-if="!sent" class="page-reset-pw__header mb-16 md:mb-24 lg:mb-32">
      <h1 class="page-reset-pw__title">
        {{ $t('reset_pw.title') }}
      </h1>
    </header>

    <main>
      <base-form v-if="!sent" class="page-reset-pw__form" @submit="submit">
        <cw-input-password
          v-model.trim="password"
          :label="$t('reset_pw.password_label')"
          :tooltip="$t('reset_pw.password_tooltip')"
          :clearable="false"
          strict
          class="mb-16 md:mb-24 lg:mb-32"
        />

        <base-button
          type="submit"
          :disabled="!password"
          :loading="submitting"
          xl
          class="page-reset-pw__submit"
        >
          <base-icon name="reset-password" size="34" />
        </base-button>
      </base-form>
    </main>
  </div>
</template>

<script>
export default {
  layout: 'auth',
  auth: 'guest',
  data () {
    return {
      password: '',
      submitting: false,
      sent: false
    }
  },
  created () {
    const token = this.$route.query.token
    if (token) {
      return
    }

    this.$router.replace('/login', () => {
      this.$notifier.error(this.$t('reset_pw.invalid_token_msg'))
    })
  },
  methods: {
    async submit () {
      this.submitting = true
      await this.$repos.authRepo
        .setNewPassword({
          newPassword: window.btoa(this.password),
          token: this.$route.query.token
        })
        .then((res) => {
          if (res && res.success) {
            this.sent = true

            this.$notifier.success(this.$t('reset_pw.success_msg'), {
              timeout: 2000,
              position: 'center',
              progressBar: false,
              pauseOnHover: false
            })

            setTimeout(() => {
              this.$auth.login({ user: res.data, token: res.auth.cwtoken })
            }, 2000)
          }
        })
      this.submitting = false
    }
  },
  head () {
    return {
      title: this.$t('pages.reset_pw')
    }
  }
}
</script>

<style lang="scss">
.page-reset-pw {
  max-height: 100%;
  overflow: auto;
  text-align: center;
  color: #fff;

  &__title {
    font-size: 40px;
  }

  &__form {
    width: 500px;
    max-width: 100%;
    margin: 0 auto;
  }
}
</style>
