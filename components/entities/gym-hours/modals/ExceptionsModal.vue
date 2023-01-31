<template>
  <base-modal v-bind="{ ref: 'modal', title: $t('gym.open_hours.exceptions') }">
    <template #header>
      <div class="flex items-center justify-between w-full capitalize">
        <base-icon
          name="chevron-left"
          class="-ml-8 cursor-pointer"
          @click.prevent="$refs.modal.hide()"
        />
        <span>{{ $t("gym.open_hours.exceptions") }}</span>
        <base-icon
          name="add"
          class="-mr-8 cursor-pointer"
          size="14"
          @click.prevent="addException()"
        />
      </div>
    </template>
    <cw-gym-hours-exceptions
      v-bind="{ exceptions }"
      @edit="editException"
      @delete="deleteException"
    />
    <cw-exception-modal
      ref="exceptionModal"
      v-model="exceptions"
      @change="(exps) => setGymHours({ exceptions: exps })"
    />
  </base-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  data: () => ({ exceptions: [], exceptionsSet: false }),
  computed: {
    ...mapState('gym-hours', ['gymHours'])
  },
  watch: {
    gymHours: {
      immediate: true,
      deep: true,
      handler (gymHours) {
        if (!gymHours) {
          return
        }
        this.exceptions = this.$utils.clone(gymHours.exceptions)
      }
    }
  },
  methods: {
    ...mapActions('gym-hours', ['setGymHours']),
    addException () {
      this.show()
      this.$refs.exceptionModal?.show()
    },
    async deleteException (exception) {
      const exceptions = this.gymHours.exceptions.filter(
        e =>
          e.from !== exception.from ||
          e.to !== exception.to ||
          e.isClosed !== exception.isClosed
      )

      await this.setGymHours({ exceptions })
    },
    editException (exception) {
      this.show()
      this.$refs.exceptionModal?.show(exception)
    },
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>
