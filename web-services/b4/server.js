const express = require('express');
const morgan = require('morgan');
const nconf = require('nconf');
const pkg = require('./package.json');

// 先读取参数变量，然后读取环境变量。双下划线表示在读取环境变量时应该使用双下划线来表示对象层级，而读取参数变量则默认用冒号来表示对象层级。
// 例如要设置es下的host参数，通过环境变量的方式： $ es__host=other.host node server.js
// 通过参数变量的方式： $ node server.js --es:host=other.host
nconf.argv().env('__'); 

// 为conf参数设置了一个默认值，配置文件的路径是该默认值的json格式文件。
// 如果要用命令行参数覆盖配置文件路径，可以这样： $ node server.js --conf=/path/other.config.json
nconf.defaults({conf: `${__dirname}/config.json`});

// 告诉conf加载在conf路径中设置的文件
nconf.file(nconf.get('conf'));

const app = new express();
app.use(morgan('dev'));
app.get('/api/version', (req, res) => res.status(200).send(pkg.version));
require('./lib/search')(app, nconf.get('es'));
require('./lib/bundle')(app, nconf.get('es'));
app.listen(nconf.get('port'), () => console.log('Ready.')); // 通过get方法取得配置参数值