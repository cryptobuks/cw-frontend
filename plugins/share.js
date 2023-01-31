import Vue from 'vue'
import CopyModal from '@/components/global/CopyModal'

export default function (ctx, inject) {
  let copyModal = null

  const Component = Vue.extend({
    ...CopyModal,
    ...ctx,
    methods: { ...CopyModal.methods, $t: key => ctx.app.i18n.t(key) }
  })

  inject('share', async (data = {}) => {
    try {
      let isSupported = navigator && 'canShare' in navigator

      if (!isSupported) {
        throw new Error('browser not supported')
      }

      if (data.files && navigator.canShare) {
        isSupported = navigator.canShare({ files: data.files })
      }

      if (!isSupported) {
        throw new Error('file sharing not supported')
      }

      return await navigator.share(data)
    } catch (error) {
      if (!copyModal) {
        copyModal = new Component().$mount()
        document.body.appendChild(copyModal.$el)
      }
      return copyModal.show(`${data.title}\n ${data.text}\n${data.url}`)
    }
  })
}
