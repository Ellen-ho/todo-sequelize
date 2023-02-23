const express = require('express')
const router = express.Router()
const passsport = require('passport')
const bcrypt = require('bcryptjs')

const User = require('../../models/user')

router.get('/login', (req, res) =>{
  res.render('login')
})

router.post('/login', passsport.authenticate('local',{
 successRedirect: '/',
 failureRedirect:'users/login'
}))

router.get('/register', (req, res) =>{
  res.render('register')
})

router.post('/register', (req, res) => {
  // 取得註冊表單參數
  const { name, email, password, confirmPassword } = req.body
  // 檢查使用者是否已經註冊

  const errors = []

  if(!name || !email || !password || !confirmPassword){
    errors.push({message: '所有欄位都是必填!'})
  }
  if(password !== confirmPassword){
    errors.push({message: '密碼與確認密碼不相符!'})
  }
  if(errors.length){
    return res.render('register', {
       errors,
       name,
       email,
       password,
       confirmPassword
    })
  }

  User.findOne({ where: { email } }).then(user => {
    if (user) {
      console.log('User already exists')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg','你已經成功登出!')
  res.redirect('/users/login')
})

module.exports = router