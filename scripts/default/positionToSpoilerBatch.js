
// Load libraries
var util = require('util');
var domain = require( 'domain' );

// Create a child logger
var log = common.log.child( { component: 'PositionToSpoilerBatch' } );

// Models
var Task = common.models.task;

var CSError = require('../../error');
// Custom error
var PositionToSpoilerBatchError = function( id, message) {
  /* jshint camelcase: false */
  PositionToSpoilerBatchError.super_.call( this, id, message);
};

util.inherits( PositionToSpoilerBatchError, CSError );

// Error name
PositionToSpoilerBatchError.prototype.name = 'PositionToSpoilerBatchError';

// Error IDs
PositionToSpoilerBatchError.INVALID_TASK_ID = 'INVALID_TASK_ID';

var performRule = function( data, config, callback ) {
  log.trace('Performing the rule');

  var d = domain.create();
  d.on( 'error', callback );

  var taskId = config.task;
  var microtask = data.microtask;

  if(data.event !== 'END_MICROTASK'){
    log.warn('Wrong event');
    return callback();
  }

  Task
  .findById( taskId )
  .exec( d.bind( function( err, task2 ) {
    if( err ) return callback( err );

    if( !task2 )
      return callback( new PositionToSpoilerBatchError( PositionToSpoilerBatchError.INVALID_TASK_ID, 'Invalid Task id' ) );

    microtask.populate('objects',function(err,microtask){
      if(err) return callback(err);

      var object = microtask.objects[0];

      var finalResponse = object.getMetadata('maj_'+microtask.operations[0]+'_result');

      // Continue the flow only if the end category is selected
      if(finalResponse!=='end'){
        return callback();
      }

      var newObject = {
        name:'image',
        data:{
          scene:object.data.scene
        }
      };

      return task2.addObjects( [newObject], callback );

    });


  }) );
};



var checkParameters = function( callback ) {
  log.trace( 'Checking parameters' );
  // Everything went better then expected...
  return callback();
};

var params = {
  task: 'string'
};

module.exports.perform = exports.perform = performRule;
module.exports.check = exports.check = checkParameters;
module.exports.params = exports.params = params;