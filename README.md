# kraken-devtools

Compile-on-the-fly and other development tools for use when building [express](http://expressjs.com/) applications.

[![Build Status](https://travis-ci.org/krakenjs/kraken-devtools.png)](https://travis-ci.org/krakenjs/kraken-devtools)
[![NPM version](https://badge.fury.io/js/kraken-devtools.png)](http://badge.fury.io/js/kraken-devtools)




## Middleware compiler

The middleware compiler builds your dependencies as they are requested, allowing you to run your express application as-is and not have to set up a watch task.


### Usage

```js
var app = require('express')(),
    devtools = require('kraken-devtools');

app.use(devtools(/* src, dest [, config] */));
```

### Parameters

`src` - The directory of your source files  
`dest` - The destination directory for the compiled files  
`config` - Optional. An object of compilers to enable  



### Configuration

`less`, `sass`, `stylus`, `dustjs`, and a static `copier` plugin are available to use. To enable, set the `module` and `files` properties in your `config`, e.g.:

```json
{
    "less": {
        "module": "kraken-devtools/plugins/less",
        "files": "/css/**/*.css",
        "ext": "less"
    }
}
```

To add additional compilers, create a module with the following format and add it to your configuration:

```js
module.exports = function (options) {
    return function (data, args, callback) {
        // Compile the data
    };
};
```
