const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const nedb = require('nedb')
const urlEncodedParser = bodyParser.urlencoded({ extended: true })
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const nedbSessionStore = require('nedb-session-store')
const bcrypt = require('bcrypt')
const middlewares = require('./middlewares')
const axios = require('axios')
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

const requireAuthenticated = middlewares.requireAuthenticated
const requireNotAuthenticated = middlewares.requireNotAuthenticated

const nedbInitializedStore = nedbSessionStore(expressSession)

const upload = multer({ 
  dest: 'public/uploads'
})

var database = new nedb({
  filename: 'database.txt',
  autoload: true
})

var usersDatabase = new nedb({
  filename: 'users.txt',
  autoload: true
})

var likesDatabase = new nedb({
  filename: 'likes.txt',
  autoload: true
})

var app = express()

const sessionStore = new nedbInitializedStore({
  filename: "sessions.txt"
})

app.use(expressSession(
  {
    store: sessionStore,
    cookie: { 
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    },
    secret: "supersecret123"
  }
))

app.use(express.static('public'))
app.use(urlEncodedParser)
app.use(cookieParser())
app.set('view engine', 'ejs')

app.get('/logout', requireAuthenticated, function(request, response) {
  delete request.session.loggedInUser
  response.redirect('/login')
})

app.get('/register', requireNotAuthenticated, function(request, response) {
  response.render('register', {})
})

app.post('/signup', requireNotAuthenticated, upload.single('profilePicture'), function(request, response) {
  var hashedPassword = bcrypt.hashSync(request.body.password, 10)
  
  var data = {
    username: request.body.username,
    fullname: request.body.fullName,
    password: hashedPassword
  }

  if (request.file) {
    data.profilePicture = "/uploads/" + request.file.filename
  }

  usersDatabase.insert(data, function(error, insertedData) {
    console.log(insertedData)
    response.redirect('/login')
  })
})

app.get('/login', requireNotAuthenticated, function(request, response) {
  console.log(request.query)
  let hasError = false
  if (request.query.error) {
    hasError = true
  }
  response.render('login', { error: hasError })
})

app.post('/authenticate', requireNotAuthenticated, function(request, response) {
  var data = {
    username: request.body.username,
    password: request.body.password
  }

  var searchQuery = { username: data.username }

  usersDatabase.findOne(searchQuery, function(err, user) {
    console.log('DB results: ', user)
    if (err || user == null) {
      response.redirect('/login')
    } else {
      var hashedPassword = user.password
      console.log('Found username')
      if (bcrypt.compareSync(data.password, hashedPassword) == true) {        
        console.log('Login successful')
        var session = request.session
        session.loggedInUser = data.username,
        response.redirect('/')
      } else {
        response.redirect('/login')
      }
    }
  })
})

app.get('/', requireAuthenticated, function(request, response) {
  var query = { }
  var sortQuery = {
    timestamp: -1
  }

  database.find(query)
    .sort(sortQuery)
    .exec(function(error, data) {
      response.render('explore.ejs', { messages: data })
  })    
})

app.get('/myPost', requireAuthenticated, function(request, response) {
  var query = { }
  var sortQuery = {
    timestamp: -1
  }
  
  var query2 = { username: request.session.loggedInUser }
  usersDatabase.findOne(query2, function(error, user){
    var profile = {
      profilePicture: user.profilePicture,
      userID: user.fullname,
      username: user.username
    }
    database.find(query)
    .sort(sortQuery)
    .exec(function(error, data) {
      response.render('myPost.ejs', { messages: data, publisher: request.session.loggedInUser, profile: profile})
  })    
  })
})

// app.get('/submit', requireAuthenticated, function(request, response) {
//   var query2 = { username: request.session.loggedInUser }
//   usersDatabase.findOne(query2, function(error, user){
//     var profile = {
//       profilePicture: user.profilePicture,
//       userID: user.fullname,
//       username: user.username
//     }
  
//   response.render('submit.ejs', {profile: profile});
// })
// })

// app.get('/article/:id',requireAuthenticated, function(request,response){
//   console.log(request.params)
//   var id=request.params.id

//   var query = {
//       _id: id
//   }

//   // var query2 = {
//   //   publisher: author
//   // }

//   var publisher = request.body.publisher
//   var loggedInUser = request.session.loggedInUser

//   console.log(publisher) 
//   console.log(loggedInUser) 
//   console.log(request)

//   database.findOne(query, function(error, data){                  //findOne() means find one unique or first one
//       response.render('article.ejs', {message: data, publisher: publisher, loggedInUser: loggedInUser})
//   }) 
// })

app.get('/message/:id', requireAuthenticated, function(request, response) {
  console.log(request.params)
  var id = request.params.id

  var query = {
    _id: id
  }
  database.findOne(query, function(error, data) {
    response.render("message.ejs", { message: data })
  })
  
})

app.post('/uploads', requireAuthenticated, upload.single('theimage'), function(request, response) {
  // console.log(request.body)
  // console.log(request.file)
  var currentDate = new Date()

  var data = {
    author: request.session.loggedInUser,
    date: currentDate.toLocaleString(),
    timestamp: currentDate.getTime(),
    likes: 0,
    comments: [],
    inputText: request.body.inputText
  }

  console.log(data)

  if (request.file) {
    data.image = '/uploads/' + request.file.filename
  }

  database.insert(data, function(error, newData) {
    console.log(newData)
    response.status(204).send();
  })

})

app.post('/removeMyPost', requireAuthenticated, function(request, response) {
  var messageId = request.body.messageId
  var query = { _id: messageId }

  database.remove(query, function(error, numRemoved) {
    console.log('Number of removed elements:', numRemoved)
      response.redirect('/myPost')
  })
})

app.post('/like', requireAuthenticated, function(request, response) {
  var messageId = request.body.messageId
  var username = request.session.loggedInUser

  var query = {
    messageId: messageId,
    username: username
  }

  likesDatabase.count(query, function(err, cnt) {
    console.log('like count: ', cnt)
    if (cnt > 0) {
      response.status(204).send();
    } else {
      var data = { messageId: messageId, username: username }
      likesDatabase.insert(data, function(err, data) {

        var query = { _id: messageId }
        var update = { $inc: { likes: 1 } }
        
        database.update(query, update, {}, function(error, numberOfUpdated) {
          console.log('Number of updated documents: ', numberOfUpdated)      
          response.status(204).send();
        })      
      })
    }
  })

})

app.post('/comment', requireAuthenticated, function(request, response) {
  var messageId = request.body.messageId
  var commentText = request.body.theComment
  var username = request.session.loggedInUser
  console.log(request.body)

  var query = { _id: messageId }
  var update = { $push: { comments: { user: username, text: commentText }}}

  database.update(query, update, {}, function(err, numUpdated) {
    response.redirect('/article/' + messageId)
  })
})

app.get('/test', function(request, response) {
  response.send('Server is working')
})

// app.listen(8080, function() {
//   console.log('Server started on port 8080')
// })

const PORT = process.env.PORT || 443;
https
  .createServer(options, app)
  .listen(PORT, console.log(`server runs on port ${PORT}`));
