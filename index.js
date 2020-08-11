const fs = require('fs');
const readPkg = require('read-pkg-up');
const truncate = require('cli-truncate');
const wrap = require('wrap-ansi');
const pad = require('pad');
const path = require('path');
const fuse = require('fuse.js');
const homeDir = require('home-dir');
const util = require('util');

const types = require('./lib/types');

const defaultConfig = {
  types,
  symbol: false,
  skipQuestions: [''],
  subjectMaxLength: 75,
  subjectMinLength: 1
};

function getEmojiChoices({ types, symbol }) {
  const maxNameLength = types.reduce(
    (maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength),
    0
  );

  return types.map(choice => ({
    name: `${pad(choice.name, maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: symbol ? choice.emoji : choice.code,
    code: choice.code
  }));
}

async function loadConfig() {
  const getConfig = obj => obj && obj.config && obj.config['cz-emoji-chinese'];

  const readFromPkg = () => readPkg().then(res => getConfig(res.pkg));

  const readFromCzrc = dir =>
    util
      .promisify(fs.readFile)(dir, 'utf8')
      .then(JSON.parse, () => null)
      .then(getConfig);

  const readFromLocalCzrc = () =>
    readPkg().then(res =>
      res && res.path ? readFromCzrc(`${path.dirname(res.path)}/.czrc`) : null
    );

  const readFromGlobalCzrc = () => readFromCzrc(homeDir('.czrc'));

  const config =
    (await readFromPkg()) || (await readFromLocalCzrc()) || (await readFromGlobalCzrc());

  return { ...defaultConfig, ...config };
}

function formatScope(scope) {
  return scope ? `(${scope})` : '';
}

function formatHead({ type, scope, subject }) {
  return [type, formatScope(scope), subject]
    .filter(Boolean)
    .map(s => s.trim())
    .join(' ');
}

function formatIssues(issues) {
  return issues ? 'Closes ' + (issues.match(/#\d+/g) || []).join(', closes ') : '';
}

/**
 * Create inquier.js questions object trying to read `types` and `scopes` from the current project
 * `package.json` falling back to nice default :)
 *
 * @param {Object} config Result of the `loadConfig` returned promise
 * @return {Array} Return an array of `inquier.js` questions
 * @private
 */
function createQuestions(config) {
  const choices = getEmojiChoices(config);

  const fuzzy = new fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name', 'code']
  });

  const questions = [
    {
      type: 'autocomplete',
      name: 'type',
      message:
        config.questions && config.questions.type ? config.questions.type : '选择提交的更改类型:',
      source: (answersSoFar, query) => {
        return Promise.resolve(query ? fuzzy.search(query) : choices);
      }
    },
    {
      type: config.scopes ? 'list' : 'input',
      name: 'scope',
      message:
        config.questions && config.questions.scope ? config.questions.scope : '指定一个范围:',
      choices: config.scopes && [{ name: '[none]', value: '' }].concat(config.scopes),
      when: !config.skipQuestions.includes('scope')
    },
    {
      type: 'maxlength-input',
      name: 'subject',
      message:
        config.questions && config.questions.subject
          ? config.questions.subject
          : '写一个简短的描述:',
      maxLength: config.subjectMaxLength,
      validate: function(value) {
        const arr = value.split(' ');
        const minLength = config.subjectMinLength;
        if (arr && arr.length > 1 && arr[0].length > 3 && arr[1].length > minLength) {
          return true;
        }
        const message = minLength > 1 ? `，长度不少于${minLength}` : '';
        return `须输入改动描述${message}`;
      },
      filter: (subject, answers) => formatHead({ ...answers, subject })
    },
    {
      type: 'input',
      name: 'body',
      message:
        config.questions && config.questions.body ? config.questions.body : '写一个更详细的描述:',
      when: !config.skipQuestions.includes('body')
    },
    {
      type: 'input',
      name: 'issues',
      message:
        config.questions && config.questions.issues
          ? config.questions.issues
          : '列出已解决的 issue (#1, #2, 无直接回车):',
      when: !config.skipQuestions.includes('issues')
    }
  ];

  return questions;
}

/**
 * Format the git commit message from given answers.
 *
 * @param {Object} answers Answers provide by `inquier.js`
 * @return {String} Formated git commit message
 */
function format(answers) {
  const { columns } = process.stdout;

  const head = truncate(answers.subject, columns);
  const body = wrap(answers.body || '', columns);
  const footer = formatIssues(answers.issues);

  return [head, body, footer]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

/**
 * Export an object containing a `prompter` method. This object is used by `commitizen`.
 *
 * @type {Object}
 */
module.exports = {
  prompter: function(cz, commit) {
    cz.prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    cz.prompt.registerPrompt('maxlength-input', require('inquirer-maxlength-input-prompt'));

    loadConfig()
      .then(createQuestions)
      .then(cz.prompt)
      .then(format)
      .then(commit);
  }
};
