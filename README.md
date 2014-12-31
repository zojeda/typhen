# typhen [![Build Status](https://secure.travis-ci.org/shiwano/typhen.png?branch=master)](http://travis-ci.org/shiwano/typhen) [![npm version](https://badge.fury.io/js/typhen.svg)](http://badge.fury.io/js/typhen)

> Generates the code from the TypeScript declaration source files.

The definition and the template given:

```ts
interface Foo {
  bar: string;
  baz(qux: string): void;
}
```

```hbs
class {{name}} {
  {{#each properties}}
  public {{type}} {{upperCamelCase name}} { get; set; }
  {{/each}}
  {{#each methods}}
  {{#each callSignatures}}
  public {{returnType}} {{upperCamelCase ../name}}({{#each parameters}}{{type}} {{name}}{{#unless @last}}, {{/unless}}{{/each}}): {
    // do something
  }
  {{/each}}
  {{/each}}
}
```

Will generate this below:

```cs
class Foo {
  public string Bar { get; set; }
  public void Baz(string qux) {
    // do something
  }
}
```

## Getting Started
Install the module with: `npm install -g typhen`

If typhenfile.js exists in the current directory:

```sh
$ typhen
```

Otherwise:

```sh
$ typhen foo/bar/typhenfile.js
```

```sh
$ typhen --plugin typhen-json-schema --dest generated definitions.d.ts
```

## Documentation

### typhenfile.js

The typhenfile.js is a valid JavaScript file that belongs in the root directory of your project, and should be committed with your project source.

The typhenfile.js is comprised of the following parts:

* The "wrapper" function which takes `typhen` as argument.
* Loading or creating a plugin.
* Running configuration.

Example:

```js
module.exports = function(typhen) {
  var plugin = typhen.loadPlugin('typhen-awesome-plugin', {
    optionName: 'option value'
  });

  typhen.run({
    plugin: plugin,
    src: 'definitions.d.ts',
    dest: 'generated',
    cwd: '../other/current', // Optional. Default value is process.cwd().
    aliases: {               // Optional. Default value is {}.
      'Foo': 'Bar'
    }
  });
};
```

### Plugin

A typhen plugin can be defined in the typhenfile.js or an external module.

Example:

```js
module.exports = function(typhen, options) {
  return typhen.createPlugin({
    pluginDirectory: __dirname,
    newLine: '\r\n',                // Optional. Default value is '\n'.
    namespaceSeparator: '::',       // Optional. Default value is '.'.
    disallow: {                     // Optional. Default value is {}.
      typeParameter: true,
      method: true
    },
    aliases: {                      // Optional. Default value is {}.
      '^(.+)Class$': '$1'
    },
    handlebarsOptions: {            // Optional. Default value is null.
      data: options,                // For details, see: http://handlebarsjs.com/execution.html
      helpers: {
        'baz': function(str) {
          return str + '-baz'
        }
      }
    },

    generate: function(types, generator) {
      generator.generateUnlessExist('templates/README.md', 'README.md');

      types.forEach(function(type) {
        switch (type.kind) {
          case typhen.SymbolKinds.Enum:
            generator.generate('templates/enum.hbs', 'underscore:**/*.rb', type);
            break;
          case typhen.SymbolKinds.Interface:
          case typhen.SymbolKinds.Class:
          case typhen.SymbolKinds.ObjectType:
            generator.generate('templates/class.hbs', 'underscore:**/*.rb', type);
            break;
          case typhen.SymbolKinds.Function:
            generator.generate('templates/function.hbs', 'underscore:**/*.rb', type);
            break;
        }
      });
    }
  });
};
```

### Templating
The typhen has used the [Handlebars template engine](http://handlebarsjs.com/) to render the code, so you can use the following global helpers and custom helpers which are defined in the typhenfile.js or a plugin.

#### Swag Helpers
See the [documentation](http://elving.github.io/swag/) for the helpers in the Swag library.

#### underscore Helper
Transforms a string to underscore.

Usage:
```hbs
    {{underscore 'FooBarBaz'}}
                  foo_bar_baz
```

#### upperCamelCase Helper
Transforms a string to upper camel case.

Usage:
```hbs
    {{upperCamelCase 'foo_bar_baz'}}
                      FooBarBaz
```

#### lowerCamelCase Helper
Transforms a string to lower camel case.

Usage:
```hbs
    {{lowerCamelCase 'foo_bar_baz'}}
                      fooBarBaz
```

### Custom Primitive Types

If you want to use a custom primitive type, define the interface which is extended from the `TyphenPrimitiveType` in your definitions. Then the typhen will parse the interface as a primitive symbol. By default, the typhen has prepared the following primitive types in the [lib.typhen.d.ts](./lib.typhen.d.ts).

#### integer

A number without a fraction or exponent part.

## TypeScript Version

1.3.0

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp.js](http://gulpjs.com/).

## License
Copyright (c) 2014 Shogo Iwano
Licensed under the MIT license.
