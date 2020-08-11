# cz-emoji-chinese

> 中文版本的 git 提交 emoji 提示

**cz-emoji-chinese** allows you to easily use emojis in your commits using [commitizen] with chinese.

```sh
❯ git cz
? 选择提交的更改类型: (Use arrow keys or type to search)
❯ fix      🐛  修复 Bug
  style    🎨  改进代码的结构/格式
  feature  ✨  引入新特性
  prune    🔥  移除代码/文件
  ui       💄  更新UI和样式文件
  docs     📝  写文档
  init     🎉  初始化提交
```

## Install

**Globally**

```bash
sudo npm install commitizen cz-emoji-chinese -g

# Method 1: set as default adapter for your projects
echo '{ "path": "cz-emoji-chinese" }' > ~/.czrc

# Method 2: If you want minimalist mode, you can set it like this
echo '{ "path": "cz-emoji-chinese", "config": { "cz-emoji-chinese": { "skipQuestions": [ "issues", "scope","body" ],"subjectMinLength": 6 } } }' > ~/.czrc
```

**Locally**

```bash
npm install --save-dev commitizen cz-emoji-chinese
```

Add this to your `package.json`:

```json
"config": {
  "commitizen": {
     "path": "./node_modules/cz-emoji-chinese"
  },
}
```

## Usage

```sh
$ git cz
```

## Customization

By default `cz-emoji-chinese` comes ready to run out of the box. Uses may vary, so there are a few configuration options to allow fine tuning for project needs.

### How to

Configuring `cz-emoji-chinese` can be handled in the users home directory (`~/.czrc`) for changes to impact all projects or on a per project basis (`package.json`). Simply add the config property as shown below to the existing object in either of the locations with your settings for override.

```json
{
  "config": {
    "cz-emoji-chinese": {}
  }
}
```

### Configuration Options

#### Skip Questions

An array of questions you want to skip:

```json
{
  "config": {
    "cz-emoji-chinese": {
      "skipQuestions": ["scope", "issues"]
    }
  }
}
```

.czrc like this:

```js
{
  "path": "cz-emoji-chinese",
  "config": {
    "cz-emoji-chinese": {
      "skipQuestions": [
        "issues",
        "scope"
      ]
    }
  }
}
```

You can skip the following questions: `scope`, `body`, and `issues`. The `type` and `subject` questions are mandatory.

#### Types

By default `cz-emoji-chinese` comes preconfigured with the [Gitmoji](https://gitmoji.carloscuesta.me/) types.

An [Inquirer.js] choices array:

```json
{
  "config": {
    "cz-emoji-chinese": {
      "types": [
        {
          "emoji": "🌟",
          "code": ":star2:",
          "description": "A new feature",
          "name": "feature"
        }
      ]
    }
  }
}
```

#### Scopes

An [Inquirer.js] choices array:

```json
{
  "config": {
    "cz-emoji-chinese": {
      "scopes": ["home", "accounts", "ci"]
    }
  }
}
```

#### Symbol

A boolean value that allows for an using a unicode value rather than the default of [Gitmoji](https://gitmoji.carloscuesta.me/) markup in a commit message. The default for symbol is false.

```json
{
  "config": {
    "cz-emoji-chinese": {
      "symbol": true
    }
  }
}
```

#### Customize Questions

An object that contains overrides of the original questions:

```json
{
  "config": {
    "cz-emoji-chinese": {
      "questions": {
        "body": "This will be displayed instead of original text"
      }
    }
  }
}
```

## Examples

- https://github.com/Falieson/TRAM

## Commitlint

Commitlint can be set to work with this package by leveraging the package https://github.com/arvinxx/commitlint-config-gitmoji.

```bash
npm install --save-dev commitlint-config-gitmoji
```

_commitlint.config.js_

```js
module.exports = {
  extends: ['gitmoji'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)(?:\s)(?:\((.*?)\))?\s((?:.*(?=\())|.*)(?:\(#(\d*)\))?/,
      headerCorrespondence: ['type', 'scope', 'subject', 'ticket']
    }
  }
}
```

## License

MIT © Tw93

## Changelog

### 0.3.1

- [+] add `subjectMinLength` for Config
