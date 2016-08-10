var crypto = require('crypto');

var generateSasToken = function(resourceUri, signingKey, policyName, expiresInMins) {
  resourceUri = encodeURIComponent(resourceUri.toLowerCase()).toLowerCase();

  // Set expiration in seconds
  var expires = (Date.now() / 1000) + expiresInMins * 60;
  expires = Math.ceil(expires);
  var toSign = resourceUri + '\n' + expires;

  // using crypto
  var decodedPassword = new Buffer(signingKey, 'base64').toString('binary');
  const hmac = crypto.createHmac('sha256', decodedPassword);
  hmac.update(toSign);
  var base64signature = hmac.digest('base64');
  var base64UriEncoded = encodeURIComponent(base64signature);

  // construct autorization string
  var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
  + base64UriEncoded + "&se=" + expires;
  if (policyName) token += "&skn="+policyName;
  // console.log("signature:" + token);
  return token;
};