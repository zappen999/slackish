# slackish
Task runner with Slack integration

## Usage
```js
const slackish = require('slackish');

slackish.dostuff([
  slackish.clitask('rm -rf node_modules'),
  slackish.clitask('npm install'),
  slackish.post({
    text: 'Installation done!'
  })
]).catch(function(err) {
  console.log('Something in the chain failed', err);
});
```

## API

#### dostuff(Array tasks)
Runs an array of task in sequence. Tasks are just functions that returns
promises when invoked.

Example of task:

```js
function task() {
  return run() {
    return Promise.resolve();
  }
}
```

#### slacker.post(Object config)
A tasks that posts messages to Slack. Please refer to:
https://api.slack.com/methods/chat.postMessage for customization

#### slacker.clitask(String command)
Spawns a child process task. Outputs stdout and stderr of the child. Will
reject task on non 0 exit codes. Example

```js
slacker.dostuff([
  slacker.clitask('npm install')
]).catch(function(err) {
  // Some error with npm install...
});
```

#### err2mark(Error err)
Formats errors to markdown, making them appear nicer in Slack. Example:

```js
slacker.dostuff([
  // Some failing task
]).catch(function(err) {
  slacker.post({
    text: slacker.err2mark(err);
    mrkdwn_in: ['text'], // Required to send markdown
  })();
});
```
