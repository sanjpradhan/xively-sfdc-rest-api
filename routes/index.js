var express = require('express');
var router = express.Router();

var Promise = require("bluebird");

var nforce = require('nforce');
var org = require('../lib/connection');

/* home page. */
router.get('/', function(req, res, next) {

  org.query({ query: "Select Id, Name, Type, Industry, Rating From Account Order By LastModifiedDate DESC" })
    .then(function(results){
      res.render('index', { records: results.records });
    });

});

/* Display new account form */
router.get('/new', function(req, res, next) {
  res.render('new');
});

/* Creates a new the record */
router.post('/', function(req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Name', req.body.name);
  acc.set('Industry', req.body.industry);
  acc.set('Type', req.body.type);
  acc.set('AccountNumber', req.body.accountNumber);
  acc.set('Description', req.body.description);

  org.insert({ sobject: acc })
    .then(function(account){
      res.redirect('/' + account.id);
    })
});





/* Record detail page */
router.get('/:id', function(req, res, next) {
  // query for record, contacts and opportunities
  Promise.join(
    org.getRecord({ type: 'account', id: req.params.id }),
    org.query({ query: "Select Id, Name, Email, Title, Phone From Contact where AccountId = '" + req.params.id + "'"}),
    org.query({ query: "Select Id, Name, StageName, Amount, Probability From Opportunity where AccountId = '" + req.params.id + "'"}),
    function(account, contacts, opportunities) {
        res.render('show', { record: account, contacts: contacts.records, opps: opportunities.records });
    });
    next();
});

/* Display record update form */
router.get('/:id/edit', function(req, res, next) {
  org.getRecord({ id: req.params.id, type: 'Account'})
    .then(function(account){
      res.render('edit', { record: account });
    });
  next();  
});

/* Display record update form */
router.get('/:id/delete', function(req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Id', req.params.id);

  org.delete({ sobject: acc })
    .then(function(account){
      res.redirect('/');
    });
  next();  
});

/* Updates the record */
router.post('/:id', function(req, res, next) {

  var acc = nforce.createSObject('Account');
  acc.set('Id', req.params.id);
  acc.set('Name', req.body.name);
  acc.set('Industry', req.body.industry);
  acc.set('Type', req.body.type);
  acc.set('AccountNumber', req.body.accountNumber);
  acc.set('Description', req.body.description);

  org.update({ sobject: acc })
    .then(function(){
      res.redirect('/' + req.params.id);
    })
   next(); 
});


/* SKP: REST API FOR Record  */
router.get('/account/:id', function(req, res, next) {
  // query for record, contacts and opportunities
  
  console.log('REQUEST PARAMS : ' + req.params);
  console.log(req.params);
  console.log('ABOUT TO QUERY ACCOUNTS, CONTACTS and OPPORTUNITIES FOR ' + req.params.id);
  /*
  Promise.join(
    org.getRecord({ type: 'account', id: req.params.id }),
    org.query({ query: "Select Id, Name, Email, Title, Phone From Contact where AccountId = '" + req.params.id + "'"}),
    org.query({ query: "Select Id, Name, StageName, Amount, Probability From Opportunity where AccountId = '" + req.params.id + "'"}),
    function(account, contacts, opportunities) {
        //res.render('show', { record: account, contacts: contacts.records, opps: opportunities.records });
        //console.log(account);
        console.log(contacts.records);
        //console.log(opportunities.records);
        //console.log('done');
      //res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
      //res.write(JSON.stringify(account, 0, 4));
      //res.write(JSON.stringify(contacts, 0, 4));
      //res.write(JSON.stringify(opportunities, 0, 4));
      //res.end();
        res.write('{ account : ' + JSON.stringify(account , 0 ,4) + '}');
        //res.write('{ contacts :' + JSON.stringify(contacts.records,0,4)  + '}');
        //res.write('{ opportunities :' + JSON.stringify(opportunities.records,0,4) + '}');
        res.end();
    });
  */




});


/* SKP: REST API FOR Record  */
router.get('/contact/:id', function(req, res, next) {
  // query for record, contacts and opportunities
        console.log('ABOUT TO QUERY CONTACTS: ' + req.params.id);
        res.write('{ contact : ' + req.params.id + '}');
        res.end();
        
});


/* SKP: REST API FOR Record  */
router.get('/contact/:id/cases', function(req, res, next) {
  // query for record, contacts and opportunities
        console.log('ABOUT TO QUERY CONTACTS OPEN CASES: ' + req.params.id);
        res.write('{ cases for  : ' + req.params.id + '}');
        res.end();
});



module.exports = router;
