'use strict';

var iothub = require('azure-iothub');
var connectionString = 'HostName=demo-hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=ZCCa0ulh8H2L3Km8FHMuUdJ7BHD4KdQH5gZzscjHnEk=';

var registry = iothub.Registry.fromConnectionString(connectionString);

// Create new device if it's not in registry
var device = new iothub.Device(null);
device.deviceId = 'trendmicro-demo-device2';
registry.create(device, function(err, deviceInfo, res) {
  if (err) {
    registry.get(device.deviceId, printDeviceInfo);
  }
  if (deviceInfo) {
    printDeviceInfo(err, deviceInfo, res)
  }
});

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    console.log('Device id: ' + deviceInfo.deviceId);
    console.log('Device key: ' + deviceInfo.authentication.SymmetricKey.primaryKey);
  }
}