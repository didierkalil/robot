/**
 * Bot para whatsapp
 * web: https://kuatroestrellas.github.io/blog/
 * responde al hola mundo con un mensaje
 * requiere nodejs v12 o superior y las librerias qrcode-terminal y whatsapp-web.js
 * npm i qrcode-terminal whatsapp-web.js
**/


const express = require('express');
const app = express();
const morgan = require('morgan');
const qrcodewin = require('qrcode');

//sentting server
app.set('port',process.env.port || 3000);

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//routes
// app.get('/', (req,res) => {    
//     const codi = qrcodewin.toDataURL("dfdf");
//     const htmlcontent = `<div style="display:flex; justify-content:center; algin=items;center;">
//     <h2>titulo</h2>
//     <img src = "${codi}"></img></div>`;
// res.send(htmlcontent);
// });


//starging server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${3000}`);
})


const { MessageMedia } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');




//Crea una sesión con whatsapp-web y la guarda localmente para autenticarse solo una vez por QR
const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});

//Genera el código qr para conectarse a whatsapp-web
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});

    app.get('/', async function(req,res) {   
              
        const codi = await qrcodewin.toDataURL(qr);
        const htmlcontent = `<div style="display:flex; justify-content:center; algin=items;center;">
        <img src = "${codi}"></img></div>`;
        
    res.send(htmlcontent);
    });
   
});



//Si la conexión es exitosa muestra el mensaje de conexión exitosa
client.on('ready', () => {
    console.log('Conexion exitosa');

    client.getChats().then(chats => {
        //console.log(chats[0]);

  
            //servicio post
            app.post('/enviar', (request,res) => {


                console.log(request.body.telefonos);
                const arrayjson = request.body.telefonos;

                arrayjson.forEach(element => {

                    console.log(element.numero);
                    console.log(request.body.link.ruta);
                    console.log(request.body.etiqueta.nombre);
                   

                     (async () => {  
                    
                     
                     const pathparts = request.body.link.ruta.split(".");
                     const extension = pathparts.pop();
                     console.log(extension);

                     
                      if (extension == "pdf" || extension == "xlsx") 
                        {
                            const url = request.body.link.ruta;
                            const myGroup2 = chats.find((chat) => chat.name === element.numero);
                            const media = await MessageMedia.fromUrl(url); 
                            client.sendMessage(myGroup2.id._serialized, media);
                            client.sendMessage(myGroup2.id._serialized, request.body.etiqueta.nombre );
                        } else {
                            const url = request.body.link.ruta;
                            const myGroup2 = chats.find((chat) => chat.name === element.numero);
                            const media = await MessageMedia.fromUrl(url); 
                            client.sendMessage(myGroup2.id._serialized, media,  {caption: request.body.etiqueta.nombre} );
                        }
                    
                    })();



                });


               
            
                res.send("recibido");   
                });



        });
        
   
});


//Aquí sucede la magia, escucha los mensajes y aquí es donde se manipula lo que queremos que haga el bot
client.on('message', message => {
    console.log(message.body);
	if(message.body === 'pablito clavo un clavito') {
		client.sendMessage(message.from, 'Hola soy un bot, mi creador esta ocupado ayudando a gohan a salvar la tierra');
	}
});

client.initialize();