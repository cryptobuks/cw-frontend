<template>
  <component
    :is="serviceType"
    v-if="loaded"
    ref="modal"
    device-action="CREATE_NEW_RENTABLE_OR_COURSE"
    v-bind="switching ? { noAnimate: true } : {}"
    @hidden="onHidden"
    @hook:mounted="onModalMounted"
    @hook:beforeDestroy="onModalUnmounted"
  >
    <template #top>
      <div>
        <base-select
          v-model="serviceType"
          v-bind="{
            clearable: false,
            hideSelected: true,
            items: serviceTypes,
            itemText: 'name',
            itemValue: 'value',
            label: $t('rentable.service_type.label'),
            placeholder: $t('rentable.service_type.label'),
            required: true,
            searchable: true,
            sortByText: true,
            tooltip: $t('rentable.service_type.tooltip'),
          }"
          @input="changeModal"
        />
      </div>
    </template>
  </component>
</template>

<script>
export default {
  components: {
    course: () =>
      import('@/components/entities/calendar/courses/modals/CourseModal'),
    rentable: () => import('@/components/entities/calendar/RentableModal')
  },
  data () {
    return {
      loaded: false,
      resolve: null,
      serviceType: 'course',
      switching: false,
      waitForModalMount: null
    }
  },
  computed: {
    serviceTypes () {
      return [
        { name: this.$t('rentable.service_type.rentable'), value: 'rentable' },
        { name: this.$t('rentable.service_type.course'), value: 'course' }
      ]
    }
  },
  created () {
    this.onModalUnmounted()
  },
  methods: {
    show () {
      this.loaded = true

      setTimeout(async () => {
        this.waitForModalMount && (await this.waitForModalMount)
        this.$refs.modal?.show?.()
      })
    },

    hide (...params) {
      this.$refs.modal?.hide?.(...params)
    },

    changeModal () {
      this.switching = true

      setTimeout(async () => {
        this.waitForModalMount && (await this.waitForModalMount)
        this.$refs.modal?.show?.()

        this.switching = false
      })
    },

    onHidden () {
      this.$nextTick(() => !this.switching && this.$emit('hidden'))
    },

    onModalMounted () {
      this.resolve?.()
    },

    onModalUnmounted () {
      this.waitForModalMount = new Promise((resolve, reject) => {
        this.resolve = resolve
      })
    }
  }
}
</script>
