

var express = require('express');
var router = express.Router();

var Promise = require("bluebird");

var nforce = require('nforce');
var org = require('../lib/connection');


router.get('/', function(req, res, next) {
    res.redirect('/account');
    res.end();  
  
});


/* SKP:: Get a list of your accounts for the Org. */
router.get('/account', function(req, res, next) {

  org.query({ query: "Select Id, Name, Type, Industry, Rating From Account Order By LastModifiedDate DESC" })
    .then(function(results){
      res.write('{ "Accounts" : ' + JSON.stringify(results , 0 ,4) + '}');
      res.end();  
    });
});


/* Creates a new the record */
router.post('/account/new', function(req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Name', req.body.name);
  acc.set('Industry', req.body.industry);
  acc.set('Type', req.body.type);
  acc.set('AccountNumber', req.body.accountNumber);
  acc.set('Description', req.body.description);

  org.insert({ sobject: acc })
    .then(function(account){
      res.write('{ "AccountCreated" : ' + JSON.stringify(account , 0 ,4) + '}');
      res.end(); 
    })
});

/* Display record update form */
router.get('/:id/delete', function(req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Id', req.params.id);

  org.delete({ sobject: acc })
    .then(function(account){
      res.redirect('/');
    });
    
});

/* Updates the record */
router.post('/account/:id', function(req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Id', req.params.id);
  acc.set('Name', req.body.name);
  acc.set('Industry', req.body.industry);
  acc.set('Type', req.body.type);
  acc.set('AccountNumber', req.body.accountNumber);
  acc.set('Description', req.body.description);

  org.update({ sobject: acc })
    .then(function(){
      res.redirect('/account/' + req.params.id);
    })
   next();
});


/* SKP: REST API FOR Record  */
router.get('/account/:accountId', function(req, res, next) {
  // query for record, contacts and opportunities
  
  
  console.log(req.params);
  console.log('ABOUT TO QUERY ACCOUNTS, CONTACTS and OPPORTUNITIES FOR ' + req.params.accountId);
  
  Promise.join(
    org.getRecord({ type: 'account', id: req.params.accountId }),
    org.query({ query: "Select Id, Name, Email, Title, Phone From Contact where AccountId = '" + req.params.accountId + "'"}),
    org.query({ query: "Select Id, Name, StageName, Amount, Probability From Opportunity where AccountId = '" + req.params.accountId + "'"}),
    function(account, contacts, opportunities) {
        res.write('{ "account" : ' + JSON.stringify(account , 0 ,4) + ',');
        res.write('  "contacts" : ' + JSON.stringify(contacts.records,0,4)  + ',');
        res.write('  "opportunities" :' + JSON.stringify(opportunities.records,0,4) + '}');
        res.end();
    });
  
});

router.get('/account/:accId/opportunities', function(req, res, next) {
  // query for opportunities for accountid
        console.log('ABOUT TO QUERY opportunit ies for account: ' + req.params.accId);
        org.query({ query: "Select Id, Name, StageName, Amount, Probability From Opportunity where AccountId = '" + req.params.accId + "'"})
        .then(function(opportunities){
          res.write('{ "opportunities" : ' + JSON.stringify(opportunities , 0 ,4) + '}');
          res.end();  
        });
              
});
  
router.get('/account/:accId/contacts', function(req, res, next) {
  // query for opportunities for accountid
        console.log('ABOUT TO QUERY Contacts for Account: ' + req.params.accId);
        org.query({ query: "Select Id, Name, Email, Title, Phone From Contact where AccountId = '" + req.params.accId + "'"})
        .then(function(contacts){
          res.write('{ "contacts" : ' + JSON.stringify(contacts , 0 ,4) + '}');
          res.end();  
        });
              
});


/** XIVELY SPECIFIC ROUTES **/

router.get('/xively/devices',function(req,res,next){
        
        console.log('ABOUT TO QUERY ALL XIVELY OBJECTS');

        var qry = 'SELECT DeviceId__c, ErrorCode__c ,OrgId__c , Sensor__c, Unit__c, Value__c, Action__c from XivelyStream__C';
        
        org.query({ query: qry })
        .then(function(results){
            res.write('{ "XivelyStreams" : ' + JSON.stringify(results , 0 ,4) + '}');
            res.end();  
        });
       
});

router.get('/account/:accId/devices', function(req, res, next) {
  // query for record, contacts and opportunities
      console.log('ABOUT TO QUERY ACCOUNT ASSSETS/DEVICES: ' + req.params.contactId);
      res.write('{ Assets : ' + req.params.accId + '}');
      res.end();
});

router.post('/xively/newstream', function(req, res, next) {
  
  console.log('ABOUT TO CREATE NEW XIVELYSTREAM RECORD');
  console.log(req.body);


  var xivelyDS = nforce.createSObject('XivelyStream__c');
  xivelyDS.set('Name', req.body.name);
  xivelyDS.set('DeviceId__c', req.body.deviceId);
  xivelyDS.set('ErrorCode__c', req.body.erorrCode);
  xivelyDS.set('OrgId__c', req.body.orgId);
  xivelyDS.set('Sensor__c', req.body.sensor);
  xivelyDS.set('Value__c', req.body.value);
  xivelyDS.set('Unit__c', req.body.unit);
  xivelyDS.set('Action__c', req.body.action);


  org.insert({ sobject: xivelyDS })
    .then(function(xivelyNewObject){
      res.write('{ "XivelyStream" : ' + JSON.stringify(xivelyNewObject , 0 ,4) + '}');
      res.end();  
    })
    .catch(function(error){
      console.log('INSIDE ERROR HANDLER SECTION - /xively/newstream');
      console.log(error);
    })
    
});




module.exports = router;
