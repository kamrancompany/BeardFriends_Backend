const express= require('express')
const bodyParser=require('body-parser')
const cors=require("cors")
const app=express()

// const routes=require('./routes/routes')                                                  
require('dotenv').config()
require('./db/config')


app.use(express.json())
app.use(bodyParser.json())
app.use(cors());

app.use('/api/auth/', require('./routes/routes'));

app.use(express.static("/uploads"));
app.use("/uploads", express.static(__dirname + "/uploads"));

const PORT = parseInt(process.env.PORT);


app.listen(PORT, ()=>{
      
    console.log(`Server is running on Port ${PORT}`)
})
