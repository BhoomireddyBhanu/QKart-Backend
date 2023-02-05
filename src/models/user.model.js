const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: (value) => validator.isEmail(value),
    },
    password: {
      type: String,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default: config.default_wallet_money,
    },
    address: {
      type: String,
      required: false,
      trim: false,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {

  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next()
  };
  // generate a salt.1
  try {

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();

  } catch (err) {
    // console.log(err)
    next(err)
  }
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  if (await this.findOne({ email: email })) {
    return true;
  } else {
    return false;
  }
};

// UserSchema.methods.comparePassword = function(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//       if (err) return cb(err);
//       cb(null, isMatch);
//   });
// };

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  let isValid = await bcrypt.compare(password, this.password);
  if (isValid) {
    return true;
  } else {
    return false;
  }
};

userSchema.methods.hasSetNonDefaultAddress = async function () {
  console.log(this.address);
  return this.address && this.address !== config.default_address;
}



// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */

const User = mongoose.model("User", userSchema, "users");

module.exports = { User };
