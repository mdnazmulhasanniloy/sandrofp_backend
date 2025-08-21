import { Error, Query, Schema, model } from 'mongoose';
import config from '../../config';
import bcrypt from 'bcrypt';
import { IUser, UserModel } from './user.interface';
import { Login_With, Role, USER_ROLE } from './user.constants';

const userSchema: Schema<IUser> = new Schema(
  {
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    name: {
      type: String,
      required: true,
      default: null,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^(\+?\d{8,15})$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      default: null,
    },

    password: {
      type: String,
      required: false,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Others'],
      default: null,
    },

    dateOfBirth: {
      type: String,
      default: null,
    },

    profile: {
      type: String,
      default: null,
    },
    hobby: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },

    avgRating: {
      type: Number,
      default: 0,
    },
    sellerType: {
      type: String,
      default: null,
    },
    totalReview: {
      type: Number,
      default: 0,
    },
    about:{
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: Role,
      default: USER_ROLE.user,
    },
    location: {
      type: {
        type: {
          type: String,
          enum: ['Point'],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    loginWth: {
      type: String,
      enum: Login_With,
      default: Login_With.credentials,
    },
    address: {
      type: String,
      default: null,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    needsPasswordChange: {
      type: Boolean,
    },
    passwordChangedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verification: {
      otp: {
        type: Schema.Types.Mixed,
        default: 0,
      },
      expiresAt: {
        type: Date,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
    expireAt: {
      type: Date,
      default: () => {
        const expireAt = new Date();
        return expireAt.setMinutes(expireAt.getMinutes() + 20);
      },
    },
    device: {
      ip: {
        type: String,
      },
      browser: {
        type: String,
      },
      os: {
        type: String,
      },
      device: {
        type: String,
      },
      lastLogin: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
userSchema.pre('save', async function (next) {
  const user = this;
  if (this.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  next();
});

// set '' after saving password
userSchema.post(
  'save',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (error: Error, doc: any, next: (error?: Error) => void): void {
    doc.password = '';
    next();
  },
);

userSchema.statics.isUserExist = async function (email: string) {
  return await User.findOne({ email: email }).select('+password');
};

userSchema.statics.IsUserExistId = async function (id: string) {
  return await User.findById(id).select('+password');
};


userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<IUser, UserModel>('User', userSchema);
