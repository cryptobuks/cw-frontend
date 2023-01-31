import axios from 'axios'

export default (ctx, locale) => {
  return axios
    .get('/api/settings/i18n/' + locale)
    .then(res => res.data.data.language.value)
    .catch(() => ({}))
}
