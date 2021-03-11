console.log("This is a website")

var eventBus = new Vue();

Vue.component('product-details',{

  props:{
    details: {
      type: Array,
      required: true
    }
  },
  template:`
    <ul>
      <li v-for="detail in details"> {{detail}} </li>
    <ul>
  `

})

Vue.component('product', {
  props:{
    premium: {
      type: Boolean,
      required: true
    }
  },
  template:`
    <div class="product">

      <div class="product-image">
          <img :src="image" alt=""> 
      </div>

      <div class="product-info">
        <h1>{{title}}</h1> 
        <p>{{description}}</p>
        <p>Shipping: {{ shippingCost }}</p>
        <p v-show="variants[selectedVariant].onSale.sale">On Sale {{percentDiscount}}% !</p>
        <a href :link="link">More product like this</a>
        <p v-if="inventory > 10">In stock</p>
        <p v-else-if="inventory <=10 && inventory>0">Almost sold out <span>({{inventory}} left)</span></p>
        <p v-else :class="{outOfStock: inventory <= 0}">Out of Stock</p>
        <div v-for="(variant, index) in variants" 
        :key="variant.variantId"
        class="color-box"
        :style="{'background-color': variant.variantColor }"
        @mouseover="updateProduct(index)"
        >
        </div>

        <button @click="addToCart"
                :disabled="inventory <= 0"
                :class="{disabledButton : inventory <= 0}">Add to cart
        </button>

        <button @click="removeFromCart">Remove</button>

      </div>

      <product-tabs :reviews="reviews"></product-tabs>


    </div>
    
  `,
  data(){
    return{
      brand: 'Vue Mastery',
      product: 'Socks',
      description: 'A pair of warm, fuzzy socks',
      selectedVariant: 0,
      link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: 'green',
          variantImage: '/img/vmSocks-green-onWhite.jpg',
          variantQuantity: 4,
          onSale: {
            sale: true,
            discount: 10,
          }
        },
        {
          variantId: 2235,
          variantColor: 'blue',
          variantImage: '/img/vmSocks-blue-onWhite.jpg',
          variantQuantity: 5,
          onSale: {
            sale: false,
            discount: 0,
          }
        }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],

      reviews: []
      
    }
  },
  methods: {
    addToCart: function(){
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
    },
    removeFromCart: function(){
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
    },
    updateProduct: function(index){
      this.selectedVariant = index;
      console.log(index)
    },
  },
  computed:{

    title(){
      return this.brand + " " + this.product;
    },
    image(){
      return this.variants[this.selectedVariant].variantImage;
    },
    inventory(){
      return this.variants[this.selectedVariant].variantQuantity;
    },
    percentDiscount(){
      return this.variants[this.selectedVariant].onSale.discount;
    },
    shippingCost(){
      if(this.premium){
        return "free";
      }
      else{
        return 2.99;
      }
    }

  },

  mounted(){
    eventBus.$on('submit-form', productReview => {
      this.reviews.push(productReview);
    })
  }

})

Vue.component('product-review',{
  template:`
    
    <form class="review-form" @submit.prevent="onSubmit">


      <p class="error" v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    

  </form>   

  `,
  data(){
    return{
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods:{
    onSubmit: function(){
      this.errors = []
      if(this.name && this.review && this.rating){

        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        };
  
        eventBus.$emit('submit-form', productReview);
  
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null;

      }else{

        if(!this.name)this.errors.push("Name Required.");
        if(!this.review)this.errors.push("Review Required.");
        if(!this.rating)this.errors.push("Rating Required.");
        if(!this.recommend)this.errors.push("Recommend Required.");


      }
    }
  }
})

Vue.component('product-tabs', {
  props:{
    reviews:{
      type: Array,
      required: true
    }
  },
  template:`

    <div>
        <span class="tab"
              :class = "{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs" 
              :key="index"
              @click="selectedTab = tab"
              > {{ tab }} 
        </span>

        <div v-show="selectedTab === 'Reviews'">
          <h2>Reviews</h2>
          <p v-if="reviews.length == 0">There are no reviews yet. </p>
          <ul>
            <li v-for="review in reviews">
              <p>Name: {{review.name}}</p>
              <p>Rating: {{review.rating}}</p>
              <p>Description: {{review.description}}</p>
            </li>
          </ul> 
        </div>


        <product-review
          v-show="selectedTab === 'Write A Review'" >
          
        </product-review>

    </div>



  `,
  data(){
    return{
      tabs: ['Reviews', 'Write A Review'],
      selectedTab: 'Reviews'
    }
  }

})

var app = new Vue({
  el: '#app',
  data:{
    premium: true,
    cart: []
  },
  methods:{
    updateCart: function(id){
      this.cart.push(id);
    },
    removeProduct: function(id){
      for (var i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
          this.cart.splice(i, 1);
          return;
        }
       }
    }
  }
})


