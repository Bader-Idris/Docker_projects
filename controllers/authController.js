const { findOne } = require('../models/postModel');
const User = require('../models/userModel')
const bcrypt = require("bcryptjs");

exports.singUp = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, Number(12));
    // 12 is the strength of the hash!
    const newUser = await User.create({
      username,
      password: hashPassword
    })
    res.status(201).json({
      status: "success",
      data: {
        user: newUser
      }
    })
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      msg: "bad req yo"
    })
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({username})
    if (!user) { 
      return res.status(404).json({
        status: 'fail',
        message: "User not found"
      })
    }
    // we'll check user's hashed password,
    //  if two are equal we all 'em to access
    isCorrect = await bcrypt.compare(password, user.password)
    if (isCorrect) {
      res.status(200).json({
        status: 'success'
      })
    } else {
      res.status(400).json({
        // put the forbidden one instead!
        status: 'fail',
        message: "incorrect username or password"
      })
    }
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      msg: "bad req yo"
    })
  }
}