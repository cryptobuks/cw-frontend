export default {
  computed: {
    fields () {
      const extracted = this.$utils.extract(this.profile, this.fieldsOpts)

      if (extracted.address && this.profile?.operativeAddresses?.length) {
        extracted.address.push(
          ...this.profile.operativeAddresses.map(a => a.fulladdress)
        )
      }

      return this.fieldsOpts
        .filter(
          f =>
            this.allowed(`user.info.${f.from}`) || this.viewingSelf(this.$auth)
        )
        .map(f => ({ label: f.label, value: extracted[f.from] }))
        .filter(f => (Array.isArray(f.value) ? f.value[0] : f.value))
    },
    fieldsOpts () {
      return [
        { label: 'Name', from: 'name' },
        { label: 'Brand', from: 'brand' },
        {
          label: 'VAT ID',
          from: 'vat',
          transform: vat => vat && vat.countryCode + vat.value
        },
        {
          label: 'FISCAL ID',
          from: 'fiscal',
          transform: fiscal => fiscal?.value
        },
        {
          label: 'Address',
          from: 'address',
          transform: addr => [addr?.fulladdress].filter(Boolean)
        },
        { label: 'Legal Email address', from: 'pec' },
        { label: 'eMails', from: 'emails' },
        {
          label: 'Mobile Phones',
          from: 'mobiles',
          transform: mobiles =>
            mobiles.map(m => m.prefixNumber + ' ' + m.phoneNumber)
        },
        {
          label: 'Landline Phones',
          from: 'landlines',
          transform: landlines =>
            landlines.map(m => m.prefixNumber + ' ' + m.phoneNumber)
        },
        {
          label: 'Pins',
          from: 'pins',
          transform: pins => pins.map(pin => pin.value)
        },
        { label: 'Gender', from: 'gender' },
        {
          label: 'Date of Birth',
          from: 'dob',
          transform: (d) => {
            return this.$dayjs(d).format('DD/MM/YYYY')
          }
        },
        { label: 'Place of Birth', from: 'pob' },
        { label: 'Notes', from: 'notes' },
        // { label: "Sport Interests", from: "sportInterests" },
        { label: 'Billing Unique Code', from: 'sdi' },
        {
          label: 'Balance sheet start date',
          from: 'balanceStartDate',
          transform: d =>
            d instanceof Date && !isNaN(d)
              ? d.getDate() + '-' + (d.getMonth() + 1)
              : null
        },
        {
          label: 'Sport Intersts',
          from: 'sportInterests',
          transform: sIds =>
            sIds.map(
              id => (this.sportInterests || []).find(sI => sI._id === id)?.name
            )
        },
        {
          label: 'Tins',
          from: 'tins',
          transform: tins => tins.map(tin => tin.value)
        }
      ]
    }
  }
}
