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
  let email = document.getElementById('email');

  const regExName = /^[a-zA-Z]{4,}$/;
  const regExPhone = /^[0-9]{10}$/;
  const regExEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
  let result = false;

  if(firstname && lastname && phone && email) {
    firstname = firstname.value;
    lastname = lastname.value;
    phone = phone.value;
    email = email.value;

    const regTestFirstname = regExName.test(firstname.trim());
    const regTestLastname = regExName.test(lastname.trim());
    const regTestPhone = regExPhone.test(phone);
    const regTestEmail = regExEmail.test(email);

    if (regTestFirstname && regTestLastname && regTestPhone && regTestEmail) {
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
    showLogin: false,
    showSignup: false,
    isLoggedin: !!localStorage.getItem('token'),
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
      email: '',
      password: '',
      confirmPassword: '',
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
    isSignupBtnValid() {
      const regExName = /^[a-zA-Z]{4,}$/;
      const regExPhone = /^[0-9]{10}$/;
      const regExEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const regExPassword = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

      const { firstname, lastname, phone, email, password } = this.information;

      return (
        regExName.test(firstname?.trim() || '') &&
        regExName.test(lastname?.trim() || '') &&
        regExPhone.test(phone?.toString() || '') &&
        regExEmail.test(email?.trim() || '') &&
        regExPassword.test(password || '')
      );
    },
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
    }
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
      fetch('https://full-stack-after-school-classes-server.onrender.com/api/lessons?search=' + this.search, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
      .then(
        function(response) {
          response.json()
          .then(
            function(data) {
              // console.log(data)
              webStore.products = data.lessons;
              webStore.information.states = data.states;
              webStore.cart = data.cart;
              webStore.totalQuantity = data.totalQuantity;
              webStore.myOrder = data.myOrder;
              webStore.totalPrice = data.totalPrice;
              if (data.user.length > 0) {
                webStore.information.firstname = data.user[0].fullname.split(' ')[0];
                webStore.information.lastname = data.user[0].fullname.split(' ')[1];
                webStore.information.email = data.user[0].email;
                webStore.information.address = data.user[0].address;
                webStore.information.city = data.user[0].city;
                webStore.information.zip = data.user[0].zip;
                webStore.information.phone = data.user[0].phone;
                webStore.information.password = data.user[0].password;
              }
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
      let url = cartProductIndex >= 0 ? 'https://full-stack-after-school-classes-server.onrender.com/api/lessons/update-cart/' + product._id : 'https://full-stack-after-school-classes-server.onrender.com/api/lessons/add-to-cart';
      
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        this.totalQuantity = data.totalQuantity;
        this.totalPrice = data.totalPrice;
        this.cart = data.cart;
      })
    },
    showCart() {
      this.showLessons = this.showLessons ? false : true;
      this.showLogin = false;
      this.showSignup = false;
    },
    removeFromCart(product) {
      fetch('https://full-stack-after-school-classes-server.onrender.com/api/lessons/' + product._id, {
        method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
        this.totalQuantity = data.totalQuantity;
        this.totalPrice = data.totalPrice;
        this.cart = data.cart;
        if (this.cartItemsCount < 1) {
          this.showLessons = true;
        }
      })
    },
    isLogin() {
      this.showLogin = this.showLogin ? false : true;
      if(!this.showLogin) {
        this.showLessons = true;
      } else {
        this.showLessons = false;
      }
      this.showSignup = false;
    },
    isSignup() {
      this.showSignup = this.showSignup ? false : true;
      if(!this.showSignup) {
        this.showLessons = true;
      } else {
        this.showLessons = false;
      }
      this.showLogin = false;
    },
    login() {
      const payload = {
        email: this.information.email,
        password: this.information.password
      };

      fetch('https://full-stack-after-school-classes-server.onrender.com/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(result => {
        console.log(result)
        if(result.errorArray) {
          let errors = result.errorArray;
          let str = "";
          for(let error of errors) {
            str += error.path;
            str += "\n" + error.msg + "\n";
          }
          alert(str)
        } else {
          alert(result.msg);
        }

        if (result.token) {
          this.isLoggedin = true;
          this.showLessons = true;
          localStorage.setItem('token', result.token);
          this.information.firstname = result.fullname.split(' ')[0];
          this.information.lastname = result.fullname.split(' ')[1];
          this.information.email = result.email;
          this.information.address = result.address;
          this.information.city = result.city;
          this.information.zip = result.zip;
          this.information.phone = result.phone;
          this.information.password = result.password;
        } else {
          this.isLoggedin = false;
        }
      })
    },
    signup() {
      const payload = {
        fullname: this.fullname,
        email: this.information.email,
        password: this.information.password,
        confirmPassword: this.information.confirmPassword,
        address: this.information.address,
        city: this.information.city,
        state: this.information.state,
        zip: this.information.zip,
        phone: this.information.phone
      };

      fetch('https://full-stack-after-school-classes-server.onrender.com/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(result => {
        if(result.errorArray) {
          let errors = result.errorArray;
          let str = "";
          for(let error of errors) {
            str += error.path;
            str += "\n" + error.msg + "\n";
          }
          alert(str)
        } else {
          alert(result.msg);
        }
        
        if (!result.error) {
          this.showLessons = true;
          this.information.firstname = '';
          this.information.lastname = '';
          this.information.email = '';
          this.information.address = '';
          this.information.city = '';
          this.information.zip = '';
          this.information.phone = '';
          this.information.password = '';
          this.information.confirmPassword = '';
        }
      })
    },
    logout() {
      localStorage.removeItem('token');
      this.isLoggedin = false;
      console.log('User logs out.');
      this.information.firstname = '';
      this.information.lastname = '';
      this.information.email = '';
      this.information.address = '';
      this.information.city = '';
      this.information.zip = '';
      this.information.phone = '';
      this.information.password = '';
      this.information.confirmPassword = '';
    },
    order() {
      const cartBeforeOrder = this.cart;
      const payload = {
        customer: {
          fullname: this.fullname,
          email: this.information.email,
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

      fetch('https://full-stack-after-school-classes-server.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
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
        fetch('https://full-stack-after-school-classes-server.onrender.com/api/lessons/' + cartLesson._id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
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