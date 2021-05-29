const coap = require('coap')
const cron = require('node-cron');
const express = require('express')
var admin = require('firebase-admin');

const app = express()
const port = 3000

//llave SDK json
var serviceAccount = require("/home/pi/nodejs_files/iot-ornacol-firebase-adminsdk-njbhz-999c50e369.json")

//inicializamos e indicamos la base de datos que estaremos manejando
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-ornacol-default-rtdb.firebaseio.com"
}); 

//vector que almacena direcciones de los nodos
const nodos = ['aaaa::212:4b00:1204:db43',
               'aaaa::212:4b00:1204:daa7']
               /*
               'aaaa::212:4b00:1204:dd9b',
               'aaaa::212:4b00:f24:6e80',
               'aaaa::212:4b00:1204:d314',
               'aaaa::212:4b00:f24:a283',
               'aaaa::212:4b00:1204:d638'] */

var lecturas = 0;

/*app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  }) */

//programación de la tarea a cada 10 minutos
//cron.schedule("*/5 * * * *", () => { 
cron.schedule("* * * * *", () => { 

    console.log('Starting node check no° ' + lecturas +' ...')

    //realiza chequeo por cada elemento del vector
    nodos.forEach(element => {

        //solicitudes CoAP a recursos disponibles en el nodo a consultar
        //let req = coap.request('coap://['+ element +']/net/parent/RSSI')
        let req_temp = coap.request('coap://['+ element +']/sen/bar/temp')
        let req_hum = coap.request('coap://['+ element +']/sen/hdc/h')
        let req_luz = coap.request('coap://['+ element +']/sen/opt/light')
        let req_press = coap.request('coap://['+ element +']/sen/bar/pres')
        
        //obtención de fecha y hora
        var dt = new Date();       
        var now_time = dt.toDateString() + ' ' + dt.toTimeString()

        let tem = ''
        let hum = ''
        let luz = ''
        let press = ''

        //referencia tabla nodos y el nodo en cuestión
        var ref = admin.database().ref('Nodos/'+ element);   
        var pushData = ref.push() ;

        try {
            req_temp.on('response',(res) => {
                tem = res.payload.toString()
                if(tem !== ''){                    
                    req_hum.on('response',(res) => {
                        hum = res.payload.toString()
                        if (hum !== '') {
                            req_luz.on('response',(res) => {
                                luz = res.payload.toString()
                                if(luz !== ''){ 
                                    req_press.on('response',(res) => {
                                    press = res.payload.toString()
                                        if(press!==''){
                                             //envío de datos a la tabla
                                            
                                            pushData.set({
                                                Fecha_Hora: dt.valueOf(),
                                                Temperatura: tem,
                                                Humedad: hum,
                                                Luminosidad: luz,
                                                Presión: press
                                            })

                                         /*   app.get('/', (req, res) => {
                                                res.send(dt)
                                                res.send( 'Temperatura ' + element +': ' + tem )
                                                res.send( 'Humedad ' + element +': ' + hum )                                    
                                                res.send( 'Luminosidad ' + element +': ' + luz )
                                                res.send( 'Presión barométrica ' + element + ': ' + press)
                                            }) */

                                            console.log(dt)
                                            console.log( 'Temperatura ' + element +': ' + tem )
                                            console.log( 'Humedad ' + element +': ' + hum )                                    
                                            console.log( 'Luminosidad ' + element +': ' + luz )
                                            console.log( 'Presión barométrica ' + element + ': ' + press)
                                            console.log( 'Datos enviados al servidor')
                                        };                                   
                                    })                                  

                                }                                               
                            })
                        }                                  
                    })
                } 
                               
            })
            req_temp.end()
            req_hum.end()
            req_luz.end()
            req_press.end()      
           
        } 
        
        catch (error) {
            console.log(error)
        }    
    });
    lecturas ++;
});




