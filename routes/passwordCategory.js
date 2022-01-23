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
router.get('/', checkLoginUser,function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    var getCategory=passCatModel.find({user:req.session.userName});
  //   getPassCat.exec(function(err,data){
  //     if(err) throw err;
  //   res.render('password_category', { title: 'Password Management System',loginUser: loginUser,records:data});
  // });
  getCategory.exec(function(err,data){
    if(err) throw err;
  res.render('password_category', { title: 'Password Management System',loginUser:req.session.userName,records:data,all:''});
});
  });

  router.get('/delete/:id', checkLoginUser,function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    var passcat_id=req.params.id;
    var getDetails=passCatModel.find({_id:passcat_id});
    getDetails.exec(function(err,data){
      if(err)
      {
        console.log(err);
      }
      else
      {

        
        var name=data[0].passord_category;
        
        var checkPasswords=passModel.find({user:req.session.userName,password_category:name});
        checkPasswords.exec(function(err,data1){
          if(err)
          {
            console.log(err);
            res.render('password_category', { title: 'Password Management System',loginUser:req.session.userName,records:data,all:'Error occured'});
          }
          if(data1.length>0)
          {
            console.log("Hi10");
            res.render('password_category', { title: 'Password Management System',loginUser:req.session.userName,records:data,all:'Passwords are present with given category so cant delete it'});
          }
          else
          {
            console.log("20");
            var deleteCat=passCatModel.findByIdAndDelete(passcat_id);
            deleteCat.exec(function(err){
              if(err)
              {
                res.render('password_category', { title: 'Password Management System',loginUser:req.session.userName,records:data,all:'Passwords are present with given category so cant delete it'});
                console.log(err);
              }
              else
              {
                res.redirect('/passwordCategory');
              }
            })
          }
        })
      }
    });
    // var getPasswords=passModel.find({user:loginUser,password_category:})
    // var passdelete=passCatModel.findByIdAndDelete(passcat_id);
    // passdelete.exec(function(err){
    //   if(err) throw err;
    //   else
    //   {
    //     var getCategory=passCatModel.find({user:loginUser});
    //     getCategory.exec(function(err,data){
    //       if(err) throw err;
    //     res.render('password_category', { title: 'Password Management System',loginUser: loginUser,records:data,all:'Passwords are present with given category so cant delete it'});
    //   });
    //   }
      //res.redirect('/passwordCategory');
    //});
  });
  
  router.get('/edit/:id', checkLoginUser,function(req, res, next) {
    console.log("/edit/id");
    var loginUser=localStorage.getItem('loginUser');
    var passcat_id=req.params.id;
    var getpassCategory=passCatModel.findById(passcat_id);
    getpassCategory.exec(function(err,data){
      if(err) throw err;
      res.render('edit_pass_category', { title: 'Password Management System',loginUser:req.session.userName,errors:'',success:'',records:data,id:passcat_id});
  
    });
  });
  
  router.post('/edit/', checkLoginUser,function(req, res, next) {
    console.log("/edit/");
    var loginUser=localStorage.getItem('loginUser');
    var passcat_id=req.body.id;
    //console.log(passcat_id);
    var passwordCategory=req.body.passwordCategory;
    var OldCategory=req.body.OldCategory;
    var checkDetailsCat=passCatModel.find({user:req.session.userName,passord_category:passwordCategory});
    checkDetailsCat.exec(function(err,data1){
      if(err)
      {
        console.log(err);
        res.redirect('/passwordCategory');
      }
      else
      {
        if(data1.length>0)
        {
          res.redirect('/passwordCategory');
        }
        else
        {
          var myquery={user:req.session.userName,passord_category:OldCategory};
          var newvalues={$set:{passord_category:passwordCategory}};
          var update_passCat=passCatModel.updateOne(myquery,newvalues);
          update_passCat.exec(function(err,data2){
            if(err) 
            {
              console.log(err);
              res.redirect('/passwordCategory');
            }
            else
            {
              
              var myquery1={user:req.session.userName,password_category:OldCategory};
              var newvalues1={$set:{password_category:passwordCategory}};
              var update_Passwords_Passmodel=passModel.updateMany(myquery1,newvalues1);
              update_Passwords_Passmodel.exec(function(err,data3){
                if(err)
                {
                  console.log(err);
                  res.redirect('/passwordCategory');
                }
                else
                {
                  console.log(data3);
                  res.redirect('/passwordCategory');
                }
              });
            }
          });
        }
      }
    })
    
    
  });
  
  module.exports = router;