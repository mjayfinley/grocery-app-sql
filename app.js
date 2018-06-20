const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const promise = require('bluebird')

// telling pg-promise that we will be using bluebird
// as the promise library
let options = {
  promiseLib : promise
}

let pgp = require('pg-promise')(options)
let connectionString = 'postgres://localhost:5432/groceries'
let db = pgp(connectionString)

app.engine('mustache',mustacheExpress())
app.use(bodyParser.urlencoded({extended :false}))
app.use(express.static('public'))
// mustache pages will be inside the views folder
app.set('views','./views')
app.set('view engine','mustache')

app.get('/',function(req,res){

  res.render('newShoppingList')
})

app.get('/newShoppingList',function(req,res){

  res.render('newShoppingList')
})


app.post('/shoppingList', function(req,res){

  let title = req.body.title

  db.none('INSERT INTO shoppinglist(shoppinglistname) VALUES($1)',[title]).then(function(){
    res.redirect('/shoppingList')
  })
})

app.get('/shoppingList',function(req,res){

  db.any('SELECT shoppinglistid,shoppinglistname FROM shoppinglist').then(function(data){
    res.render('shoppingList',{'shoppinglist' : data})
  })
})

app.post('/deleteShoppingList',function(req,res){

  let shoppingListId = req.body.shoppingListId

  db.any('DELETE FROM shoppinglist WHERE shoppinglistid = $1',[shoppingListId]).then(function(){
    res.redirect('/shoppingList')
  })
})

app.get('/groceryList/:shoppinglistid',function(req,res){

  let shoppinglistid = req.params.shoppinglistid

  db.any('SELECT sl.shoppinglistid, sl.shoppinglistname, gi.groceryitemname,gi.quantity,gi.price,gi.groceryitemid FROM shoppinglist sl left JOIN groceryitem gi ON sl.shoppinglistid = gi.shoppinglistid WHERE sl.shoppinglistid = $1',[shoppinglistid]).then(function(data){
    res.render('groceryList',{'groceryitem' : data,'shoppinglistname' : data[0].shoppinglistname, 'shoppinglistid' : data[0].shoppinglistid})
  })
})

app.post('/groceryList', function(req,res){

  let item = req.body.item
  let quantity = req.body.quantity
  let price = req.body.price
  let id = req.body.shoppingListId


  db.none('INSERT INTO groceryitem(groceryitemname, quantity, price,shoppinglistid) VALUES($1,$2,$3,$4)',[item,quantity,price,id]).then(function(){
    res.redirect('/groceryList/'+id+'')
  })
})

app.post('/deleteGroceryItem',function(req,res){

  let groceryItemId = req.body.groceryItemId
  let shoppingListId = req.body.shoppingListId

  db.any('DELETE FROM groceryitem WHERE groceryitemid = $1',[groceryItemId]).then(function(){
    res.redirect('/groceryList/'+shoppingListId+'')
  })
})







app.listen(3000, () => console.log('Example app listening on port 3000!'))
