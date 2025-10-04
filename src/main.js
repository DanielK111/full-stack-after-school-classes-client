document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  setInterval(() => {
    checkoutBtn.disabled = !validate();
  }, 100);
});

function validate() {
  let firstname = document.getElementById('firstname');
  let lastname = document.getElementById('lastname');
  
  let phone = document.getElementById('phone');

  const regExName =/^[a-zA-Z]+$/;
  const regExPhone = /^[0-9]+$/;
  if(firstname && lastname && phone) {
    firstname = firstname.value;
    lastname = lastname.value;
    phone = phone.value;
  }
  const regTestFirstname = regExName.test(firstname.trim());
  const regTestLastname = regExName.test(lastname.trim());
  const regTestPhone = regExPhone.test(phone);
  if (regTestFirstname && regTestLastname && regTestPhone) {
    return true;
  }
  return false;
}

const webStore = new Vue({
  el: '#app',
  data: {
    sitename: 'After School Classes',
    showLessons: true,
    products: [],
    cart: [],
    totalQuantity: 0,
    myOrder: [],
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
      states: [],
      zip: '',
      phone: '',
      gift: 'Do not send as gift',
      sendGift: 'Send as a gift',
      dontSendGift: 'Do not send as a gift',
      method: 'Home'
    }
 },
 created: function() {
  fetch('http://localhost:8080/api/lessons')
  .then(
    function(response) {
      response.json()
      .then(
        function(data) {
          webStore.products = data.lessons;
          webStore.information.states = data.states;
          webStore.cart = data.cart;
          webStore.totalQuantity = data.totalQuantity;
          webStore.myOrder = data.myOrder;
        }
      )
    })
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
    return this.totalQuantity || "";
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
      const cartProductIndex = this.cart.findIndex(l => l.id === product.id);
      let method = cartProductIndex >= 0 ? 'PUT': 'POST';
      let payload = cartProductIndex >= 0 ? { lessonId: product.id } : { lesson: product }
      let url = cartProductIndex >= 0 ? 'http://localhost:8080/api/lessons/' + product.id : 'http://localhost:8080/api/lessons';
      
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        this.totalQuantity = data.totalQuantity;
        this.cart = data.cart;
      })
    },
    showCart() {
      this.showLessons = this.showLessons ? false : true;
    },
    removeFromCart(product) {
      fetch('http://localhost:8080/api/lessons/' + product.id, {
        method: 'Delete',
      })
      .then(response => response.json())
      .then(data => {
        this.totalQuantity = data.totalQuantity;
        this.cart = data.cart;
        if (this.cartItemsCount < 1) {
          this.showLessons = true;
          this.showMyCart = false;
        }
      })
    },
    order() {
      fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart: { ...this.cart } })
      })
      .then(response => response.json())
      .then(result => {
        this.showLessons = true;
        this.cart = result.cart;
        this.myOrder = result.myOrder;
        this.totalQuantity = result.totalQuantity;
        alert(result.msg);
      })
    }
  }
});