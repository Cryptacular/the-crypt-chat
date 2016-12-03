"use strict";

var _ = require('lodash');
var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create bot and bind to console
var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog.
var model = 'https://api.projectoxford.ai/luis/v2.0/apps/cc800860-f09f-4152-8fcb-d375d84efeb6?subscription-key=ffc91179b3224836bec8c38d314bd548&verbose=true';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Add intent handlers
dialog.matches('Help', [
    function (session, args) {
        session.send('You need some help, huh?');
    }
]);

dialog.matches('Greeting', [
    function (session, args) {
        session.send('Hey hey!');
        session.endDialog();
    }
]);

dialog.matches('GetDetails', [
    function(session, args) {
        let entities = [];
        for (let i = 0; i < args.entities.length; i++) {
            entities.push(args.entities[i].entity)
        }

        if (_.forIn(['who'], entities)) {
            if (session.userData.nameKnown) {
                session.send('Haven\'t you asked me this already? Anyway, I\'m Nick, nice to meet you! Again...');
            } else {
                session.send('I\'m Nick, nice to meet you!');
                session.userData.nameKnown = true;
            }
            session.endDialog();
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("Sorry, what? I'm a bot and only represent a fraction of my master's intelligence and incredible wit. I've also been trained to love my master, so forgive me."));