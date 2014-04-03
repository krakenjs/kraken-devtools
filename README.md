# kraken-devtools

Compile-on-the-fly and other development tools for use when building [express](http://expressjs.com/) applications.



## Middleware compiler

The middleware compiler builds your dependencies as they are requested, allowing you to run your express application as-is and not have to set up a watch task.


### Usage

```js
var app = require('express')(),
    devtools = require('kraken-devtools');

app.use(devtools(/* src, dest [, config] */));
```

### Parameters

`src` - The directory of your source files, e.g. LESS, SASS, Dust  
`dest` - The destination directory for the compiled files  
`config` - Optional. An object of compilers to enable  



### Compilers

LESS, SASS, and Dust compilers are provided by default in addition to a static file copier. To add additonal compilers pass then to the `config` value, e.g.:

```json
{
    "less": {
        "module": "kraken-devtools/plugins/less",
        "files": "/css/**/*.css"
    }
}
```
