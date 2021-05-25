const express=require('express');
require('dotenv').config();
const app=express();
const hbs=require("hbs");
const mongoose=require('mongoose');
const path=require('path');
const cookieparser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const authenticate=require('./middleware/authenticate');
require("./db/conn.js");
//session
var session=require('express-session');
app.use(session({
secret:'asdfghjklmnbvccxzasqer',
resave:false,
saveUninitialized:false,
}))

console.log(process.env.SECRET_KEY);
const port=process.env.PORT || 8000;   

const partialspath=path.join(__dirname,"../src/partials");

const Register=require("./models/registers.js");

//app.use(express.json());
app.use(express.urlencoded({extended:false}));


const publicpath=path.join(__dirname,"../public");

app.use(express.static(publicpath));

app.set("view engine","hbs");   //setting view engine

hbs.registerPartials(partialspath);

app.use(cookieparser());




//routing
app.get("/",(req,res)=>{
res.render("index");

});

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",async(req,res)=>{
   try{
        
        const password=req.body.password;
        const confirm_password=req.body.cpassword;
        if(password===confirm_password)
        {
           // res.send(`${req.body.fname} ${req.body.lname}`);
            console.log(req.body.lname);
            const registerEmployee=new Register({
                firstname: req.body.fname,
                lastname: req.body.lname,
                email: req.body.email,
                gender: req.body.gender,
                phoneno: req.body.phno,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.cpassword
            })
            const token=await registerEmployee.generateAuthToken();
            console.log("token is:"+token);

            res.cookie("jwt",token,{
                expires:new Date(Date.now()+1000000),
                httpOnly:true,
               // secure:true   --uncomment this while production--
            });
            const registered=await registerEmployee.save();

            res.status(201).render("index");
            
        }
       
        else{
            res.status(400).redirect("register");
        }
   }
   catch(err){
        res.status(400).send(err);
   }
})

app.get("/login",(req,res)=>{
    console.log(req.session);
    if(req.session.email)
    {
    res.redirect("home");
    }
    else
    {
    res.render('login');
    }
})

// login validation
app.post("/login",async (req,res)=>{
    try{
        const email=req.body.email;
        const password=+(req.body.password);    // converting string to number

       

            

        const userrecord=await Register.findOne({email:email});

       
        // res.send(userrecord);
        if(password===userrecord.password)
        {
            sess=req.session;
            sess.name=userrecord.firstname;
            sess.email=userrecord.email;
            const token=await userrecord.generateAuthToken();
            console.log("token is:"+token);
    
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+100000),
                httpOnly:true,
               // secure:true   --uncomment this while production--
            });
            res.status(201).redirect("home");
          
        }
        else{
            console.log(password);
            console.log(userrecord.password);
            res.send("password are not matching");
            res.redirect('/login');
        }

       
    }
    catch(error)
    {
        console.log(error);
        res.status(400).send("Invalid login details");
        res.redirect('/login');

    }
})

app.get("/home",authenticate,(req,res)=>{
    console.log(req.session);
    if(req.session.email)
    {
    res.render("home",{user:req.session.name,email:req.session.email});
    console.log(`the cookie is : ${req.cookies.jwt}`);

    }
    else
    {
    res.redirect('login');
    }
});


app.get('/logout',async(req,res)=>{
     req.session.destroy((err)=>{
        if(err)
        {
            console.log(err);
        }
        res.redirect('/login');
     });
})

app.get('/showusers',async (req,res)=>{
    try{
   
        const result=await Register.find();
        //res.send(result);
        res.render('showusers',{
            users:result
     });
    }
    catch(error){
        console.log(error);
    }
})


app.get('/updateuser',async(req,res)=>{
    try{
        const id=req.query.id;
        const result=await Register.findOne({_id:id});
        res.render('updateuser',{
            user:result
        });
    }
    catch(error){
        console.log(error);
    }
})

/*app.post('/updateuser',async(req,res)=>{
    try{
        const id=req.query.id;
        const result=await Register.findOneAndUpdate(
            {_id:id},
            {
                $set:{
                firstname: "deepakmaidasani",
                lastname: req.body.lname,
                email: req.body.email,
                gender: req.body.gender,
                phoneno: req.body.phno,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.cpassword
            
             }},
            {new:true},
            (err,doc)=>{
                if(err)
                console.log(err);
                else
                console.log(doc);

            }
            );
        console.log(result);
        res.redirect('showusers');
    }
    catch(error)
    {
        console.log(error);
    }
})*/

app.post('/updateuser/:id',async(req,res)=>{
    try{
        const id=req.params.id;
        console.log(id);
        var myquery = {_id:id};
        var newvalues = { $set: {
                firstname: req.body.fname,
                lastname: req.body.lname,
                email: req.body.email,
                gender: req.body.gender,
                phoneno: req.body.phno,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.cpassword
         } };

         const result=await Register.updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            
        })

    console.log(`${req.body.fname} ${req.body.lname} ${req.body.email}`);
    res.redirect('/showusers');
}

    catch(error){
        console.log(error)
    }
})


app.get('/deleteuser',async(req,res)=>{
    try{
        const id=req.query.id;
        //console.log(`id and type of the id is  ${id}    ${typeof id}`);
        //id=mongoose.Types.ObjectId(id);
        //console.log("id and type of the id is "+ id + typeof id);
       // const result=await Register.findByIdAndDelete({id});
        //res.redirect('/');
        const result=await Register.findByIdAndDelete({_id:id});
        console.log(result);
        res.redirect('/showusers');
    }
    catch(error){

        console.log(error);

    }
})

app.listen(port,()=>{
    console.log(`server is running at ${port}`);
})
