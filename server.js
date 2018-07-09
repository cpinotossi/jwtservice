  /**
   * Module dependencies.
   */

  const express = require('express');
  const jwtSimple = require('jwt-simple');
  const joi = require('joi');
  require('dotenv').config();


 //Define Website JWT schema via Joi
 const iecSchemaJoi = joi.object().keys({
    hd: joi.string(),
    jwt: joi.string(),
    eMail: joi.string().email(),
    jwtKeyName: joi.string().required(),
    cookieName: joi.string(),
    hostname: joi.string()
  });



  //instantiate an express object
  const app = express();
  //Sample URL: http://127.0.0.1/demo/iec/jwt/generate?hd=akamai.com&email=cpinotos@akamai.com&jwtkeyname=edgegate_iec_jwt&cookiename=jwtiec&hostname=hebe.io
  app.get('/demo/iec/jwt/generate', (req, res) => {
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
            "cookiename": '.'+value.cookieName,
            "hostname": value.hostname
          }
          res.send(result);
        }
      });
  })
/*Sample URL: http://127.0.0.1/demo/iec/jwt/validate?hd=akamai.com&jwtkeyname=edgegate_iec_jwt&jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJKV1QuSU8iLCJzdWIiOiJJRUMgQmV0YSBKYW0iLCJuYW1lIjoiQ2hyaXN0aWFuIiwiY2xpZW50SUQiOiJjbGllbnQwMDAxIiwiYXV0aEdyb3VwcyI6InB1YnM7c3VicyJ9.SpF_QK4HpzUhJv8zsUmKs1HLme_0IOkDq0ajbQrtTyKjldI_unrCIrCcRiOdx2UDcxmStxKHAVwFedPQcb8bufw6Uf5wx9w7yDIvgZ9bwIh_bu7RRRw3P0qcnz-0Dh1_AVRvMDd3YSP2BJD4rzOt4WVlB4tB2mJMHha1KPzOhybPk1ugiuQLdtaS7isT1Lba5nK71jru0gCITtBtpoJtC_rw7ytCM_tFhRfvHIIOgZjv8wuc6OU_NiK4mce3nfLaDzePObvYJWLuuXWGnBsFIBauP5phXyddeJqJE9b-E89XDxjjAO4DUepQ1yAc_giQrax1t1GSQ7ijp5qj8oa5FQ
http://127.0.0.1/demo/iec/jwt/validate?hd=akamai.com&jwtkeyname=eXdgegate_iec_jwt&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJoZWJlLmlvIiwiY2xpZW50SUQiOiJjcGlub3Rvc0Bha2FtYWkuY29tIiwiYXV0aEdyb3VwcyI6InB1YnM7c3VicyJ9.pI7ISglqHSNO_02sNDeUY3sKlcP2XTN3TbAbwdvO43ku5zxVu_GcDbDjm3VJjj4Dyeq9bOWLM1E3IrVAvbUP7qVkKqTIwtjAYNCCd6hlOE37igIjg0NbdcoUBB_SAAKKSpCma0gSQVeAtQEIqdPZ0UOW_nYEbFFqrWdRJsFlCHRol9xd6bTa7nDFMX_7l_w4QCW508DyOQdoUgD9KR367N982-vZG5ihALfpnqsYeoxphnEwHFglXg7TpoPDID-mEGZ89n2-kJ54Af2ByOvd7HX5oTYMqXMtwka3kXKbPeLo2a_IrAVIGkMMX4B1oSooRiL5jXdtKZCCLDTXWpOwPw
http://127.0.0.1/demo/iec/jwt/validate?hd=akamai.com&jwtkeyname=edgegate_iec_jwt_pub&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJoZWJlLmlvIiwiY2xpZW50SUQiOiJjcGlub3Rvc0Bha2FtYWkuY29tIiwiYXV0aEdyb3VwcyI6InB1YnM7c3VicyJ9.pI7ISglqHSNO_02sNDeUY3sKlcP2XTN3TbAbwdvO43ku5zxVu_GcDbDjm3VJjj4Dyeq9bOWLM1E3IrVAvbUP7qVkKqTIwtjAYNCCd6hlOE37igIjg0NbdcoUBB_SAAKKSpCma0gSQVeAtQEIqdPZ0UOW_nYEbFFqrWdRJsFlCHRol9xd6bTa7nDFMX_7l_w4QCW508DyOQdoUgD9KR367N982-vZG5ihALfpnqsYeoxphnEwHFglXg7TpoPDID-mEGZ89n2-kJ54Af2ByOvd7HX5oTYMqXMtwka3kXKbPeLo2a_IrAVIGkMMX4B1oSooRiL5jXdtKZCCLDTXWpOwPw

*/
  app.get('/demo/iec/jwt/validate', (req, res) => {
    joi.validate({
      hd: req.query.hd,
      jwt: req.query.jwt,
      jwtKeyName: req.query.jwtkeyname,
      cookieName: req.query.cookiename}, iecSchemaJoi, function (err, value) {
        if(err){
          console.log("err"+err);
          //Access Denied
          res.status(403);
          res.send();
        }else{
          console.log(`value = ${JSON.stringify(value, null, 4)}`);
          //retrieve JWT Key by jwtname from .env
          var jwtKey = process.env[value.jwtKeyName].replace(/\\n/g, '\n');
          // decode
          var jwtPayload = jwtSimple.decode(value.jwt, jwtKey);
          console.log("jwtPayload:"+jwtPayload);

          //validate if query parameter hd is part of jwtPayload email claim.
          var re = new RegExp('@'+value.hd);
          if(jwtPayload.clientID.match(re)){
            //send JWT in response
            res.status(200);
          }else{
            res.status(302);
          }
          res.type('application/json');
          res.send();
        }
      });
  })

  var http = require("http");
  var server = http.createServer(app);

  //Start Server
  var port = process.env.PORT || 80;
  server.listen(port);
