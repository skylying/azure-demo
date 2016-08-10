'use strict';

// Init AMPQ Client
var AMQPClient = require('amqp10').Client;
var Policy = require('amqp10').Policy;
var translator = require('amqp10').translator;
var Promise = require('bluebird');

// Configurations
var protocol = 'amqps';
var eventHubHost = 'ihsuprodhkres026dednamespace.servicebus.windows.net/';
var sasName = 'service'; // No need to use iotowner here
var sasKey = 'Ze/X2aRgyxtqFlK8chfylMWSYu3/8AYuz1LyQ7xbb/I=';
var eventHubName = 'iothub-ehub-demo-hub-39406-c03be5e5af';
var numPartitions = 2;  // This is for F1 free tier, other partitions will be used for other tier

// Filter messages, only reads messages sent to IoT hub after receiver starts running
var filterOffset = new Date().getTime();
var filterOption;
if (filterOffset) {
  filterOption = {
  attach: { source: { filter: {
  'apache.org:selector-filter:string': translator(
    ['described', ['symbol', 'apache.org:selector-filter:string'], ['string', "amqp.annotation.x-opt-enqueuedtimeutc > " + filterOffset + ""]])
    } } }
  };
}

// Create receive address and an AMQP client
var uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + eventHubHost;
var recvAddr = eventHubName + '/ConsumerGroups/$default/Partitions/';

var client = new AMQPClient(Policy.EventHub);

var messageHandler = function (partitionId, message) {
  console.log('Received(' + partitionId + '): ', message.body);
};

var errorHandler = function(partitionId, err) {
  console.warn('** Receive error: ', err);
};

// Create receiver
var createPartitionReceiver = function(partitionId, receiveAddress, filterOption) {
  return client.createReceiver(receiveAddress, filterOption)
    .then(function (receiver) {
      console.log('Listening on partition: ' + partitionId);
      receiver.on('message', messageHandler.bind(null, partitionId));
      receiver.on('errorReceived', errorHandler.bind(null, partitionId));
    });
};

// Connect to Event hub -compatible endpoint and start receiver
client.connect(uri)
  .then(function () {
    var partitions = [];
    for (var i = 0; i < numPartitions; ++i) {
      partitions.push(createPartitionReceiver(i, recvAddr + i, filterOption));
    }
    return Promise.all(partitions);
})
.error(function (e) {
    console.warn('Connection error: ', e);
});

