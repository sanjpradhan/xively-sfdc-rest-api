

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
    
});

/* Display record update form */
router.get('/:id/edit', function(req, res, next) {
  org.getRecord({ id: req.params.id, type: 'Account'})
    .then(function(account){
      res.render('edit', { record: account });
    }); 
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
    next();
    
});

router.get('/account/opportunities/accountId', function(req, res, next) {
  // query for record, contacts and opportunities
        console.log('ABOUT TO QUERY opportunities for account: ' + req.params.accountId);
        res.write('{ opportunities for  : ' + req.params.accountId + '}');
        res.end();
        next();
});
  





/* SKP: REST API FOR Record  */
router.get('/contact/:contactId', function(req, res, next) {
  // query for record, contacts and opportunities
      console.log('ABOUT TO QUERY CONTACTS: ' + req.params.contactId);
      res.write('{ contact : ' + req.params.contactId + '}');
      res.end();
});


/* SKP: REST API FOR Record  */
router.get('/contact/:contactId/cases', function(req, res, next) {
  // query for record, contacts and opportunities
        console.log('ABOUT TO QUERY CONTACTS OPEN CASES: ' + req.params.contactId);
        res.write('{ cases for  : ' + req.params.contactId + '}');
        res.end();
        
});


module.exports = router;
