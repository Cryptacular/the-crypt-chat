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
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
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
        session.send('Not sure what to do? I am merely a chat bot, so I have limited responses! You can ask for details about me, ask about blog posts, anything at all really!');
    }
]);

dialog.matches('Greeting', [
    function(session, args) {
        session.beginDialog('/profile');
    }
]);

dialog.matches('GetName', [
    function(session, args) {
        session.beginDialog('/name');
    }
]);

dialog.matches('ChangeName', [
    function(session, args) {
        session.beginDialog('/changename');
    }
]);

bot.dialog('/profile', [
    function (session) {
        if (!session.userData.name) {
            builder.Prompts.text(session, 'Hi, I\'m Nick! What\'s your name?');
        } else {
            session.send('Welcome back, %s!', session.userData.name);
            session.endDialog();
        }
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Awesome, nice to meet you %s!', session.userData.name);
        session.endDialog();
    }
]);

bot.dialog('/changename', [
    function (session) {
        builder.Prompts.text(session, 'No problem, what\'s your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Awesome, nice to meet you %s!', session.userData.name);
        session.endDialog();
    }
]);

bot.dialog('/name', [
    function (session) {
        session.send('My master\'s name is %s, and I am his %s Bot! We bear a striking resemblance...', "Nick", "Nick");
    }
]);

dialog.onDefault(builder.DialogAction.send("Sorry, what? I'm a bot and only represent a fraction of my master's intelligence and incredible wit. I've also been trained to love my master, so forgive me 😉"));