<template>
  <div class="page-login px-4 py-12">
    <header class="page-login__header">
      <h1 class="page-login__title">
        {{ $t("singin.title", { gymName: "Your GYM" }) }}
      </h1>
      <p class="page-login__subtitle">
        {{ $t("signin.sub_title") }}
      </p>
    </header>

    <main class="page-login__body">
      <base-form v-slot="{ rules }" @submit="submit">
        <div class="page-login__fields">
          <base-input-text
            id="input-user"
            ref="identifier"
            v-model.trim="cred.identifier"
            :tooltip="$t('signin.user_id_tooltip')"
            :label="$t('signin.user_id_label')"
            :placeholder="$t('signin.user_id_placeholder')"
            autocomplete="yes"
            :rules="[rules.required]"
            no-validate-on-blur
            class="mb-6"
            @focus="errorMsg = null"
          />

          <cw-input-password
            id="input-password"
            v-model.trim="cred.password"
            :label="$t('signin.password_label')"
            :tooltip="$t('signin.password_tooltip')"
            no-validate-on-blur
            autocomplete="yes"
            class="mb-6"
            @focus="errorMsg = null"
          />

          <p v-if="errorMsg" class="-my-3 text-cw-red">
            {{ errorMsg }}
          </p>

          <cw-forgot-password-modal
            class="page-login__forgot inline-block mt-8 mb-15"
          >
            <span>
              {{ $t("signin.forgot_password") }}
            </span>
          </cw-forgot-password-modal>
        </div>

        <div class="page-login__actions">
          <cw-register-modal>
            <base-button
              v-tippy="$t('signin.signup_tooltip')"
              type="button"
              inline
              xl
              class="page-login__register-btn"
            >
              <base-icon name="person" />
            </base-button>
          </cw-register-modal>

          <base-button
            id="button-submit"
            type="submit"
            :disabled="!cred.identifier || !cred.password"
            :loading="submitting"
            xl
            class="page-login__login-btn"
          >
            {{ $t("signin.submit") }}
          </base-button>
        </div>
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
      cred: {
        identifier: '',
        password: ''
      },

      errorMsg: null,
      submitting: false
    }
  },

  methods: {
    async submit () {
      this.errorMsg = null
      this.submitting = true
      await this.$repos.authRepo
        .login({
          userName: this.cred.identifier,
          password: window.btoa(this.cred.password),
          language: this.userLanguageAvailable()
            ? window?.navigator?.language.substr(0, 2)
            : 'en'
        })
        .then(async (res) => {
          if (res.success) {
            await this.$auth.login({ user: res.data, token: res.auth.cwtoken })
            this.$nuxt.$emit('chat:load')
            const iframe = document.querySelector('iframe[name=cowellness]')
            iframe && iframe.remove()
          } else {
            this.errorMsg = res.message || 'Something went wrong'
          }
        })
      this.submitting = false
    },
    userLanguageAvailable () {
      const availableLanguages = ['en', 'it', 'es']
      const userLanguage = window?.navigator?.language.substr(0, 2)
      return availableLanguages.includes(userLanguage)
    }
  },
  head () {
    const chatPlugin = {
      local:
        'http://localhost.dev.cowellness.net:8080/chat-plugin/install.js?id=5fe4655ac123b10011000000&lang=it',
      dev:
        'https://dev.cowellness.net/chat-plugin/install.js?id=5fe4655ac123b10011000000&lang=auto',
      staging:
        'https://staging.cowellness.net/chat-plugin/install.js?id=5fe4655ac123b10011000000&lang=auto',
      production:
        'https://www.cowellness.net/chat-plugin/install.js?id=5fe4655ac123b10011000000&lang=auto'
    }

    return {
      title: this.$t('pages.login'),
      script: [
        {
          src: chatPlugin[this.$utils.environment],
          id: 'cowellness',
          environment: this.$utils.environment
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.page-login {
  max-height: 100%;
  overflow: hidden;
  text-align: center;
  color: #fff;

  &__header {
    margin-bottom: 80px;
  }

  &__title {
    font-size: 40px;
  }

  &__subtitle {
    @apply text-gray-400;
  }

  &__fields {
    width: 500px;
    max-width: 100%;
    margin: 0 auto;
  }

  &__forgot {
    span {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &__actions {
    display: flex;
    margin: -20px auto;
    max-width: 580px;

    button {
      margin: 20px;
    }
  }

  &__register-btn {
    flex-shrink: 0;
  }

  &__login-btn {
    flex-grow: 1;
    text-transform: uppercase;

    &:disabled {
      cursor: pointer !important;
    }
  }
}

.is-mobile {
  .page-login {
    &__header {
      margin-bottom: 40px;
    }

    &__title {
      font-size: 32px;
    }

    &__forgot {
      margin: 32px 0;
    }

    &__actions {
      margin: -10px auto;

      button {
        margin: 10px;
      }
    }
  }
}
</style>
