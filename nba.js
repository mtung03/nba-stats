'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');
var btoa = require('btoa-atob');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = undefined;

var SKILL_NAME = "Tonight's Games";
var GET_GAMES_MESSAGE = "The games are ";
var HELP_MESSAGE = "You can say tell me a space fact, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
//=========================================================================================================================================
var Leagues = {
    "NBA": 'nba',
    "Basketbal": 'nba',
    "MLB": 'mlb',
    "Baseball": 'mlb',
    "NFL" : 'nfl',
    "Football": 'nfl',
    "NHL": 'nhl',
    "Hockey": 'nhl'
};

var formDate = function (d) {
    return d.replace("-", "");
};

// format specific to the mysportsfeed api
var getSeason = function (l, d) {
    var yr = parseInt(d.slice(0, 5));
    var md = parseInt(d.slice(5));
    switch (l) {
        case 'nba':
            if (md > parseInt('0630')) {// end of playoffs
                return toString(yr) + '-' + toString(yr+1) + '-regular';
            } else if (md < parseInt('0414')) { // start of playoffs
                return toString(yr-1) + '-' + toString(yr) + '-regular';
            } else {
                return toString(yr) + '-playoff';
            }
            break;
    }
};

//=========================================================================================================================================
//Editing anything below this line might break your skill.  
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetGamesIntent');
    },
    'GetGamesIntent': function () {
        var league = "NBA";
        var date = "2017-05-13";
        /*if (this.event.request.intent.slots.League.value) {
            league = this.event.request.intent.slots.League.value;
        } 
        if (this.event.request.intent.slots.Date.value) {
            date = this.event.request.intent.slots.Date.value;
        }*/
        var reqLeague = Leagues[league];
        var reqDate = formDate(date);
        var result = makeRequest(reqLeague, getSeason(reqLeague, reqDate), reqDate, function() {this.emit('AMAZON.CancelIntent')});
        
        var speechOutput = league + " " + date;//"You requested info for " + date + "'s " + league + " games."
        
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, league);
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};

// make an request to the api to return relevant data// request Request 
var makeRequest = (function(league, season, date, err) {
    var path = 'https://www.mysportsfeeds.com/api/feed/pull/' + league + '/' + season + '/daily_game_schedule.json?fordate=' + date;

    var options = {
        hostname: 'www.mysportsfeeds.com',
        method: 'GET',
        path: path,
        headers: {"Authorization":"Basic " + btoa('mtung01:Y3y3pBMY5Ucx')}
    };
 
    const req = https.request(options, (res) => {
        console.log(res.statusCode);
    });
    req.end();
    return "ok";
});
    /*
    ('get', path, params, options, function(err, resp) {
        if (!err && resp.statusCode == 200)
            return resp.body;  
    });
    
});*/
/*    'use strict';
        
    const httpTransport = require('https');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'www.mysportsfeeds.com',
        port: '443',
        path: 'https://www.mysportsfeeds.com/api/feed/pull/' + league + '/' + season + '/daily_game_schedule.json?fordate=' + date,
        method: 'GET',
        headers: {"Authorization":"Basic " + btoa('mtung01:Y3y3pBMY5Ucx')}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            err();
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        err();
    });
    request.write("")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});*/
