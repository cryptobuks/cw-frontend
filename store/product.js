
export const state = () => ({
  categories: [],
  colors: [],
  sizes: [],
  promotions: [],
  products: [],
  productTemplates: []
})

export const mutations = {
  SET_STATE (state, changes) {
    Object.entries(changes).forEach(([key, val]) => {
      if (key in state) {
        state[key] = val
      }
    })
  },

  UPDATE_PRODUCT (state, product) {
    const i = state.products.find(p => p._id === product._id)
    if (i === -1) {
      state.products.push(product)
    } else {
      state.products.splice(i, 1, product)
    }
  },

  DELETE_PRODUCT (state, id) {
    const i = state.products.findIndex(p => p._id === id)
    ~i && state.products.splice(i, 1)
  },

  UPDATE_PRODUCT_TEMPLATES (state, productTemplate) {
    const i = state.productTemplates.find(p => p._id === productTemplate._id)
    if (i === -1) {
      state.productTemplates.push(productTemplate)
    } else {
      state.productTemplates.splice(i, 1, productTemplate)
    }
  },

  DELETE_PRODUCT_TEMPLATE (state, id) {
    const i = state.productTemplates.findIndex(p => p._id === id)
    ~i && state.productTemplates.splice(i, 1)
  },

  SET_CATEGORY (state, categories) {
    state.categories = categories
  },
  SET_COLORS (state, colors) {
    state.colors = colors
  },
  SET_SIZES (state, sizes) {
    state.sizes = sizes
  },
  ADD_COLOR (state, color) {
    state.colors.push(color)
  },
  ADD_SIZE (state, size) {
    state.sizes.push(size)
  },
  ADD_CATEGORY (state, category) {
    state.categories.push(category)
  },
  UPDATE_COLOR (state, color) {
    const colorIndex = state.colors.findIndex((item) => {
      return item._id === color._id
    })
    if (colorIndex !== -1) {
      state.colors.splice(colorIndex, 1, color)
    } else if (color._id) {
      state.colors.push(color)
    }
  },
  UPDATE_SIZE (state, size) {
    const sizeIndex = state.sizes.findIndex((item) => {
      return item._id === size._id
    })
    if (sizeIndex !== -1) {
      state.sizes.splice(sizeIndex, 1, size)
    } else if (size._id) {
      state.sizes.push(size)
    }
  },
  UPDATE_CATEGORY (state, category) {
    const categoryIndex = state.categories.findIndex((item) => {
      return item._id === category._id
    })

    if (categoryIndex !== -1) {
      state.categories.splice(categoryIndex, 1, category)
    } else if (category._id) {
      state.categories.push(category)
    }
  },
  DELETE_COLOR (state, id) {
    state.colors = state.colors.filter(color => color._id !== id)
  },
  DELETE_SIZE (state, id) {
    state.sizes = state.sizes.filter(size => size._id !== id)
  },
  DELETE_CATEGORY (state, id) {
    state.categories = state.categories.filter(category => category._id !== id)
  },
  SET_PROMOTION (state, promotion) {
    state.promotions.push(promotion)
  },
  SET_PROMOTIONS (state, promotions) {
    state.promotions = promotions
  },
  UPDATE_PROMOTION (state, promotion) {
    const i = state.promotions.findIndex(p => p._id === promotion._id)
    if (i === -1) {
      state.promotions.push(promotion)
    } else {
      state.promotions.splice(i, 1, promotion)
    }
  },
  DELETE_PROMOTION (state, id) {
    state.promotions = state.promotions.filter(promotion => promotion._id !== id)
  }
}

export const actions = {
  async getProducts ({ commit }) {
    const products = await this.$repos.productRepo.getProducts()
    commit('SET_STATE', { products })
  },

  mutateProduct ({ commit }, product) {
    return this.$repos.productRepo.mutateProduct(product)
      .then((newProduct) => {
        commit('UPDATE_PRODUCT', newProduct)
      })
  },

  deleteProduct ({ commit }, id) {
    return this.$repos.productRepo.deleteProduct(id)
      .then(() => commit('DELETE_PRODUCT', id))
  },

  async getProductTemplates ({ commit }) {
    commit('SET_STATE', { productTemplates: await this.$repos.productRepo.getProductTemplates() })
  },

  async mutateProductTemplate ({ commit }, payload) {
    commit('UPDATE_PRODUCT_TEMPLATES', await this.$repos.productRepo.mutateProductTemplate(payload))
  },

  async deleteProductTemplate ({ commit }, id) {
    commit('DELETE_PRODUCT_TEMPLATE', id)
    await this.$repos.productRepo.deleteProductTemplate(id)
  },

  async getCategories ({ commit }) {
    const promise = await this.$repos.productRepo.getCategories()
    commit('SET_CATEGORY', promise.categories)
  },
  async getColors ({ commit }) {
    const promise = await this.$repos.productRepo.getColors()
    commit('SET_COLORS', promise.colors)
  },
  async getSizes ({ commit }) {
    const promise = await this.$repos.productRepo.getSizes()
    commit('SET_SIZES', promise.sizes)
  },
  saveColor ({ commit }, payload) {
    const promise = payload._id ? this.$repos.productRepo.updateColor({ colorId: payload._id, ...payload }) : this.$repos.productRepo.saveColor(payload)
    return promise.then((res) => {
      if (res.success) {
        commit(payload._id ? 'UPDATE_COLOR' : 'ADD_COLOR', res.data.color)
      }
      return res
    })
  },
  saveSizes ({ commit }, payload) {
    const promise = payload._id ? this.$repos.productRepo.updateSize({ sizeId: payload._id, ...payload }) : this.$repos.productRepo.saveSize(payload)
    return promise.then((res) => {
      if (res.success) {
        commit(payload._id ? 'UPDATE_SIZE' : 'ADD_SIZE', res.data.size)
      }
      return res
    })
  },
  saveCategory ({ commit }, payload) {
    const promise = payload._id ? this.$repos.productRepo.updateCategory({ categoryId: payload._id, ...payload }) : this.$repos.productRepo.saveCategory(payload)
    return promise.then((res) => {
      if (res.success) {
        if (payload?._id && payload.isHiddenForCw) {
          commit('DELETE_CATEGORY', payload._id)
        } else {
          commit(payload._id ? 'UPDATE_CATEGORY' : 'ADD_CATEGORY', res.data.category)
        }
      }
      return res
    })
  },
  deleteColor ({ commit }, payload) {
    const promise = this.$repos.productRepo.deleteColor(payload)
    return promise.then((res) => {
      if (res.success) {
        commit('DELETE_COLOR', payload.colorId)
      }
      return res
    })
  },
  deleteSize ({ commit }, payload) {
    const promise = this.$repos.productRepo.deleteSize(payload)
    return promise.then((res) => {
      if (res.success) {
        commit('DELETE_SIZE', payload.sizeId)
      }
      return res
    })
  },
  deleteCategory ({ commit }, payload) {
    const promise = this.$repos.productRepo.deleteCategory(payload)
    return promise.then((res) => {
      if (res.success) {
        commit('DELETE_CATEGORY', payload.categoryId)
      }
      return res
    })
  },
  createDiscount ({ commit }, payload) {
    const promise = payload._id ? this.$repos.productRepo.updateDiscount({ discountId: payload._id, ...payload }) : this.$repos.productRepo.createDiscount(payload)

    return promise.then((res) => {
      if (res.success) {
        commit(payload._id ? 'UPDATE_PROMOTION' : 'SET_PROMOTION', { ...res?.data?.discount, promotionType: 'discount' })
      }
      return res
    })
  },
  createCoupon ({ commit }, payload) {
    const promise = payload._id ? this.$repos.productRepo.updateCoupon({ couponId: payload._id, ...payload }) : this.$repos.productRepo.createCoupon(payload)

    return promise.then((res) => {
      if (res.success) {
        commit(payload._id ? 'UPDATE_PROMOTION' : 'SET_PROMOTION', { ...res?.data?.coupon, promotionType: 'coupon' })
      }
      return res
    })
  },
  deleteCoupon ({ commit }, payload) {
    return this.$repos.productRepo.deleteCoupon(payload).then(res => res.success && commit('DELETE_PROMOTION', payload.couponId))
  },
  deleteDiscount ({ commit }, payload) {
    return this.$repos.productRepo.deleteDiscount(payload).then(res => res.success && commit('DELETE_PROMOTION', payload.discountId))
  },
  async getPromotions ({ dispatch, commit }) {
    const discounts = await dispatch('getDiscounts')
    const coupons = await dispatch('getCoupons')
    commit('SET_PROMOTIONS', [...discounts, ...coupons])
  },
  getDiscounts () {
    return this.$repos.productRepo.getDiscounts().then((res) => {
      const mappedDiscount = res?.data?.discounts?.map((item) => {
        return { ...item, promotionType: 'discount' }
      })
      return mappedDiscount
    })
  },
  getCoupons () {
    return this.$repos.productRepo.getCoupons().then((res) => {
      const mappedCoupon = res?.data?.coupons?.map((item) => {
        return { ...item, promotionType: 'coupon' }
      })
      return mappedCoupon
    })
  }
}

export const getters = {
  colors: state => state.colors,
  sizes: state => state.sizes,
  categories: state => state.categories,
  getCategory: state => id => state.categories.find(s => s._id === id),

  searchProducts: state => (text) => {
    const name = text.toLowerCase().trim()
    return state.products.filter(p => p.name.toLowerCase().includes(name))
  },

  categoriesById (state) {
    const output = {}
    state.categories.map(c => Object.assign(output, { [c._id]: c }))
    return output
  },

  colorsById (state) {
    const output = {}
    state.colors.map(c => Object.assign(output, { [c._id]: c }))
    return output
  },

  sizesById (state) {
    const output = {}
    state.sizes.map(c => Object.assign(output, { [c._id]: c }))
    return output
  },

  promotions (state) {
    const promotions = state.promotions.map((element) => {
      const sorted = element.date?.slice().sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate)
      })[0]?.startDate
      const minStartDate = element.date?.slice().sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate)
      })[0]?.startDate
      const minEndDate = element.date?.slice().sort((a, b) => {
        return new Date(a.endDate) - new Date(b.endDate)
      })[0]?.endDate
      const maxEndDate = element.date?.slice().sort((a, b) => {
        return new Date(b.endDate) - new Date(a.endDate)
      })[0]?.endDate
      return { ...element, sortedDate: sorted, maxEndDate, minStartDate, minEndDate }
    })
    return promotions.sort((a, b) => {
      return new Date(b.sortedDate) - new Date(a.sortedDate)
    })
  }
}
