import { products } from "./data/products.js";

new Vue({
  el: '#app',
  data: { 
    sitename: 'After School Classes',
    showLessons: true,
    showMyCart: false,
    products,
    cart: [],
    information: {
      firstname: '',
      lastname: '',
      address: '',
      city: '',
      state: '',
      states: [
        'Alaska',
        'Alabama',
        'Arkansas',
        'Arizona',
        'California',
        'Colorado',
        'Connecticut',
        'District of Columbia',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Iowa',
        'Idaho',
        'Illinois',
        'Indiana',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Massachusetts',
        'Maryland',
        'Maine',
        'Michigan',
        'Minnesota',
        'Missouri',
        'Mississippi',
        'Montana',
        'North Carolina',
        'North Dakota',
        'Nebraska',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'Nevada',
        'New York',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Puerto Rico',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Virginia',
        'Vermont',
        'Washington',
        'Wisconsin',
        'West Virginia',
        'Wyoming'
      ],
      zip: '',
      phone: '',
      gift: 'Do not send as gift',
      sendGift: 'Send as a gift',
      dontSendGift: 'Do not send as a gift',
      method: 'Home'
    },
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
    },
    order() {
      alert('Order Placed')
    }
  }
});