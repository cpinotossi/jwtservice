  /**
   * Module dependencies.
   */

  const express = require('express');
  const jwtSimple = require('jwt-simple');
  const joi = require('joi');
  require('dotenv').config();


 //Define Website JWT schema via Joi
 const iecSchemaJoi = joi.object().keys({
    hd: joi.string().required(),
    eMail: joi.string().email().required(),
    jwtKeyName: joi.string().required(),
    cookieName: joi.string().required(),
    hostname: joi.string().required()
});
//.with('hd', 'eMail', 'name', 'jwtName', 'jwtCookieName', 'hostname');

  //instantiate an express object
  const app = express();
  //Sample URL: http://127.0.0.1/demo/iec/jwt/generate/iec?hd=akamai.com&email=cpinotos@akamai.com&jwtkeyname=edgegate_iec_jwt&cookiename=jwt.iec&hostname=hebe.io

  app.get('/demo/iec/jwt/generate/iec', (req, res) => {
    joi.validate({ hd: req.query.hd,
      eMail: req.query.email,
      jwtKeyName: req.query.jwtkeyname,
      cookieName: req.query.cookiename,
      hostname: req.query.hostname}, iecSchemaJoi, function (err, value) {
        if(err){
          console.log("err"+err);
          //Access Denied
          res.status(403);
          res.send();
        }else{
          console.log(`value = ${JSON.stringify(value, null, 4)}`);
          //Define jwt alg to be used:
          var jwtHeader = {
            "algorithm": "RS256"
          };
          //retrieve JWT Key by jwtname from .env
          var jwtPrivateKey = process.env[value.jwtKeyName].replace(/\\n/g, '\n');
          //generate JWT Payload
          var jwtPayload = {
            "iss": value.hostname,
            "clientID": value.eMail,
            "authGroups": "pubs;subs"
          };
          var jwt = jwtSimple.encode(jwtPayload, jwtPrivateKey, jwtHeader.algorithm);
          console.log("\n");
          console.log(`jwt = ${jwt}`);

          //send JWT in response
          res.status(200);
          res.type('application/json');
          res.cookie(value.cookieName, jwt,{ domain: value.hostname, path: '/' })
          var result = {
            "jwt": jwt,
            "jwtkeyname": value.jwtKeyName,
            "cookiename": value.cookieName,
            "hostname": value.hostname
          }
          res.send(result);
        }
      });
  })



  app.use(express.static(__dirname + '/public'));
  var http = require("http");
  var server = http.createServer(app);

  //Start Server
  var port = process.env.PORT || 80;
  server.listen(port);
