// ClassifyMajority rule
// ---
// Rule that implements the majority for a single classify operation


// Load libraries
var _ = require('underscore');
var async = require( 'async' );
var CS = require( '../core' );

// Create a child logger
var log = CS.log.child( { component: 'Classify Majority' } );

// Models
var ControlMart = CS.models.controlmart;
var Execution = CS.models.execution;


var performRule = function( event, config, task, data, callback ) {
  log.trace('Performing the rule');

  // Error handler
  var domain = require( 'domain' ).create();
  domain.on('error',callback);

  var executionId = data.execution;
  var operationLabel = config.operation;

  Execution
  .findById( executionId )
  .exec( domain.bind( function( err, execution ) {
    if( err ) return callback( err );

    if( !execution )
      return callback( new Error( 'No execution retrieved' ) );

    var annotations = execution.annotations;
    var operation = _.findWhere(task.operations,{label:operationLabel});

    log.trace('Performing the rule for the operation %s',operation.label);

    // Select only annotations of the current operation
    annotations = _.filter(annotations, function( annotation ) {
      log.trace( 'Operation (%s): %j', annotation.operation );
      log.trace( 'Operation: %j', annotation.operation );
      return annotation.operation.equals(operation._id);
    });

    if(annotations.length === 0){
      log.trace('No annotations for this operation');
      return callback();
    }

    // For each annotation (and objects) it checks the majority
    var checkMajority = function(annotation,callback){
      var objectId = annotation.object;
      var category = annotation.response;

      // Retrieves the control mart related to the object and operation
      ControlMart.get({
        object:objectId,
        operation:annotation.operation

      },function(err,controlmart){
        if( err ) return callback( err );

        // Stuff that will be thrown away asap
        var result;
        /*if(_.has(controlmart,'result') && !_.isUndefined(controlmart['result'][operation._id]) && !_.isUndefined(controlmart['result'][operation._id][objectId]) ){
          result = controlmart['result'][operation._id][objectId].data;
        }*/

        result = _.findWhere(controlmart,{name:'result'});
        if(!_.isUndefined(result)){
          result = result.data;
          log.trace('Reading the result information from the controlmart ( %s )',result);
        }

        /*if(_.has(controlmart,'evaluations') && !_.isUndefined(controlmart['evaluations'][operation._id]) && !_.isUndefined(controlmart['evaluations'][operation._id][objectId])){
          evaluations = controlmart['evaluations'][operation._id][objectId].data;
        }*/

        var evaluations = _.findWhere(controlmart,{name:'evaluations'});
        if(!_.isUndefined(evaluations)){
          evaluations = evaluations.data;
          log.trace('Reading the evaluations information from the controlmart ( %s )',evaluations);
        }else{
          evaluations = 0;
        }

        var categoryCount = {};
        _.each(operation.params.categories,function(category){
          /*if(_.has(controlmart,category) && !_.isUndefined(controlmart[category][operation._id]) && !_.isUndefined(controlmart[category][operation._id][objectId])){
            categoryCount[category] = controlmart[category][operation._id][objectId].data;
          }else{
            categoryCount[category] = 0;
          }*/
          var count = _.findWhere(controlmart,{name:category});
          if(!_.isUndefined(count)){
            categoryCount[category] = count.data;
            log.trace('Reading the category information from the controlmart ( %s )',categoryCount[category]);
          }else{
            categoryCount[category] = 0;
          }
        });

        var status = 'open';
        /*if(_.has(controlmart,'status') && !_.isUndefined(controlmart['status'][operation._id]) && !_.isUndefined(controlmart['status'][operation._id][objectId])){
          status = controlmart['status'][operation._id][objectId].data;
        }*/

        status = _.findWhere(controlmart,{name:'status'});
        if(!_.isUndefined(status)){
          status = status.data;
          log.trace('Reading the status information from the controlmart ( %s )',status);

          if(status === 'closed'){
            log.trace('Object already closed for this operation');
            return callback();
          }
        }


        // Updating the various counters
        log.trace('Updating the count');
        categoryCount[category] = categoryCount[category]+1;
        evaluations++;

        // If the number of evaluations is equal to the required ones
        log.trace('Checking the majority');
        if(evaluations>=config.answers){

          // Get the category with the maximum count
          var maxCount = _.max(_.pairs(categoryCount),function(p){
            return p[1];
          });

          log.trace('The most selected category is %s',maxCount);

          // Verify if the maximum is unique
          var otherMax = _.where(_.pairs(categoryCount),function(p){
            return p[1] === maxCount[1];
          });

          // If it's unique it set the result
          if(otherMax.length > 1){
            result = undefined;
          }else{
            result = maxCount[0];
          }


          // If the max is greated or equal the agreement needed it close the object for this operation
          if(maxCount[1] >= config.agreement){
            status = 'closed';
          }

        }

        var updatedMart = [];

        // Update the control mart
        var resultMart = {
          task:task._id,
          object:objectId,
          name:'result',
          data:result,
          operation:operation._id
        };
        updatedMart.push(resultMart);

        var statustMart = {
          task:task._id,
          object:objectId,
          name:'status',
          data:status,
          operation:operation._id
        };
        updatedMart.push(statustMart);

        var evaluationtMart = {
          task:task._id,
          object:objectId,
          name:'evaluations',
          data:evaluations,
          operation:operation._id
        };
        updatedMart.push(evaluationtMart);

        _.each(operation.params.categories,function(category){
          log.trace('category %s',category);
          log.trace('count %s',categoryCount[category]);
          var categorytMart = {
            task:task._id,
            object:objectId,
            name:category,
            data:categoryCount[category],
            operation:operation._id
          };
          updatedMart.push(categorytMart);
        });

        return ControlMart.insert(updatedMart,callback);
      });
    };

    return async.each(annotations,checkMajority,callback);
  }));

};

var checkParameters = function( params, done ) {
  log.trace( 'Checking parameters' );

  // Everything went better then expected...

  if(_.isUndefined(params.operation)){
    log.error('The label of the operation must be specified');
    return done(false);
  }

  if(_.isUndefined(params.agreement) || params.agreement<=0){
    log.error('The agreement must be an integer greater than 0');
    return done(false);
  }

  if(_.isUndefined(params.answers) || params.answers<=0){
    log.error('The number of answers must be an integer greater than 0');
    return done(false);
  }

  return done(true);
};

var params = {
  operation: 'string',
  answers:'number',
  agreement:'number'
};

module.exports.perform = exports.perform = performRule;
module.exports.check = exports.check = checkParameters;
module.exports.params = exports.params = params;