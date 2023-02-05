const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require("../config/config")

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const cartItemSchema = mongoose.Schema(
  {
    product:{
      type:productSchema,
    },
    quantity:{
      type:Number
    }
  },
  // {_id:false}
)
const cartSchema = mongoose.Schema(
  {
    email:{
      type:String,
      require: true,
      unique: true
    },
    cartItems: [cartItemSchema],
    paymentOption:{
      type:String,
      default: config.default_payment_option
    }
  },
  {
    timestamps: false,
  }
);


// cartSchema.pre('save', async function (next) {

//   var cart = this;
//   next(cart);
// });

/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;