import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import colors from 'colors';
import users from './data/users.js';
import posts from './data/posts.js';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Post from './models/postModel.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // await Order.deleteMany();
    // await Product.deleteMany();
    await User.deleteMany();
    await Post.deleteMany();

    const createdUsers = await User.insertMany(users);
    const createdPosts = await Post.insertMany(posts);

    const adminUser = createdUsers[0]._id;

    // const sampleProducts = products.map((product) => {
    //   return { ...product, user: adminUser };
    // });

    // await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // await Order.deleteMany();
    // await Product.deleteMany();
    await User.deleteMany();
    await Post.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

// console.log(process.argv)
