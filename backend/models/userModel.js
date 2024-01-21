import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    isLoggedIn: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    friends: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        isAccepted: {
          type: Boolean,
          default: false, // Set the default value here
        },
        initiateRequest: {
          type: Boolean,
          default: false, // Set the default value here
        },
        requestSent: {
          type: Date,
          required: true,
          default: Date.now,
        },
        acceptedDate: {
          type: Date,
        },
      },
    ],

    // myFriendRequests: [
    //   {
    //     user: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    //     isAccepted: {
    //       type: Boolean,
    //       default: false, // Set the default value here
    //     },
    //   },
    // ],
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  // if we are not modifying the password, simply next
  if (!this.isModified('password')) {
    next();
  }
  // This includes registering user.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
