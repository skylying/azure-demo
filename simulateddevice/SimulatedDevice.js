'use strict';

var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = 'HostName=demo-hub.azure-devices.net;DeviceId=myFirstDevice;SharedAccessKey=QRXoTx+Y9x2rFVvak++Agb/AnkSjis1yDWbA0zeddEM=';
var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Connection callback
var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');

    // Create a message and send it to the IoT Hub every second
    setInterval(function(){
        var windSpeed = 10 + (Math.random() * 4);
        var data = JSON.stringify({ deviceId: 'mydevice', windSpeed: windSpeed });
        var message = new Message(data);
        console.log("Sending message: " + message.getData());
        client.sendEvent(message, printResultFor('send'));
    }, 2000);
  }
};

// Open connection
client.open(connectCallback);