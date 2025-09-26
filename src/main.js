import { products } from "./data/products.js";

new Vue({
  el: '#app',
  data: { 
    sitename: 'After School Classes',
    showLessons: true,
    showMyCart: false,
    products,
    cart: [],
    space: 5
 },
 computed: {
  cartItemsCount() {
    return this.cart.length || "";
  },
  canAddToCart() {
    return this.space > this.cartItemsCount;
  }
 },
  methods: {
    addToCart(product) {
      const cartProductIndex = this.cart.findIndex(p => p.id === product.id);
      if (cartProductIndex < 0)
        this.cart.push(product);
    },
    showCart() {
      this.showMyCart = this.showMyCart ? false : true;
      if (!this.showMyCart) {
        this.showLessons = true;
      } else {
        this.showLessons = false;
      }
    },
    showCheckout() {
      this.showMyCart = false;
      this.showLessons = this.showLessons ? false : true;
    },
    removeFromCart(product) {
      this.cart = this.cart.filter(p => p.id !== product.id);
    }
  }
});