'use strict';

var restify = require('restify');
const bodyParser = require('body-parser');
const http = require('https');
var unirest = require('unirest');

var port = process.env.PORT || 8080;

var server = restify.createServer();

server.use(bodyParser.json());


try{    
    server.post('/getWeather', function (request,response) {

            var bodyContent = request.body;

            switch(bodyContent.queryResult.intent["displayName"]){
                  case 'Weather Forecast':
                        if(bodyContent.queryResult.parameters["any"]){
                                
                                var req = unirest("GET", "http://api.openweathermap.org/data/2.5/weather");

                                var location = bodyContent.queryResult.parameters["any"];

                                req.query({
                                    "q": location,
                                    "appid": "7d0f75518b73948011a63cb53e385927"
                                });

                                req.send("{}");
                                req.end(function(res) {
                                    if(res.body['cod']=='404') {
                                        response.setHeader('Content-Type', 'application/json');
                                        var pass = {
                                                      fulfillmentText: 'Sorry, Please enter a specific area like city'
                                                }            
                                        response.send(pass);
                                    } else if(res.body.weather.length > 0) {

                                        let result = res.body;
                                        let weather = result.weather[0].description;
                                        let temp_min = result.main['temp_min'] - 273.15;
                                        let temp_max = result.main['temp_max'] - 273.15;
                                        let wind = result.wind['speed'];
                                        let clouds = result.clouds['all'];
                                        let pressure = result.main['pressure'];
                                        let output = "today in "+ location +": "+ weather + ", temperature from " + Math.round(temp_min)  +" Celsius to " + Math.round(temp_max) + " Celsius , wind " + wind + "m/s. clouds " + clouds + "% " + pressure+" hpa";

                                          response.setHeader('Content-Type', 'application/json', 'charset=utf-16');
                                          var pass = {
                                            fulfillmentText : output
                                          }   
                                          response.send(pass); 
                                    }
                                });

                        }      
                  break;

                  case '5 Day Weather Forecast':
                        if(bodyContent.queryResult.parameters["any"]){
                                        
                            var req = unirest("GET", "http://api.openweathermap.org/data/2.5/forecast");

                            var location = bodyContent.queryResult.parameters["any"];

                            req.query({
                                "q": location,
                                "appid": "7d0f75518b73948011a63cb53e385927"
                            });

                            req.send("{}");
                            req.end(function(res) {
                                if(res.body['cod']=='404') {
                                    response.setHeader('Content-Type', 'application/json');
                                    var pass = {
                                                  fulfillmentText: 'Sorry, Please enter a specific area like city'
                                                }            
                                    response.send(pass);
                                } else if(res.body.list.length > 0) {
                                    var days= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                                    var date = new Date();
                                    var month = date.getUTCMonth() + 1; 
                                    var day = date.getUTCDate();
                                    var year = date.getUTCFullYear();
                                

                                    // get the succeding 4 next days 

                                    var day_pointer = new Date();
                                    let result = res.body.list;
                                    let forecast = '';
                                    var counter = 0;
                                   

                                    for(let x = 0; x<result.length;x++){
                                      var temp = new Date(result[x].dt_txt);

                                            if(days[day_pointer.getDay()+counter]==days[temp.getDay()]){
                                                var temp_date = temp.getMonth() + 1 +"/" + temp.getDate() +"/"+ temp.getFullYear();
                                                forecast +=  days[temp.getDay()] + " " + temp_date + " : " +  result[x].weather[0].description+" \n\n ";
                                                counter = counter + 1;
                                            }
                                    }
                                    /*  
                                    let result = res.body;
                                    let weather = result.weather[0].description;
                                    let temp_min = result.main['temp_min'] - 273.15;
                                    let temp_max = result.main['temp_max'] - 273.15;
                                    let wind = result.wind['speed'];
                                    let clouds = result.clouds['all'];
                                    let pressure = result.main['pressure'];
                                    let output = "today in "+ location +": "+ weather + ", temperature from " + Math.round(temp_min)  +"C to " + Math.round(temp_max) + "C , wind " + wind + "m/s. clouds " + clouds + "% " + pressure+" hpa";

                                    response.setHeader('Content-Type', 'application/json', 'charset=utf-16');
                                    var pass = {
                                        fulfillmentText : output
                                    }   
                                    response.send(pass); */
                                    response.setHeader('Content-Type', 'application/json','text/html');
                                    var pass = {
                                        fulfillmentText : forecast
                                    }   
                                    response.send(pass);
                                }
                            });

                    }      
                  break;
            }
    })

}catch(err){
    console.log(err);
}

server.get('/try', function (req,res){
     res.send('Hello world');
})

server.listen(port, function() {
    console.log('Now connected to PORT');
})