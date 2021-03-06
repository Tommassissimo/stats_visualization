
// Load libraries
var CS = require( '../core' );

// Create a child logger
var log = CS.log.child( { component: 'Close Task' } );

// Models
var ObjectModel = CS.models.object;

function onCloseObject( params, task, data, callback ) {

  if( task.closed==='CLOSED' )
    return callback();

  var objectsNumber = task.objects.length;

  ObjectModel
  .find()
  .where( 'task', task._id )
  .where( 'status', 'CLOSED' )
  .count()
  .exec( function( err, count ) {
    if( err ) return callback( err );

    if( count===objectsNumber )
      return task.close( callback );

    return callback();
  } );
}

// # Rule definition
//
// Description of the rule.
var rule = {
  // # Hooks
  //
  // Description of what the rule does in general.
  hooks: {
    // Description of what the rule does in this specific event.
    'CLOSE_OBJECT': onCloseObject
  }
};

module.exports = exports = rule;