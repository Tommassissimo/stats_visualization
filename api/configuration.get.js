// Load libraries
var _  = require('underscore');
var util  = require('util');
var CS = require( '../core' );

// Import a child Logger
var log = CS.log.child( { component: 'Get Configuration' } );



// Generate custom error `GetConfigurationError` that inherits
// from `APIError`
var APIError = require( './error' );
var GetConfigurationError = function( id, message, status ) {
  GetConfigurationError.super_.call( this, id, message, status );
};
util.inherits( GetConfigurationError, APIError );
// Custom error IDS
GetConfigurationError.prototype.name = 'GetConfigurationError';


// API object returned by the file
// -----
var API = {
  // The API endpoint. The final endpoint will be:
  //    /api/**endpointUrl**
  url: 'configuration/:property?',

  // The API method to implement.
  method: 'GET'
};



// API core function logic. If this function is executed then each check is passed.
API.logic = function getConfiguration( req, res ) {
  var property = req.params.property;

  var force = !property;
  var data = {};

  log.trace( 'Getting %s from configuration', force? 'all properties' : property );

  // Compute and return the platforms
  if( property==='platforms' || force ) {
    data.platforms = [];
    _.each( CS.platforms, function( platform, name ) {
      data.platforms.push( {
        name: name,
        params: platform.params,
        invitation: _.isFunction( platform.invite ),
        execution: _.isFunction( platform.execute ),
        enabled: !!platform.enabled
      } );
    } );
  }


  // Compute and return the invitation strategies
  if( property==='true' || force ) {
    data.invitationStrategies = [];
    _.each( CS.invitation, function( strategy, name ) {
      data.invitationStrategies.push( {
        name: name,
        params: strategy.params,
        triggerOn: strategy.triggerOn
      } );
    } );
  }

  // Compute and return the splitting strategies
  if( property==='true' || force ) {
    data.splittingStrategies = [];
    _.each( CS.splitting, function( strategy, name ) {
      data.splittingStrategies.push( {
        name: name,
        params: strategy.params,
        triggerOn: strategy.triggerOn
      } );
    } );
  }

  // Compute and return the Microtask assignment strategies
  if( property==='taskAssignment' || force ) {
    data = [];
    _.each( CS.taskAssignment, function( strategy, name ) {
      data.push( {
        name: name,
        params: strategy.params,
        triggerOn: strategy.triggerOn
      } );
    } );
  }

  // Compute and return the Microtask assignment strategies
  if( property==='true' || force ) {
    data.assignmentStrategies = [];
    _.each( CS.assignment, function( strategy, name ) {
      data.assignmentStrategies.push( {
        name: name,
        params: strategy.params,
        triggerOn: strategy.triggerOn
      } );
    } );
  }

  // Compute and return the implementation strategies
  if( property==='true' || force ) {
    data.executionStrategies = [];
    _.each( CS.implementation, function( strategy, name ) {
      data.executionStrategies.push( {
        name: name,
        params: strategy.params,
        triggerOn: strategy.triggerOn
      } );
    } );
  }

  // Return the field types... mmm not really necessary
  if( property==='true' || force ) {
    data.fieldTypes = [
      'STRING',
      'TEXT',
      'URL',
      'DATE',
      'IMAGE',
      'VIDEO',
      'BLOB',
      'NUMBER',
      'INT'
    ];
  }

  // Compute and return the task types
  if( property==='true' || force ) {
    data.taskTypes = [];
    _.each( CS.operations, function( operation, name ) {
      data.taskTypes.push( {
        name: name,
        params: operation.params
      } );
    } );
  }


  // Compute and return the object control strategies
  if( property==='true' || force ) {
    data.objectControlStrategies = [];

    //TODO: FIx temp hack
    data.objectControlStrategies.push( {
      name: 'Majority',
      actions: [
        {
          action: 'loopMajority',
          mapping: {
            agreement: 'agreement',
            numberOfAnswer: 'numberOfAnswer'
          },
          events: [ 'END_EXECUTION' ]
        },
        {
          action: 'aggregateMajority',
          mapping: {
            mode: 'mode',
            operation: 'operation'
          },
          events: [ 'END_EXECUTION' ]
        },
      ],
      params: {
        agreement: [ 'string' ],
        numberOfAnswer: [ 'string' ],
        mode:{
          type: 'enum',
          values: ['ALL','ONE','SPECIFIC']
        },
        operation: ['string']
      }
    } );

    data.objectControlStrategies.push( {
      name: 'Check object status',
      actions: [
        {
          action: 'closeMicroTaskOnObjectStatus',
          events: [ 'END_EXECUTION' ]
        },
        {
          action: 'closeTaskOnObjectsStatus',
          events: [ 'END_EXECUTION' ]
        },
      ]
    } );
  }

  // Compute and return the performer control strategies
  if( property==='true' || force ) {
    data.performerControlStrategies = [];

    //TODO: FIx temp hack
    /*
    data.performerControlStrategies.push( {
      name: 'Check spammer',
      actions: [
        {
          action: 'create_performer_metadata',
          events: [ 'END_EXECUTION' ]
        },
        {
          action: 'update_score',
          events: [ 'END_EXECUTION' ]
        },
        {
          action: 'check_spammer',
          events: [ 'END_EXECUTION' ]
        }
      ],
      params: {
        threshold: 'number',
        minAnswers: 'number'
      }
    } );
    */
  }

  // Compute and return the task control strategies
  if( property==='true' || force ) {
    data.taskControlStrategies = [];

    //TODO: FIx temp hack
    /*
    data.taskControlStrategies.push( {
      name: 'Check Microtask',
      actions: [
        {
          action: 'check_completed',
          events: [ 'END_EXECUTION' ]
        }
      ],
      params: {
        percentage: 'number'
      }
    } );
    */
  }


  // Return the available events
  if( property==='true' || force ) {
    data.events = [
      'OPEN_TASK',
      'END_TASK',
      'EOF_TASK',

      'ADD_OBJECT',
      'CLOSE_OBJECT',

      'ADD_MICROTASK',
      'END_MICROTASK',

      'END_EXECUTION'
    ];

  }

  // Compute and return the list of available custom control rules
  if( property==='true' || force ) {
    data.rules = [];
    _.each( CS.rules, function( customRule, name ) {
      data.rules.push( {
        name: name,
        params: customRule.params
      } );
    } );
  }

  res.json( data );
};


// Export the API object
exports = module.exports = API;