/******************************************************************************
 \file app.js
 \author Soulaymane Lamrani, David Pellissier
 \date 18.06.2021

 Fichier détaillant le fonctionnement d'un auditeur
 Aucune originalité, mais je ne suis pas pas très familier avec JavaScript(bis)
 ****************************************************************************/

// Déclaration de nos packages et Node.js API
const dgram  = require('dgram');
const net    = require('net');
const moment = require('moment');
const {UDP_PORT, TCP_PORT, MULTICAST_ADDRESS, TCP_ADDRESS} = require('./protocol');
const INACTIVITY_TIME = 5; //seconds
const INTERVAL_TIME = 1000; //milliseconds

const orchestra = new Map();

const instrumentsSounds = new Map([
    ["ti-ta-ti", "piano"], //wzf ?
    ["pouet", "trumpet"], //heh, classic
    ["trulu", "flute"], //chapeau pointu
    ["gzi-gzi", "violin"], //Hurdy-gurdy ?
    ["boum-boum", "drum"] //et badabim
]);

const udpSocket = dgram.createSocket('udp4');
const tcpServer = net.createServer();

// On se bind au multicast du musician
udpSocket.bind(UDP_PORT, function (){
    console.log("Binding to the udp multicast");
    udpSocket.addMembership(MULTICAST_ADDRESS);
});

// À chaque message du musician, on l'ajoute dans l'orchestre ou on met à jour son activité
udpSocket.on('message', (msg) => {
    const musician = JSON.parse(msg.toString('utf-8'));

    if (orchestra.has(musician.uuid)) {
       orchestra.get(musician.uuid).lastHeard = moment().format();
       console.log(`Musician updated ${musician.uuid}`);
   } else {
       orchestra.set(musician.uuid, {
           "uuid":        musician.uuid,
           "instrument":  instrumentsSounds.get(musician.sound),
           "lastHeard":   moment().format(),
           "activeSince": moment().format()
       });
       console.log(`New musician added ${musician.uuid}`);
   }
});

// Toutes les secondes, on vérifie que les musicians sont actifs depuis au plus 5s
setInterval(() =>{
    orchestra.forEach((intrument, uuid) => {
        if (moment().diff(moment(intrument.lastHeard), 's') >= INACTIVITY_TIME) {
            orchestra.delete(uuid);
            console.log(`Musician ${uuid} removed from orchestra`);
        }
    });
}, INTERVAL_TIME);

// Serveur TCP qui nous donnera les informations à chaque connexion
tcpServer.on('connection', (socket) => {
   let payload = [];

   orchestra.forEach((instrument, uuid) => {
        payload.push({
           "uuid": uuid,
           "instrument": instrument.instrument,
           "activeSince": instrument.activeSince
        });
   });

   socket.write(JSON.stringify(payload, null, 2));
   socket.write("\n");
   socket.end();
});

// On lance le serveur TCP sur le bon port et la bonne adresse
tcpServer.listen(TCP_PORT, TCP_ADDRESS);
