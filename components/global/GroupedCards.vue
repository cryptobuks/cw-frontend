<template>
  <div ref="card" v-bind="$attrs" class="relative">
    <div
      v-for="(item, index) in slotData"
      :key="index"
      class="card w-full"
      @click.stop="groupCard(index)"
    >
      <cw-card-message
        v-if="item.type === 'message'"
        :message="item"
        :style="{
          cursor: item.type === 'message' ? 'pointer !important' : 'auto',
        }"
      />
      <cw-card-profile
        v-else-if="item.type === 'profile'"
        :profile="item"
        :style="{
          cursor: item.type === 'profile' ? 'pointer !important' : 'auto',
        }"
        @deleteCard="deleteCard"
      />
      <cw-card-certificate
        v-else-if="item.type === 'certificate'"
        :certificate="item"
        :style="{
          cursor: item.type === 'profile' ? 'pointer !important' : 'auto',
        }"
        @deleteCard="deleteCard"
      />
      <cw-card-default
        v-else
        :card-data="item"
        style="cursor: pointer !important"
        @deleteCard="deleteCard"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    slotData: {
      type: Array, // set to null if you're not passing an object here
      default: () => [],
      required: true
    }
  },
  data () {
    return {
      cards: [],
      message: {}
    }
  },
  computed: {
    profile (profileId) {
      if (!profileId) {
        return null
      }
      return this.$store.getters['chat/getFriend'](profileId)
    }
  },
  updated () {
    this.$nextTick(() => {
      this.assignClass()
    })
  },
  mounted () {
    this.assignClass()
  },
  methods: {
    groupCard (index) {
      const filteredCards = this.cards.filter((item) => {
        return item.classList.contains('card--current')
      })[0]
      let next
      let current = filteredCards
      let nextElementIndex, currentElementIndex
      if (current !== this.cards[index]) {
        if (this.cards[index].classList.contains('card--out')) {
          nextElementIndex = this.cards.findIndex((item) => {
            return item.classList.contains('card--next')
          })
          currentElementIndex = this.cards.findIndex((item) => {
            return item.classList.contains('card--current')
          })
          this.removeAllClass()
          this.cards[currentElementIndex].classList.add('card--out')
          this.cards[nextElementIndex].classList.add('card--current')
          current = this.cards[nextElementIndex]
        } else {
          this.removeAllClass()
          current?.classList.add('card--out')
          this.cards[index].classList.add('card--current')
          current = this.cards[index]
        }
        if (nextElementIndex !== undefined) {
          next = this.cards[nextElementIndex + 1]
        } else {
          next = this.cards[index + 1]
        }
        next = next || this.cards[0]
        next.classList.add('card--next')
      } else if (this.slotData[index].type === 'message') {
        this.$router.push(`/chat/?idMessage=${this.slotData[index]._id}`)
      }
    },
    removeAllClass () {
      this.cards.forEach((item) => {
        item.classList.remove(
          'card--current',
          'card--out',
          'card--next',
          'card--up',
          'notransition'
        )
      })
    },
    assignClass () {
      const card = this.$refs.card
      this.cards = Array.from(card?.children)
      if (this.cards.length === 1) {
        this.cards[0].classList.add('card--up')
        this.cards[0].classList.add('card--current')
      } else {
        this.removeAllClass()
        this.cards[0]?.classList.add('card--current')
        this.cards[1]?.classList.add('card--next')
        this.cards[this.cards.length - 1]?.classList.add('card--out')
        this.cards[this.cards.length - 1]?.classList.add('notransition')
      }
    },
    async deleteCard (payload) {
      await this.$repos.profileRepo.deleteCard(payload).then((res) => {
        if (res.success) {
          this.$notifier.success('removed successfully')
        }
      })
    }
  }
}
</script>
<style scoped>
.cards {
  /* position: relative; */
  /* display: table-row; */
  list-style-type: none;
  padding: 0;
  width: 34em;
  margin: 100px auto 0;
}

.card {
  /* display: table-row; */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;

  border-radius: 10px;
  /* padding: 40px; */
  //box-shadow: 0 0 40px #000;
  transform: translateY(0) rotate(0deg) translateX(0px) scale(1);
  transform-origin: 0 0;

  transition: transform 0.6s cubic-bezier(0.8, 0.2, 0.1, 0.8) 0.1s,
    background 0.4s linear;

  cursor: pointer;
  user-select: none;

  :last-child {
    margin-bottom: 0;
  }

  @apply bg-gray-400;
}

.card--next {
  z-index: 5;
  transform: translateY(-10px) rotate(0deg) translateX(2.5%) scale(0.95);
  /* min-height: 100px; */
}

.card--out {
  animation: card-out 0.6s cubic-bezier(0.8, 0.2, 0.1, 0.8);
  transform: translateY(-20px) rotate(0deg) translateX(5%) scale(0.9);
  z-index: 1;
  /* min-height: 100px; */

  @apply bg-gray-400;
}

.card--up {
  transform: translateY(-20px) !important;
}

@keyframes card-out {
  0% {
    z-index: 10000;
    transform: translateY(0px) rotate(-4deg);
  }
  50% {
    z-index: 10000;
    transform: translateY(-120px) rotate(-5deg) translateX(-10px);
  }
  80% {
    z-index: 1;
  }
  100% {
    transform: translateY(-50px) rotate(8deg) translateX(55px) scale(0.95);
  }
}

.card--current {
  cursor: pointer;
  user-select: auto;
  position: relative;
  z-index: 10;
  opacity: 1;
  transform: rotate(0deg) translateX(0%) scale(1);

  @apply bg-gray-200;
}

.notransition {
  -webkit-transition: none !important;
  -moz-transition: none !important;
  -o-transition: none !important;
  transition: none !important;
  animation: none !important;
}
</style>
