<template>
  <transition @after-leave="afterLeave">
    <div v-if="showModal" class="actionsheet-overlay" @click="deactivate">
      <div class="actionsheet">
        <div v-for="(group, groupIndex) in groups" :key="groupIndex" class="actionsheet-group">
          <div v-for="(button, index) in group" :key="index" class="flex items-center" :class="{'actionsheet-label': button.label, 'actionsheet-button': !button.label, 'actionsheet-button-color': button.color, 'actionsheet-button-bold': button.bold, 'actionsheet-button-disable': button.disable, 'actionsheet-button-center': button.center}" @click.stop.prevent="onClick(button, index, groupIndex)">
            <base-icon v-if="button.icon" :name="button.icon" class="actionsheet-button-icon mr-2" />
            {{ button.text }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
const defer = () => {
  let _resolve
  let _reject

  const promise = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  return {
    promise,
    resolve: _resolve,
    reject: _reject
  }
}

export default {
  props: {
    buttons: {
      type: Array,
      default: null
    }
  },

  data () {
    return {
      showModal: false
    }
  },

  computed: {
    groups () {
      if (!this.buttons) {
        return []
      }

      return this.buttons.map(function (group) {
        if (Object.prototype.toString.call(group) === '[object Object]') {
          return [group]
        } else {
          return group
        }
      })
    }
  },

  methods: {
    activate () {
      this._deferred = defer()
      this.showModal = true
      return this._deferred.promise
    },

    deactivate () {
      this.showModal = false
      this._deferred.reject()
    },

    onClick (button, selectedIndex, selectedGroupIndex) {
      if (button.disable || button.label) {
        return
      }

      if (button.handle) {
        button.handle({ button, selectedIndex, selectedGroupIndex })
      }

      this._deferred.resolve({ button, selectedIndex, selectedGroupIndex })
      this.showModal = false
    },

    afterLeave () {
      this.$destroy()
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>

<style>
.actionsheet-overlay{
  font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
  font-size: 14px;
  line-height: 1.4;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10600;

  @apply bg-black bg-opacity-40 text-black;
}
.actionsheet-overlay.v-enter{
  opacity: 0;
}
.actionsheet-overlay.v-enter-active{
  transition: opacity .4s;
}
.actionsheet-overlay.v-leave-active{
  opacity: 0;
  transition: opacity .4s;
}
.actionsheet-overlay *{
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.actionsheet{
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 11000;
  width: 100%;
  transform: translate3d(0,0,0);
}
.actionsheet-overlay.v-enter .actionsheet{
  transform: translate3d(0,100%,0);
}
.actionsheet-overlay.v-enter-active .actionsheet{
  transition: transform .3s;
}
.actionsheet-overlay.v-leave-active .actionsheet{
  transform: translate3d(0,100%,0);
  transition: transform .4s;
}

.actionsheet-group{
  margin: 8px;
}
.actionsheet-button, .actionsheet-label {
  width: 100%;
  font-weight: 400;
  margin: 0;
  background: rgba(243,243,243,.95);
  box-sizing: border-box;
  display: flex;
  position: relative;
  padding: 0 1rem;
}
.actionsheet-button-center {
  text-align: center;
}
.actionsheet-button:after, .actionsheet-label:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: auto;
  top: auto;
  height: 1px;
  width: 100%;
  display: flex;
  z-index: 15;
  -webkit-transform-origin: 50% 100%;
      -ms-transform-origin: 50% 100%;
          transform-origin: 50% 100%;

  @apply bg-gray-300;
}
.actionsheet-label {
  font-size: 13px;
  line-height: 1.3;
  min-height: 44px;
  padding: 8px 10px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
      -ms-flex-pack: center;
          justify-content: center;
  -webkit-box-align: center;
  -webkit-align-items: center;
      -ms-flex-align: center;
          align-items: center;

  @apply text-gray-600;
}
.actionsheet-button {
  cursor: pointer;
  line-height: 43px;
  font-size: 20px;
  color: #007aff;
}
.actionsheet-button.actionsheet-button-color, .actionsheet-label.actionsheet-button-color{
  color: #ff3b30;
}
.actionsheet-button.actionsheet-button-bold, .actionsheet-label.actionsheet-button-bold{
  font-weight: bold;
}
.actionsheet-button.actionsheet-button-disable, .actionsheet-label.actionsheet-button-disable{
  /*opacity: 0.95;*/
  color: #8e8e93;
}
.actionsheet-button:first-child, .actionsheet-label:first-child {
  border-radius: .5rem .5rem 0 0;
}
.actionsheet-button:last-child, .actionsheet-label:last-child {
  border-radius: 0 0 .5rem .5rem;
}
.actionsheet-button:last-child:after, .actionsheet-label:last-child:after{
  display: none;
}
.actionsheet-button:first-child:last-child, .actionsheet-label:first-child:last-child {
  border-radius: .5rem;
}
</style>
