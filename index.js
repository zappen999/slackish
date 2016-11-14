'use strict';

const exec = require('child_process').exec;
const slack = require('slack');

/**
 * Posts to slack
 * @param {Object} opts Options for message, refer to slack postMessage docs
 * @return {Promise} Resolving promise with data response on success, Rejecting
 *                   promise with error on fail
 */
function post(opts) {
  return function run() {
    return new Promise(function(resolve, reject) {
      // Setup default configuration
      const payload = Object.assign({}, opts, {
        token: process.env.SLACK_TOKEN || opts.token
      });

      slack.chat.postMessage(payload, function(err, data) {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    });
  };
}

/**
 * Runs a task
 * @param {String} cmd Command to run
 * @return {Promise} Rejecting promise if the task exit with non success code
 */
function clitask(cmd) {
  return function run() {
    return new Promise(function(resolve, reject) {
      const proc = exec(cmd, function(err) {
        if (err) {
          return reject(err);
        }

        return resolve();
      });

      // Output everything
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);
    });
  };
}

/**
 * Runs an array with tasks in sequence
 * @param {Array} tasks Array of functions that returns a Promise
 * @return {Promise} Rejecting promise if one of the tasks fail
 */
function dostuff(tasks) {
  return new Promise(function(resolve, reject) {
    tasks.reverse();

    /**
     * Executes the current task
     * @param {Function} task The task to run
     * @param {Function} next The task to run after the current finishes
     */
    function doTask(task, next) {
      console.log('Slacker: Running task');

      // Run task
      task().then(function() {
        if (next) {
          doTask(next, tasks.pop());
        }
      }).catch(function(err) {
        return reject(err);
      });
    }

    doTask(tasks.pop(), tasks.pop());
  });
}

/**
 * Returns an error into markdown format
 * @param {Error} err Error to format
 * @return {String} The formatted message
 */
function err2mark(err) {
  return '*Error code ' + (err.code || 'unknown') + ':* ' +
    err.message + '\n```' + err.stack + '```';
}

module.exports = {
  clitask: clitask,
  post: post,
  dostuff: dostuff,
  err2mark: err2mark
};
