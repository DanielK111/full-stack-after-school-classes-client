import { products } from "./data/products.js";
import { states } from "./data/states.js";

new Vue({
  el: '#app',
  data: { 
    sitename: 'After School Classes',
    showLessons: true,
    products,
    cart: [],
    sortBy: '',
    sortVal: '',
    sortOptions: [
      'Subject',
      'Location',
      'Price',
      'Space'
    ],
    information: {
      firstname: '',
      lastname: '',
      address: '',
      city: '',
      state: '',
      states: states,
      zip: '',
      phone: '',
      gift: 'Do not send as gift',
      sendGift: 'Send as a gift',
      dontSendGift: 'Do not send as a gift',
      method: 'Home'
    }
 },
 computed: {
  sortedLessons() {
    const compare = (a, b) => {
      if (this.sortBy !== '') {
        const sortKey = this.sortBy.toLowerCase();
        if (this.sortVal === 'ASC') {
          if (a[sortKey] > b[sortKey]) return 1;
          if (a[sortKey] < b[sortKey]) return -1;
        } else if (this.sortVal === 'DEC') {
          if (a[sortKey] > b[sortKey]) return -1;
          if (a[sortKey] < b[sortKey]) return 1;
        }
      }
      return 0;
    }

    return this.products.sort(compare);
  },
  cartItemsCount() {
    return this.cart.length || "";
  }
 },
  methods: {
    cartProductCount(product) {
      const cartProduct = this.cart.find(p => p.id === product.id);
      if (cartProduct)
        return cartProduct.quantity
      return 0;
    },
    canAddToCart(product) {
      return product.space > this.cartProductCount(product);
    },
    leftProduct(product) {
      return product.space - this.cartProductCount(product);
    },
    addToCart(product) {
      const cartProductIndex = this.cart.findIndex(p => p.id === product.id);
      let itemCount = 1;
      const items = [ ...this.cart ];

      if (cartProductIndex < 0) {
        this.cart.push({ ...product, quantity: itemCount });
      } else {
        itemCount = items[cartProductIndex].quantity + itemCount;
        this.cart[cartProductIndex].quantity = itemCount;
      }
    },
    showCart() {
      this.showLessons = this.showLessons ? false : true;
    },
    removeFromCart(product) {
      const cartProduct = this.cart.find(p => p.id === product.id);
      if (cartProduct.quantity > 1) {
        cartProduct.quantity -= 1;
      } else {
        this.cart = this.cart.filter(p => p.id !== product.id);
      }
      if (this.cartItemsCount < 1) {
        this.showLessons = true;
        this.showMyCart = false;
      }
    },
    order() {
      alert('Order Placed')
    }
  }
});