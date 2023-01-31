import Vue from 'vue'

Vue.prototype.$inputFile = (opts = {}) => {
  const { multiple = false, accept = '*', base64 = false } = opts

  const $input = _getOrCreateInputFileElement()

  $input.setAttribute('accept', accept)

  if (multiple) {
    $input.setAttribute('multiple', 'multiple')
  } else {
    $input.removeAttribute('multiple')
  }

  return new Promise((resolve, reject) => {
    $input.onchange = function (event) {
      const files = Array.from(event.target.files)
      event.target.value = null
      const output = multiple ? files : files[0]
      resolve(output && base64 ? readAsDataURL(output) : output)
    }

    $input.click()
  })
}

function _getOrCreateInputFileElement () {
  let input = document.querySelector('body > #file-input-plugin')

  if (!input) {
    input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('id', 'file-input-plugin')
    input.style.display = 'none'
    document.body.appendChild(input)
  }

  return input
}

Vue.prototype.$readAsDataURL = readAsDataURL

function readAsDataURL (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}
