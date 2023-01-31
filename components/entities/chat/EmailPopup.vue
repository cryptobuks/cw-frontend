<template>
  <base-transition name="fade" :active="active">
    <div
      class="fixed flex justify-center items-center inset-0 bg-black bg-opacity-50"
      style="z-index: 1000"
    >
      <div v-click-away="hide" class="popup-wrapper ">
        <header class="relative border-b border-black border-opacity-25 pb-1">
          <span class="dismiss" @click="hide">
            <base-icon name="dismiss" size="12" />
          </span>
          <div>
            <div class="font-poppins-bold">
              {{ source.content.subject }}
            </div>
            <div v-if="source.content.from" class="flex items-top">
              <span class="font-bold">From:</span>
              <span class="ml-1"> {{ source.content.from }}</span>
            </div>
            <div v-if="source.content.to && source.content.to.length>1" class="flex items-top">
              <span class="font-bold">To:</span>
              <!-- temp remove comma -->
              <span class="ml-1"> {{ source.content.to.map(e=>e.replace(',','')).join(', ') }}</span>
            </div>

            <div v-if="source.content.cc && source.content.cc.length" class="flex items-top">
              <span class="font-bold">Cc:</span>
              <!-- temp remove comma -->
              <span class="ml-1"> {{ source.content.cc.map(e=>e.replace(',','')).join(', ') }}</span>
            </div>

            <div v-if="source.content.from " class="flex items-top">
              <span class="font-bold">Date:</span>
              <span class="ml-1">{{ timestamp }}</span>
            </div>

            <!-- <div class="flex justify-between mt-2">
              <div>
                <span class="font-poppins-bold">From:</span>
                <span class="text-black text-opacity-50">{{ source.content.from }}</span>
              </div>
              <div class="text-black text-opacity-50">
                {{ timestamp }}
              </div>
            </div> -->
          </div>
        </header>

        <main class="flex-1 mt-5">
          <!-- iframe -->
          <iframe ref="html" :srcdoc="html" class="w-full h-full" />
        </main>
      </div>
    </div>
  </base-transition>
</template>

<script>
export default {
  model: {
    prop: 'active',
    event: 'active-change'
  },
  props: {
    active: { type: Boolean, default: false },
    source: { type: Object, default: () => { return {} } }
  },
  computed: {
    timestamp () {
      return `${this.$utils.formatDate(this.source.createdAt)} ${this.$utils.formatTime(this.source.createdAt)}`
    },
    html () {
      return this.base64Decode(this.source?.content?.html) || ''
    }
  },

  mounted () {

  },
  methods: {
    hide () {
      this.$emit('active-change', false)
    },
    base64Decode (rawContent) {
      if (!rawContent) {
        return ''
      }
      rawContent = rawContent.replace(/_/g, '/').replace(/-/g, '+')
      let ret = ''
      try {
        ret = decodeURIComponent(atob(rawContent).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        const parser = new DOMParser()
        const doc = parser.parseFromString(ret, 'text/html')
        const style = document.createElement('style')
        style.textContent = 'body,html{scrollbar-color:#4a4a4a #e2e2e2}::-webkit-scrollbar{width:10px;height:10px;}::-webkit-scrollbar-track{background:#e2e2e2}::-webkit-scrollbar-thumb{background:#a0a0a0;border-radius:3px;width:8px}::-webkit-scrollbar-thumb:hover{background:#4a4a4a}'
        doc.head.appendChild(style)
        ret = doc.documentElement.outerHTML
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error decode email content', error)
      }
      return ret
    }
  }
}
</script>

<style lang="postcss">

.popup-wrapper {
  width: 90vw;
  height: 80vh;
  @apply flex flex-col bg-white text-black overflow-hidden max-w-screen-md text-base p-4 pointer-events-auto rounded-6px;
}

.dismiss {
  right: 5px;
  cursor: pointer;
  line-height: 1;
  @apply text-gray-600 inline-block absolute top-0 transition-colors duration-300 cursor-pointer;

  &:hover {
    @apply text-gray-800;
  }
}
</style>
