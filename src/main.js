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
 
  let result = false;

  if(firstname && lastname && phone) {
    firstname = firstname.value;
    lastname = lastname.value;
    phone = phone.value;

    const regTestFirstname = regExName.test(firstname.trim());
    const regTestLastname = regExName.test(lastname.trim());
    const regTestPhone = regExPhone.test(phone);
    if (regTestFirstname && regTestLastname && regTestPhone) {
      result = true;
    }
  }
  return result;
}

const webStore = new Vue({
  el: '#app',
  data: {
    sitename: 'After School Classes',
    showLessons: true,
    products: [],
    cart: [],
    totalQuantity: 0,
    totalPrice: 0,
    myOrder: [],
    sortBy: '',
    sortVal: '',
    sortOptions: [
      'Subject',
      'Location',
      'Price',
      'Space'
    ],
    search: '',
    debounceTimer: null,
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
    this.loadLessons();
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
    },
    fullname: function() {
      return [
        this.information.firstname,
        this.information.lastname
      ].join(' ');
    },
  },
  watch: {
    search(newVal) {
      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.loadLessons();
      }, 300);
    }
  },
  methods: {
    loadLessons() {
      fetch('http://localhost:8080/api/lessons?search=' + this.search)
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
              webStore.totalPrice = data.totalPrice;
            }
          )
        }
      )
    },
    cartProductCount(product) {
      const cartProduct = this.cart.find(p => p._id === product._id);
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
      const cartProductIndex = this.cart.findIndex(l => l._id === product._id);
      let method = cartProductIndex >= 0 ? 'PUT': 'POST';
      let payload = cartProductIndex >= 0 ? { lessonId: product._id } : { lesson: product }
      let url = cartProductIndex >= 0 ? 'http://localhost:8080/api/lessons/update-cart/' + product._id : 'http://localhost:8080/api/lessons/add-to-cart';
      
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
        this.totalPrice = data.totalPrice;
        this.cart = data.cart;
      })
    },
    showCart() {
      this.showLessons = this.showLessons ? false : true;
    },
    removeFromCart(product) {
      fetch('http://localhost:8080/api/lessons/' + product._id, {
        method: 'Delete',
      })
      .then(response => response.json())
      .then(data => {
        this.totalQuantity = data.totalQuantity;
        this.totalPrice = data.totalPrice;
        this.cart = data.cart;
        if (this.cartItemsCount < 1) {
          this.showLessons = true;
          this.showMyCart = false;
        }
      })
    },
    order() {
      const cartBeforeOrder = this.cart;
      const payload = {
        customer: {
          fullname: this.fullname,
          address: this.information.address,
          city: this.information.city,
          state: this.information.state,
          zip: this.information.zip,
          phone: this.information.phone,
          gift: this.information.gift,
          method: this.information.method
        },
        order: cartBeforeOrder
      }

      fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(result => {
        this.showLessons = true;
        this.cart = result.cart;
        this.myOrder = result.myOrder;
        this.totalQuantity = result.totalQuantity;
        this.totalPrice = result.totalPrice;
        alert(result.msg);
      })


      for(let cartLesson of cartBeforeOrder) {
        fetch('http://localhost:8080/api/lessons/' + cartLesson._id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cartLesson)
        })
        .then(response => response.json())
        .then(result => {
          console.log(result.msg);
          this.loadLessons();
        })
        
      }
    }
  }
});