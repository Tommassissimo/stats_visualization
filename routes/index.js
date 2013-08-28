

// Load libraries
var nconf = require( 'nconf' );

// Create a child logger
var log = common.log.child( { component: 'Index Routes' } );

// Load mongo Models
var UserSchema = common.models.user;


// Render the home page.
exports.index = function( req, res ) {
  res.render( 'index' );
};


// Authorization routes
// ---
// Check if the user is logged
exports.checkAuth = function( req, res, next ) {
  log.trace( 'Checking if user is authenticated' );
  if( !req.isAuthenticated() ) {
    var baseURL = nconf.get( 'webserver:externalAddress' );
    return res.redirect( baseURL+'login' );
  } else {
    next();
  }
};
// Handler for registering a new user
exports.postRegister = function( req, res, next ) {
  var rawUser = req.body;

  log.trace( 'Registering new user %j', rawUser );
  var user = new UserSchema( rawUser );

  log.error( 'REGISTER %s', req.session.from );
  user.setMetadata( 'from', req.session.from );
  delete req.session.from;

  log.trace( 'Saving user information' );
  user.save( function( err, user ) {
    if( err) return next( err );

    log.trace( 'User saved, login' );
    req.login( user, next );
  } );
};
exports.register = function( req, res ) {
  res.render( 'register' );
};
exports.login = function( req, res ) {
  // save into the session the destination Url
  req.session.destination = req.query.continueTo || req.session.destination;
  req.session.from = req.query.from || req.session.from;

  res.render( 'login', {
    errorMessage: req.flash( 'error' )
  } );
};
exports.logout = function( req, res ) {
  req.logout();
  var baseURL = nconf.get( 'webserver:externalAddress' );
  res.redirect( baseURL );
};
