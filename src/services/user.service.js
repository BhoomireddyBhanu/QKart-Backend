const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

const getAllUsers = async () =>{
    let data = await User.find({});
    return data;
}

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

 const getUserById = async (userId) =>{
     let data = await User.findById(userId);
    //  console.log(data);
     
     return data;

 }

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */

 const getUserByEmail = async (email) => {
     let data = await User.findOne({email:email});
    //  console.log(data);
     return data;    

 }

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */
const saveDocument = async (doc) => {
    const result = await doc.save();
    return result;
};

const createUser = async (userBody) =>{

    if(await User.isEmailTaken(userBody.email)){
        throw new ApiError(httpStatus.OK, "Email already taken")
    }else{
        const newUser = new User(userBody);
        const savedDoc =await User.create(newUser);// await saveDocument(newUser);
        // console.log("saving",savedDoc)
        return savedDoc;
    }
}




// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserAddressById = async (id) => {
    let data = await User.findOne({"_id":id},{address:1,email:1});
    return data
    

};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};

module.exports = {getAllUsers, getUserById, getUserByEmail, createUser,getUserAddressById,setAddress};
