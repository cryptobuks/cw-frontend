import Vue from 'vue'
import ActionSheetDefine from '@/components/global/ActionSheet.vue'

function install () {
  const ActionSheetComponent = Vue.extend(ActionSheetDefine)

  Vue.prototype.$actionSheet = function (...buttons) {
    const instance = new ActionSheetComponent({ propsData: { buttons } })

    const mount = document.createElement('div')
    mount.id = 'ios-actionsheet-' + Date.now()
    document.body.appendChild(mount)

    instance.$mount(mount)

    return instance.activate()
  }
}

Vue.use(install)

export default install
