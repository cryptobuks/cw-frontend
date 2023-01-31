import _ from 'lodash'

export default {
  computed: {
    currencySymbol () {
      return this.modul.country.currency.symbol
    },
    discounts () {
      const discounts = _.cloneDeep(this.modul.modules?.discounts || [])
      discounts.sort((a, b) => b.endDt - a.endDt)
      return discounts.map(discount => ({
        ...discount,
        dates: {
          startDt: this.$utils.digitToDate(discount.startDt),
          endDt: this.$utils.digitToDate(discount.endDt)
        }
      }))
    }
  },
  methods: {
    async activateModule () {
      await this.$repos.contractsRepo.createGymModule(this.profile._id, {
        area: this.modul.name,
        isActive: true,
        paidByGroup: this.modul.modules?.paidByGroup,
        discount: this.modul?.modules?.discount
      })
      this.$notifier.success('')
    },
    confirmChange (activate) {
      this.$confirm(
        `${this.$t(`global.${!activate ? 'de' : ''}activate`)} ${
          this.modul.label
        }`,
        () => this.activateModule(activate)
      )
    },
    discounted (price, discount) {
      discount = discount ? discount.discount : this.discounts[0]?.discount
      return Number(price) - Number(price) * (Number(discount || 0) / 100)
    }
  }
}
