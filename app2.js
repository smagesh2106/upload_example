const express = require("express");
const app  = express();
const multer = require("multer");

const middleware = express.urlencoded({
    extended: false,
});


const upload = multer({dest:"files/"});
		      
		      //app.post("/uploads", middleware, (req, res) =>{
app.post("/uploads", upload.any(), (req, res) =>{
    console.log( req.body);
    console.log( req.files );

    
    res.send(200);
});


app.listen(4001);
