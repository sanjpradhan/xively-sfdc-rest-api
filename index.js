var express = require('express');
var bodyParser = require('body-parser');
var nforce = require('nforce');



var Promise = require("bluebird");
var util = require('util')
var async = require('async')
 




var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


//app.use(express.bodyParser());
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Remove issues due to CORS - basically this end point is open to all origins, etc...
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var org = nforce.createConnection({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'http://localhost:3001/oauth/_callback'
});

var oauth;
org.authenticate({ username: process.env.USERNAME, password: process.env.PASSWORD }, function(err, resp){
  if(err) {
    console.log('Salesforce Error: ' + err.message);
  } else {
    console.log('Validated Salesforce Access Token: ' + resp.access_token);
    oauth = resp;
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/api/providers', function(req, res) {

  var q = "SELECT Address__c,CreatedById,CreatedDate,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Name,OwnerId,Services__c,SystemModstamp FROM Provider__c";

  org.query({ query: q, oauth: oauth }, function(err, resp) {
    //console.log(resp.records);
      if(err){
        console.log('/api/providers had an Error', err);
      }else{
        res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
        res.write(JSON.stringify(resp, 0, 4));
        res.end();
      }
  });

});

app.post('/api/providers', function(req, res) {
  //var itemId = req.params.id;

  console.log(req.body);

  var provAddress = req.body.address;
  var provName = req.body.name;

      var cardInteract = nforce.createSObject('Provider__c');
      cardInteract.set('Address__c', provAddress);
      cardInteract.set('Name', provName);

      console.log('--------');
      console.log(cardInteract);
        console.log('--------');

      org.insert({ sobject: cardInteract, oauth: oauth }, function(err, resp) {
        console.log(resp);
        res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
        res.write(JSON.stringify(resp, 0, 4));
        res.end();
      });

});

app.get('/api/accounts', function(req, res) {

  //var q = "SELECT AccountNumber,AccountSource,Active__c,AnnualRevenue,BillingAddress,BillingCity,BillingCountry,BillingLatitude,BillingLongitude,BillingPostalCode,BillingState,BillingStreet,CleanStatus,CreatedById,CreatedDate,CustomerPriority__c,DandbCompanyId,Description,DunsNumber,Fax,Id,Industry,IsCustomerPortal,IsDeleted,IsPartner,Jigsaw,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,MasterRecordId,NaicsCode,NaicsDesc,Name,NumberOfEmployees,NumberofLocations__c,OwnerId,Ownership,ParentId,Phone,PhotoUrl,Rating,ShippingAddress,ShippingCity,ShippingCountry,ShippingLatitude,ShippingLongitude,ShippingPostalCode,ShippingState,ShippingStreet,Sic,SicDesc,Site,SLAExpirationDate__c,SLASerialNumber__c,SLA__c,SystemModstamp,TickerSymbol,Tradestyle,Type,UpsellOpportunity__c,Website,YearStarted FROM Account";
  var q = "SELECT AccountNumber,AnnualRevenue,BillingAddress,BillingCity,BillingCountry,BillingLatitude,BillingLongitude,BillingPostalCode,BillingState,BillingStreet,CleanStatus,CreatedById,CreatedDate,DandbCompanyId,Description,DunsNumber,Fax,Id,Industry,IsCustomerPortal,IsDeleted,IsPartner,Jigsaw,JigsawCompanyId,LastActivityDate,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,MasterRecordId,NaicsCode,NaicsDesc,Name,NumberOfEmployees,OwnerId,Ownership,ParentId,Phone,PhotoUrl,Rating,ShippingAddress,ShippingCity,ShippingCountry,ShippingLatitude,ShippingLongitude,ShippingPostalCode,ShippingState,ShippingStreet FROM Account"; 
  
  org.query({ query: q, oauth: oauth }, function(err, resp) {
    //console.log(resp.records);
    if(err){
      console.log('api/accounts has an error',err);  
    }else{
      res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
      res.write(JSON.stringify(resp, 0, 4));
      res.end();
    }
  });

});




/* Record detail page */

app.get('/api/accounts/:id', function(req, res) {
  
  var resp = req.params.id ;

  console.log(req.params);
  res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
  res.write(JSON.stringify(resp, 0, 4));
   res.write(JSON.stringify('Sanjay', 0, 4));
  res.end();
  // query for record, contacts and opportunities
  /*
  Promise.join(
    org.getRecord({ type: 'account', id: req.params.id }),
    org.query({ query: "Select Id, Name, Email, Title, Phone From Contact where AccountId = '" + req.params.id + "'"}),
    org.query({ query: "Select Id, Name, StageName, Amount, Probability From Opportunity where AccountId = '" + req.params.id + "'"}),
    function(account, contacts,opportunities)  {
      //res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
      //res.write(JSON.stringify(account, 0, 4));
      //res.write(JSON.stringify(contacts, 0, 4));
      //res.write(JSON.stringify(opportunities, 0, 4));
      //res.end();

      console.log('SKP: Response is:' , res);


    });  
    */
    /*
    function(account, contacts, opportunities) {
        res.render('show', { record: account, contacts: contacts.records, opps: opportunities.records });
    });
   */
});




