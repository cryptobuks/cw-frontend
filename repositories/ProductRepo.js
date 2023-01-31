export default (ctx) => {
  return {
    getCategories () {
      return ctx.$socket.request('category/shop/getCategories', {}).then(
        res => res.data
      )
    },
    getColors () {
      return ctx.$socket.request('color/shop/getColors', {}).then(
        res => res.data
      )
    },
    getSizes () {
      return ctx.$socket.request('size/shop/getSizes', {}).then(
        res => res.data
      )
    },
    saveColor (payload) {
      return ctx.$socket.request('color/shop/createColor', payload)
    },
    updateColor (payload) {
      return ctx.$socket.request('color/shop/setColor', payload)
    },
    saveSize (payload) {
      return ctx.$socket.request('size/shop/createSize', payload)
    },
    updateSize (payload) {
      return ctx.$socket.request('size/shop/setSize', payload)
    },
    deleteColor (payload) {
      return ctx.$socket.request('color/shop/deleteColor', payload)
    },
    deleteSize (payload) {
      return ctx.$socket.request('size/shop/deleteSize', payload)
    },
    saveCategory (payload) {
      return ctx.$socket.request('category/shop/createCategory', payload)
    },
    updateCategory (payload) {
      return ctx.$socket.request('category/shop/setCategory', payload)
    },
    deleteCategory (payload) {
      return ctx.$socket.request('category/shop/deleteCategory', payload)
    },
    deleteCoupon (payload) {
      return ctx.$socket.request('coupon/shop/deleteCoupon', payload)
    },
    deleteDiscount (payload) {
      return ctx.$socket.request('discount/shop/deleteDiscount', payload)
    },

    mutateProduct (payload) {
      const endpoint = `product/shop/${payload._id ? 'update' : 'create'}Product`
      return ctx.$socket.request(endpoint, deTransformProduct(payload))
        .then(res => res.data.product)
    },

    deleteProduct (productId) {
      return ctx.$socket.request('product/shop/deleteProduct', { productId })
    },

    getProducts () {
      return ctx.$socket.request('product/shop/getProducts', {})
        .then(res => res.success ? res.data.products : [])
    },

    getProductTemplates () {
      return ctx.$socket.request('productTemplate/shop/getTemplates')
        .then(res => res.success ? res.data.templates : [])
    },

    mutateProductTemplate (payload) {
      if (payload._id) {
        payload.templateId = payload._id
      }
      const endpoint = `productTemplate/shop/${payload._id ? 'update' : 'create'}Template`
      return ctx.$socket.request(endpoint, payload)
        .then(res => res.success ? res.data.template : null)
    },

    deleteProductTemplate (templateId) {
      return ctx.$socket.request('productTemplate/shop/deleteTemplate', { templateId })
    },

    uploadImage ({ base64, filename }) {
      return ctx.$socket.request('product/shop/uploadImage', {
        base64: base64.replace(/^data:image\/(png|jpeg);base64,/, ''),
        filename
      }).then(res => res.data.image)
    },

    searchProductsByName (text) {
      return ctx.$socket.request('product/shop/suggestName', { text })
        .then(res => res.data.suggestions || [])
    },

    searchSuppliersByName (text) {
      return ctx.$socket.request('product/shop/suggestSuppliers', { text })
        .then(res => res.data.manufacturers || [])
    },
    createDiscount (payload) {
      return ctx.$socket.request('discount/shop/createDiscount', payload)
    },
    updateDiscount (payload) {
      return ctx.$socket.request('discount/shop/updateDiscount', payload)
    },
    createCoupon (payload) {
      return ctx.$socket.request('coupon/shop/createCoupon', payload)
    },
    updateCoupon (payload) {
      return ctx.$socket.request('coupon/shop/updateCoupon', payload)
    },
    getDiscounts () {
      return ctx.$socket.request('discount/shop/getDiscounts')
    },
    getCoupons () {
      return ctx.$socket.request('coupon/shop/getCoupons')
    }
  }

  function deTransformProduct (product) {
    return ctx.$utils.extract(product, [
      '_id',
      'isPublished',
      'name',
      'description',
      'manufacturer',
      'details',
      {
        from: 'categories',
        transform: cats => cats.map(cat => ctx.$utils.extract(cat, [
          '_id',
          'name'
        ], { ignoreNull: true }))
      },
      {
        from: 'items',
        transform: items => items.map(item => ctx.$utils.extract(item, [
          'target',
          'vatRateId',
          'publicPrice',
          'quantity',
          'lastSupplierId',
          'lastCost',
          'barCode',
          {
            from: 'color',
            transform: color => ctx.$utils.extract(color, ['_id', 'name'], { ignoreNull: true })
          },
          {
            from: 'size',
            transform: size => ctx.$utils.extract(size, ['_id', 'name'], { ignoreNull: true })
          },
          {
            from: 'price',
            transform: p => +p || 0
          },
          {
            from: 'pictures',
            transform: pictures => pictures.map(pic => ctx.$utils.extract(pic, [
              'imageId',
              'filename'
            ], { ignoreNull: true }))
          }
        ], { ignoreNull: true }))
      }
    ], { ignoreNull: true })
  }
}
