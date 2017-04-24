var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), 
    bodyParser = require('body-parser'), 
    methodOverride = require('method-override'); 
    var router = express.Router();
var passport = require('passport');    
var User = require('../models/user');

var isAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error_msg','You are not logged in');
    res.redirect('/');
  }
}

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(isAuthenticated)
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for projects
//this will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router.route('/', isAuthenticated)
    //GET all projects
    .get(function(req, res, next) {
        //retrieve all projects from Monogo
        mongoose.model('Project').find({}, function (err, projects) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
                    html: function(){
                        res.render('projects/index', {
                              title: 'Projekti:',
                              "projects" : projects,
                              user: req.user
                          });
                    },
                    //JSON response will show all projects in JSON format
                    json: function(){
                        res.json(projects);
                    }
                });
              }     
        });
    })
    //POST a new project
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var naziv = req.body.naziv;
        var opis = req.body.opis;
        var cijena = req.body.cijena;
        var datumPocetka = req.body.datumPocetka;
        var datumZavrsetka = req.body.datumZavrsetka;
        var obavljeniPoslovi = req.body.obavljeniPoslovi;
        var clanovi = req.body.clanovi;
        var arhiva = req.body.arhiva;
        var username= req.user.username;
        //call the create function for our database
        mongoose.model('Project').create({
            naziv : naziv,
            opis : opis,
            cijena : cijena,
            datumPocetka : datumPocetka,
            datumZavrsetka : datumZavrsetka,
            obavljeniPoslovi : obavljeniPoslovi,
            clanovi : clanovi,
            arhiva: arhiva,
            username: username
        }, function (err, project) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //project has been created
                  console.log('POST creating new project: ' + project);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("projects");
                        // And forward to success page
                        res.redirect("/projects");
                    },
                    //JSON response will show the newly created project
                    json: function(){
                        res.json(projects);
                    }
                });
              }
        })
    });

/* GET New project page. */
router.get('/new', function(req, res) {
    mongoose.model('User').find({}, function(err, user) {
    res.render('projects/new', { title: 'Dodaj Novi Projekt', user: req.user, "users" : user });
    console.log(user);
  });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Project').findById(id, function (err, project) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(project);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Project').findById(req.id, function (err, project) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + project._id);
        res.format({
          html: function(){
              res.render('projects/show', {
                "project" : project
              });
          },
          json: function(){
              res.json(project);
          }
        });
      }
    });
  });


router.route('/:id/edit')
            //GET the individual project by Mongo ID
            .get(function(req, res) {
                //search for the project within Mongo
                mongoose.model('Project').findById(req.id, function (err, project) {
                    if(project.username == req.user.username) {
                      mongoose.model('User').find({}, function(err, user) {
                    if (err) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        //Return the project
                        console.log('GET Retrieving ID: ' + project._id);
                        res.format({
                            //HTML response will render the 'edit.jade' template
                            html: function(){
                                res.render('projects/edit', {
                                    "project" : project,
                                    user: req.user,
                                    "users" : user 
                                });
                            },
                            //JSON response will return the JSON output
                            json: function(){
                                res.json(project);
                            }
                        });
                    }
                  });
                  }
                  else {
                         if (err) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        //Return the project
                        console.log('GET Retrieving ID: ' + project._id);
                        res.format({
                            //HTML response will render the 'edit.jade' template
                            html: function(){
                                res.render('projects/edit', {
                                    "project" : project,
                                    user: req.user
                                });
                            },
                            //JSON response will return the JSON output
                            json: function(){
                                res.json(project);
                            }
                        });
                    }
                  }
             });
	})
	//PUT to update a project by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
	    var naziv = req.body.naziv;
	    var opis = req.body.opis;
	    var cijena = req.body.cijena;
	    var datumPocetka = req.body.datumPocetka;
	    var datumZavrsetka = req.body.datumZavrsetka;
        var obavljeniPoslovi = req.body.obavljeniPoslovi;
        var arhiva = req.body.arhiva;
        var clanovi = req.body.clanovi;

	    //find the document by ID
	    mongoose.model('Project').findById(req.id, function (err, project) {
              if(project.username == req.user.username) {
	        //update it
	        project.update({
                naziv : naziv,
                opis : opis,
                cijena : cijena,
                datumPocetka : datumPocetka,
                datumZavrsetka : datumZavrsetka,
                obavljeniPoslovi : obavljeniPoslovi,
                arhiva : arhiva,
                clanovi : clanovi
	        }, function (err, projectID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          }
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/projects/" + project._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(project);
	                     }
	                  });
	           }
	        })
              }
              else {
                project.update({
                obavljeniPoslovi : obavljeniPoslovi
          }, function (err, projectID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            }
            else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function(){
                             res.redirect("/projects/" + project._id);
                       },
                       //JSON responds showing the updated values
                      json: function(){
                             res.json(project);
                       }
                    });
             }
          })
              }
	    });
	})
	//DELETE a project by ID
	.delete(function (req, res){
	    //find project by ID
	    mongoose.model('Project').findById(req.id, function (err, project) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            project.remove(function (err, project) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + project._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/projects");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : project
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;