When the content corresponding to a certain url changes, back it up.

- Allow urls with basic authentication

## use

```js
const { BackupUrl } = require(`backup-url`);
new BackupUrl({
  dir: `./backup`,
  interval: 5 * 1000,
  url: [`http://127.0.0.1:8999/doc/openApi.json`],
  format: `json`,
});
```

## parameter

```js
new BackupUrl({
  url = ``, // url address, support string or string[]
  interval =  10 * 1000, // Each backup interval in milliseconds, 0 means no backup
  dir = `${__dirname}/backup`, // what directory to back up to
  format = undefined, // The function used for formatting before backup, supports `json` or function
})
```

## License
[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2017-present, xw
