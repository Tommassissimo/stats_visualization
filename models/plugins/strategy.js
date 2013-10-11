// Load libraries
var util = require('util');
var mongo = require('mongoose');

// Import Mongo Classes and Objects
var Schema = mongo.Schema;
var Mixed = Schema.Types.Mixed;

// Create child logger
var log = common.log.child( { component: 'Strategy plugin' } );



// # Strategy plugin
//
// The strategy plugins implementa all the logic needed to set/check/run the task strategies.
module.exports = exports = function ( strategy, required ) {
  required = required || false;

  return function ( schema ) {
    // Create an empty JS object to hold the strategy field definition.
    var field = {};

    // The field name is composed by the passed strategy and 'Strategy'
    // (like splittingStrategy, assignmentStrategy, etc).
    field[ strategy+'Strategy' ] = {
      type: {
        name: {
          type: String,
          required: required,
          trim: true
        },
        params: {
          type: Mixed,
          'default': {}
        }
      },
      required: required
    };

    // Add the field to the schema.
    schema.add( field );
    /*


      // Pre check done before saving.
      schema.pre('save', function( next ) {
        this.checkImplementationStrategy( next );
      } );

      schema.methods.checkImplementationStrategy = function( callback ) {
        var name = this.implementationStrategy.name;
        var params = this.implementationStrategy.params;

        // Load strategy to perform the check
        var strategy = common.strategies.implementation[ name ];

        // Wrap the call to the strategy into a try catch to get possible errors in the strategy
        if( !strategy )
          return callback( new ImplementationStrategyError( ImplementationStrategyError.STRATEGY_NOT_FOUND,'The Implementation strategy '+name+' does not exist' ) );

        strategy.check( this, params, callback );
      };

      schema.methods.canSetImplementationStrategy = function() {
        return this.status<TaskStatuses.OPENED;
      };

      schema.methods.setImplementationStrategy = function( implementationStrategy, callback ) {
        if( this.canSetImplementationStrategy() ) {
          // Associate the implementationStrategy
          this.set( 'implementationStrategy', implementationStrategy );
          // Save the task, this will trigger the `pre` middleware.
          this.save( callback );
        } else {
          return callback( new Error( 'Cannot set ImplementationStrategy for the task, status is: '+this.status ) );
        }
      };

      schema.methods.performImplementationStrategy = function( data, callback ) {
        // Load the strategy configuration.
        var name = this.implementationStrategy.name;
        var params = this.implementationStrategy.params;
        log.trace( 'Performing Implementation Strategy %s', name );

        var strategy = common.strategies.implementation[ name ];

        // Wrap the call to the strategy into a try catch to get possible errors in the strategy
        if( !strategy )
          return callback( new ImplementationStrategyError( ImplementationStrategyError.STRATEGY_NOT_FOUND,'The Implementation strategy '+name+' does not exist' ) );

        strategy.perform( data, params, callback );
      };
    };
    */
  };
};