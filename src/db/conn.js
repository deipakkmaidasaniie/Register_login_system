const mongoose=require('mongoose');mongoose.connect("mongodb://localhost:27017/reglog",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
console.log("connection success")
}).catch((err)=>{
    console.log(err)

})