# typhen [![Build Status](https://secure.travis-ci.org/shiwano/typhen.png?branch=master)](http://travis-ci.org/shiwano/typhen) [![npm version](https://badge.fury.io/js/typhen.svg)](http://badge.fury.io/js/typhen)

> Generates code or documentation from TypeScript.

The definition and the template:

```ts
interface Foo {
  bar: string;
  baz(qux: string): void;
}
```

```hbs
class {{name}}
{
  {{#each properties}}
  public {{type}} {{upperCamel name}} { get; set; }
  {{/each}}
  {{#each methods}}
  {{#each callSignatures}}
  public {{returnType}} {{upperCamel ../name}}({{#each parameters}}{{type}} {{name}}{{#unless @last}}, {{/unless}}{{/each}}):
  {
    // do something
  }
  {{/each}}
  {{/each}}
}
```

Will generate this below:

```cs
class Foo
{
  public string Bar { get; set; }
  public void Baz(string qux)
  {
    // do something
  }
}
```

## Getting Started

### Command Line Tool
Install the module with: `npm install -g typhen`

If tsconfig.json or typhenfile.js exists in the current directory:

```sh
$ typhen
```

Otherwise:

```sh
$ typhen --plugin typhen-awesome-plugin --dest generated definitions.d.ts
```

### Node Module
Install the module with: `npm install --save typhen`

Example:

```js
const typhen = require('typhen');
const result = typhen.parse('./foo.d.ts');
console.log('Parsed types: ', result.types.map(t => t.fullName));
console.log('Parsed modules: ', result.modules.map(m => m.fullName));
```

## Documentation

### tsconfig.json
If you want to execute typhen by the tsconfig.json, you have to set `typhen` property to tsconfig.json, and make the typhen execution settings.

Example:

```js
{
  "files": [
    "src/index.ts"
  ],
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES5"
  },
  "typhen": [
    {
      "plugin": "typhen-awesome-plugin",
      "pluginOptions": { "optionName": "option value" }, // Optional. Default value is {}.
      "outDir": "output-directory",
      "files": [ "src/typings/definitions.d.ts" ]        // Optional. Default value is root's files.
      "include": [ "src/typings/include/**/*" ]          // Optional. Default value is root's include.
      "exclude": [ "src/typings/exclude/**/*" ]          // Optional. Default value is root's exclude.
    }
  ]
}
```

### typhenfile.js
The typhenfile.js is a valid JavaScript file that belongs in the root directory of your project, and should be committed with your project source.
You can make complex settings that can not be in the tsconfig.json.

The typhenfile.js is comprised of the following parts:

* The "wrapper" function that returns a Promise object of the [bluebird](https://github.com/petkaantonov/bluebird).
* Loading or creating a plugin.
* Running with configuration.

Example:

```js
const ts = require('typescript');

module.exports = (typhen) => {
  return typhen.run({                    // typhen.run returns a Promise object of the bluebird.
    plugin: typhen.loadPlugin('typhen-awesome-plugin', {
      optionName: 'option value'
    }),
    src: 'typings/lib/definitions.d.ts', // string or string[]
    dest: 'generated',
    include: ['typings/include/**/*'],   // Optional. Default value is [].
    exclude: ['typings/exclude/**/*'],   // Optional. Default value is [].
    cwd: '../other/current',             // Optional. Default value is process.cwd().
    typingDirectory: 'typings',          // Optional. Default value is the directory name of the src.
    defaultLibFileName: 'lib.core.d.ts', // Optional. Default value is undefined, then the typhen uses the lib.d.ts or lib.es6.d.ts.
    compilerOptions: {                   // Optional. Default value is { module: ts.ScriptTarget.CommonJS, noImplicitAny: true, target: ts.ScriptTarget.ES6 }
      target: ts.ScriptTarget.ES6
    }
  }).then((files) => {
    console.log('Done!');
  }).catch((e) => {
    console.error(e);
  });
};
```

### Plugin
A typhen plugin can be defined in the typhenfile.js or an external module.

Example:

```js
module.exports = (typhen, options) => {
  return typhen.createPlugin({
    pluginDirectory: __dirname,
    newLine: '\r\n',                   // Optional. Default value is '\n'.
    namespaceSeparator: '::',          // Optional. Default value is '.'.
    customPrimitiveTypes: ['integer'], // Optional. Default value is [].
    disallow: {                        // Optional. Default value is {}.
      any: true,
      tuple: true,
      unionType: true,
      intersectionType: true,
      overload: true,
      generics: true,
      anonymousObject: true,
      anonymousFunction: true,
      literalType: true,
      mappedType: true
    },
    handlebarsOptions: {               // Optional. Default value is null.
      data: options,                   // For details, see: http://handlebarsjs.com/execution.html
      helpers: {
        baz: (str) => {
          return str + '-baz';
        }
      }
    },

    rename: (symbol, name) => { // Optional. Default value is a function that returns just the name.
      if (symbol.kind === typhen.SymbolKind.Array) {
        return '[]';
      }
      return name;
    },

    generate: (generator, types, modules) => {
      generator.generateUnlessExist('templates/README.md', 'README.md');

      types.forEach((type) => {
        switch (type.kind) {
          case typhen.SymbolKind.Enum:
            generator.generate('templates/enum.hbs', 'underscore:**/*.rb', type);
            break;
          case typhen.SymbolKind.Interface:
          case typhen.SymbolKind.Class:
            generator.generate('templates/class.hbs', 'underscore:**/*.rb', type);
            break;
        }
      });
      modules.forEach((module) => {
        generator.generate('templates/module.hbs', 'underscore:**/*.rb', module);
      });
      generator.files.forEach((file) => {
        // Change a file that will be written.
      });
      return new Promise((resolve, reject) => { // If you want async processing, return a Promise object.
        // Do async processing.
      });
    }
  });
};
```

### Templating
The typhen has used the [Handlebars template engine](http://handlebarsjs.com/) to render code, so you can use the following global helpers and custom helpers which are defined in the typhenfile.js or a plugin.

#### and Helper
Conditionally render a block if all values are truthy.

Usage:
```hbs
    {{#and type.isInterface type.isGenericType type.typeArguments}}
      This type is an instantiation of a generic interface.
    {{/and}}
```

#### or Helper
Conditionally render a block if one of the values is truthy.

Usage:
```hbs
    {{#or type.isArray type.isTuple type.isClass}}
      This type is an array, a tuple, or a class.
    {{/or}}
```

#### underscore Helper
Transforms a string to underscore.

Usage:
```hbs
    {{underscore 'FooBarBaz'}}
                  foo_bar_baz
```

#### upperCamel Helper
Transforms a string to upper camel case.

Usage:
```hbs
    {{upperCamel 'foo_bar_baz'}}
                  FooBarBaz
```

#### lowerCamel Helper
Transforms a string to lower camel case.

Usage:
```hbs
    {{lowerCamel 'foo_bar_baz'}}
                  fooBarBaz
```

#### pluralize
Transforms a string to plural form.

Usage:
```hbs
    {{pluralize 'person'}}
                 people
```

#### singularize
Transforms a string to singular form.

Usage:
```hbs
    {{singularize 'people'}}
                   person
```

#### defaultValue
Render a fallback value if a value doesn't exist.

Usage:
```hbs
    {{defaultValue noExistingValue 'missing'}}
                   missing
```

### Custom Primitive Types
If you want to use a custom primitive type, you will add the interface name to `customPrimitiveTypes` option in your plugin. Then the typhen will parse the interface as a primitive type.

## Plugins
If you want to add your project here, feel free to submit a pull request.

* [typhen-json-schema](https://github.com/shiwano/typhen-json-schema) - Converts TypeScript Interfaces to JSON Schema

## TypeScript Version
2.2.2

## Migration Informations
 * 2016-10-09 v1.0.0
   * Drop support for Node versions less than 4.0.0.
   * Replaced ObjectType's `stringIndexType` and `numberIndexType` to `stringIndex` and `numberIndex`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp.js](http://gulpjs.com/).

## Contributors

* Shogo Iwano (@shiwano)
* Sebastian Lasse (@sebilasse)
* Zacarias F. Ojeda (@zojeda)

## License
Copyright (c) 2014 Shogo Iwano
Licensed under the MIT license.
