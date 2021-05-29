const admin = require("firebase-admin");
const express = require("express")
const { render } = require("ejs");
const moment = require('moment');
//const path = require('path')
const app = express();
const port = 3000;
const serviceAccount = require("./iot-ornacol-firebase-adminsdk-njbhz-999c50e369.json")

const nodos = ['aaaa::212:4b00:1204:db43',
               'aaaa::212:4b00:1204:daa7']

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-ornacol-default-rtdb.firebaseio.com"
});

app.set("view engine","ejs")
app.use(express.static(__dirname + '/views'));
app.use(express.static("public"))

var db = admin.database();

app.get("/", function(request,response){
  var ref  = db.ref("Nodos/" + nodos[0]);

  ref.once("value", function(snapshot) {  
    let lista_objetos = snapshot.val()    
    response.render("index", {  datos:  lista_objetos,
                                ip:     nodos[0],
                                date:   moment,
                                nodes: nodos
    });   

  });
  
});

app.use(express.urlencoded({
  extended: true
}));

app.listen(port, () => {  
  var dt = new Date();       
  console.log(dt);
  console.log('Runing app.js Listening on port ' + port);
});
