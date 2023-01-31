<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    @add-item="showModal"
  >
    <base-swipe-card
      v-if="courses.length || lessons.length"
      bg-color="#262626"
      hide-remove
      auto-height
      toggler-class="-mr-2 -mt-2"
      body-class="pr-3"
      class="mt-2"
      @edit="showModal"
    >
      <div v-if="courses.length" class="mb-4">
        <div class="mb-1">
          {{ $t('authorized_sports.card.courses') }}
        </div>

        <div class="-m-1 flex flex-wrap">
          <base-chip
            v-for="(sport, i) in coursesWithName"
            :key="sport.id"
            dismissible
            class="m-1"
            @dismiss="courses.splice(i, 1)"
          >
            {{ sport.name }}
          </base-chip>
        </div>
      </div>

      <div v-if="lessons.length">
        <div class="mb-1">
          {{ $t('authorized_sports.card.lessons') }}
        </div>

        <div class="-m-1 flex flex-wrap">
          <base-chip
            v-for="(sport, i) in lessonsWithName"
            :key="sport.id"
            dismissible
            class="m-1"
            @dismiss="lessons.splice(i, 1)"
          >
            {{ sport.name }}
          </base-chip>
        </div>
      </div>
    </base-swipe-card>

    <base-modal
      v-if="profile"
      ref="modal"
      :title="$t('authorized_sports.modal.title') + ' ' + $t('roles.' + role) + ' ' + profile.displayName"
      @done="onModalDone"
    >
      <cw-input-sport-interests
        v-model="draft.courses"
        :label="$t('authorized_sports.courses.label')"
        :placeholder="$t('authorized_sports.courses.placeholder')"
      />

      <cw-input-sport-interests
        v-model="draft.lessons"
        :label="$t('authorized_sports.lessons.label')"
        :placeholder="$t('authorized_sports.lessons.placeholder')"
      />
    </base-modal>
  </cw-input-subflow-wrapper>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    profile: { type: Object, required: true },
    gymId: { type: String, required: true },
    role: { type: String, required: true }
  },
  data () {
    return {
      courses: [],
      lessons: [],

      draft: {
        courses: [],
        lessons: []
      }
    }
  },
  computed: {
    ...mapState('settings', ['sportInterests']),

    coursesWithName () {
      return this.courses.map(sportId => this.sportInterests.find(s => s._id === sportId)).filter(Boolean) || []
    },

    lessonsWithName () {
      return this.lessons.map(sportId => this.sportInterests.find(s => s._id === sportId)).filter(Boolean) || []
    }
  },
  watch: {
    gymId: {
      immediate: true,
      handler: 'reset'
    },
    profile: 'reset'
  },
  created () {
    this.$store.dispatch('settings/getSportInterests')
  },
  methods: {
    showModal () {
      this.draft = {
        courses: [...this.courses] || [],
        lessons: [...this.lessons] || []
      }

      this.$refs.modal.show()
    },

    async reset () {
      if (!this.gymId || !this.profile) {
        this.courses = []
        this.lessons = []
        return
      }

      await this.$repos.profileRepo.authorizedSport
        .get({ ownerId: this.gymId, profileId: this.profile._id })
        .then((res) => {
          this.courses = res?.course || []
          this.lessons = res?.private || []
        })
    },

    onModalDone () {
      if (this.$utils.isModified(this.courses, this.draft.courses)) {
        this.$repos.profileRepo.authorizedSport.mutateCourses({
          interestIds: this.draft.courses,
          ownerId: this.gymId,
          profileId: this.profile._id
        })
      }
      if (this.$utils.isModified(this.lessons, this.draft.lessons)) {
        this.$repos.profileRepo.authorizedSport.mutatePrivateLessons({
          interestIds: this.draft.lessons,
          ownerId: this.gymId,
          profileId: this.profile._id
        })
      }
      this.courses = this.draft.courses
      this.lessons = this.draft.lessons
      this.$refs.modal.hide()
    }
  }
}
</script>
