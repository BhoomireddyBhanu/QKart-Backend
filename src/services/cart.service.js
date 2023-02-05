const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const userCart = await Cart.findOne({ email: user.email });

  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  return userCart;

};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  const userCart = await Cart.findOne({ email: user.email });
  const productSelected = await Product.findOne({ _id: productId });
  if (!productSelected) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  if (!userCart) {
    try {
      const cartItem = {
        email: user.email,
        cartItems: [{
          product: productSelected,
          quantity: quantity,
        },],
      }

      const newCart = await Cart.create(cartItem);
      return newCart

    } catch (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  else {
    let temp = await userCart.cartItems.find(item => String(item.product._id) === productId);

    if (temp) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart. Use the cart sidebar to update or remove product from cart");
    } else {
      try {

        var objCart = { "product": productSelected, "quantity": quantity };
        await userCart.cartItems.push(objCart);
        await userCart.save()
        // const body = {$push: {cartItems: objCart}};
        // Cart.patch(userCart._id,body);
        // findOneAndUpdate(
        //   { _id: userCart._id },
        //   { $push: { cartItems: objCart } },
        //   function (error) {
        //     if (error) {
        //       throw new Error();
        //     }
        //   });

      } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
      }

    }

  }

  return userCart;



};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {

  var userCart = await Cart.findOne({ email: user.email });
  const productSelected = await Product.findOne({ _id: productId });
  if (!productSelected) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  if (!userCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product");
  }

  var index = await userCart.cartItems.findIndex(item => String(item.product._id) === productId);
  // console.log(index) 
  if(index === -1){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  userCart.cartItems[index].quantity = quantity;
  userCart.markModified('cartItems');

  await userCart.save()
  // console.log(userCart);
  
  return userCart;

};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }
  // const productSelected = await Product.findOne({ _id: productId });
  var deleteId;
  let temp = await userCart.cartItems.find(item => {
    if (String(item.product._id) === productId) {
      deleteId = item._id;
      return true
    }
    return false
  });
  
  if (!temp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  // await Cart.updateOne({ _id: userCart._id, }, { "$pull": { "cartItems": { "_id": deleteId } } }, { safe: true });
  await userCart.cartItems.pull({"_id":deleteId});
  userCart.markModified('cartItems');
  await userCart.save()

};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const userCart = await Cart.findOne({ email: user.email });
  if(!userCart){
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  if(userCart.cartItems.length === 0){
    throw new ApiError(httpStatus.BAD_REQUEST);
  }
  let isDefaultAddress =await user.hasSetNonDefaultAddress()
  console.log(isDefaultAddress)
  if(!isDefaultAddress){
    throw new ApiError(httpStatus.BAD_REQUEST)
  }
  const productValue = await userCart.cartItems.reduce(function (accumulator, curItem) {

    return accumulator + (curItem.quantity * curItem.product.cost)

  }, 0)
  // console.log(productValue)
  if(user.walletMoney < productValue){
    throw new ApiError(httpStatus.BAD_REQUEST)
  }

  user.walletMoney = user.walletMoney - productValue;
  await user.save()

  userCart.cartItems = [];
  userCart.markModified("cartItems");
  await userCart.save()

  return userCart;

};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
