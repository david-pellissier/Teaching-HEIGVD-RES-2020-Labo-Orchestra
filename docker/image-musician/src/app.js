/******************************************************************************
 \file app.js
 \author Soulaymane Lamrani, David Pellissier
 \date 18.06.2021

 Fichier détaillant le fonctionnement d'un instrument
 Aucune originalité, mais je ne suis pas pas très familier avec JavaScript
 ****************************************************************************/

// Déclaration de nos packages adorés (à peu près)
const dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');
const {PORT, MULTICAST_ADDRESS} = require('./protocol');

// Et le son fut
const instrumentsSounds = new Map([
    ["piano", "ti-ta-ti"], //wzf ?
    ["trumpet", "pouet"], //heh, classic
    ["flute", "trulu"], //chapeau pointu
    ["violin", "gzi-gzi"], //Hurdy-gurdy ?
    ["drum", "boum-boum"] //et badabim
]);

// Récup de l'instrument depuis les arguments de la ligne de commande et détermination du son à produire
const instrument = process.argv[2];
const sound = instrumentsSounds.get(instrument) || null;

// Le son fût-il vraiment ?
if (sound == null) {
    console.error("ERROR: THIS IS NOT AN INTRUMENTS ! REEEEEEEE");
    process.exit(1); // On quitte l'exécution parce qu'on ne devrait pas faire du son vide
}

const client = dgram.createSocket('udp4'); // Création du client udp
const uuid = uuidv4(); // On fabrique un uuid (compatible rfc toussa

// Et on envoie le payload toutes les 1s, comme spécifié dans le cdc
setInterval(() => {
    client.send(
        JSON.stringify({uuid: uuid, sound: sound}),
        PORT,
        MULTICAST_ADDRESS,
        (error => {
            if (error)
                console.error(error);
            else
                console.log(`Sending message : {uuid:${uuid}, sound:${sound}}`);
        })
    );
}, 1000);
