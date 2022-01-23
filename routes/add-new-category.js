var express = require('express');
var router = express.Router();
var userModule=require('../modules/user');
var passCatModel = require('../modules/password_category');
var passModel = require('../modules/add_password');
var bcrypt =require('bcryptjs');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

var getPassCat= passCatModel.find({});
var getAllPass= passModel.find({});
/* GET home page. */

// function checkLoginUser(req,res,next){
//   var userToken=localStorage.getItem('userToken');
//   try {
//     var decoded = jwt.verify(userToken, 'loginToken');
//   } catch(err) {
//     res.redirect('/');
//   }
//   next();
// }
function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    if(req.session.userName){
    var decoded = jwt.verify(userToken, 'loginToken');
    }
    else{
      res.redirect('/');
    }
  } catch(err) {
    res.redirect('/');
  }
  next();
}
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function checkUsername(req,res,next){
  var uname=req.body.uname;
  var checkexitemail=userModule.findOne({username:uname});
  checkexitemail.exec((err,data)=>{
    if(err) throw err;
    if(data){
        return res.render('signup', { title: 'Password Management System', msg:'Username Already Exit' });
    }
    next();
  });
}

function checkEmail(req,res,next){
  var email=req.body.email;
  var checkexitemail=userModule.findOne({email:email});
  checkexitemail.exec((err,data)=>{
    if(err) throw err;
    if(data){  
        return res.render('signup', { title: 'Password Management System', msg:'Email Already Exit' });
    }
    next();
  });
}

router.get('/',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    //var loginUser=req.session.userName;
    res.render('addNewCategory', { title: 'Password Management System',loginUser:req.session.userName,errors:'',success:'' });
  
});

router.post('/',checkLoginUser, [ check('passwordCategory','Enter Password Category Name').isLength({ min: 1 })],function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    //var loginUser=req.session.userName;
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {     
      res.render('addNewCategory', { title: 'Password Management System',loginUser:req.session.userName, errors:errors.mapped(),success:'' });
    }
    else
    {
      var passCatName =req.body.passwordCategory;
      console.log(passCatName);
      console.log(loginUser);
      var getDetail=passCatModel.find({user:req.session.userName,passord_category:passCatName});
      getDetail.exec(function(err,data){
        if(data.length>0)
        {
          res.render('addNewCategory', { title: 'Password Management System',loginUser:req.session.userName, errors:'', success:'Password category Already Present' });      
          console.log("Already present");
        }
        else
        {
          var passCatDetails=new passCatModel({
            user:req.session.userName,
            passord_category:passCatName
          });
          passCatDetails.save(function(err,doc){
            if(err){
              console.log(err);
              res.render('addNewCategory', { title: 'Password Management System',loginUser:req.session.userName, errors:'', success:'Problem Occured' });      
            }
            else
            {
              res.render('addNewCategory', { title: 'Password Management System',loginUser:req.session.userName, errors:'', success:'Password category inserted successfully' });      
            }
          })
        }
      })
    }
    //   var passcatDetails =new passCatModel({
    //       user:loginUser,
    //       passord_category: passCatName
    //     });
    //   passcatDetails.save(function(err,doc){
    //          if(err){
    //            console.log("HI")
    //            console.log(err);
    //           throw err;
    //          }
    //          else
    //          res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });      
    //   })
          
    // }
});
  
  module.exports = router;