const fs = require('fs');
const request = require('request');
const program = require('commander');
const pkg = require('./package.json');

// 生成URL，这里一个完整的url为域名+索引+类型+path
const fullUrl = (path = '') => {
    let url = `http://${program.host}:${program.port}/`;
    if (program.index) {
        url += program.index + '/';
        if (program.type) {
            url += program.type + '/';
        }
    }
    return url + path.replace(/^\/*/, '');
};

// 负责处理响应的函数
const handleResponse = (err, res, body) => {
    if (program.json) {
        console.log(JSON.stringify(err || body));
    } else {
        if (err) throw err;
        console.log(body);
    }
}

program
    .version(pkg.version) // 设置版本信息
    .description(pkg.description) // 设置描述信息
    .usage('[options] <command> [...]') // 设置用法字符 <>表示必备参数  []表示可选参数
    .option('-o, --host <hostname>', 'hostname [localhost]', 'localhost') // 可用指令，第一个参数为指令格式，第二个参数为指令描述，第三个为无传参时的默认值。对应的参数都会添加到program这个对象中去。
    .option('-p, --port <number>', 'port number [9200]', '9200')
    .option('-j, --json', 'format output as JSON') // 指令中没有参数时候对应的是一个布尔值，如果添加了该指令则对应的变量为true，否则为false
    .option('-i, --index <name>', 'which index to use')
    .option('-t, --type <type>', 'default type for bulk operations')
    .option('-f, --filter <filter>', 'source filter for query results');

// 输出url
// 例：$ ./esclu url 'some/path' -p 8080 -o my.cluster
program
    .command('url [path]')
    .description('generate the URL for the options and path (default is /)')
    .action((path = '/') => console.log(fullUrl(path)));

// 调用get方法获得Elasticsearch对应目录的信息
// 调用get '_cat' 提供一个可读的API来评估群集的健康状态
// 例：$ ./esclu get '_cat'
program
    .command('get [path]')
    .description('perform an HTTP GET request for path (default is /)')
    .action((path = '/') => {
        const options = {
            url: fullUrl(path),
            json: program.json,
        };
        request(options, handleResponse)
    })

// 使用put方法创建新索引
// 用get '_cat/indices?v'查看所有的索引状态
// 例：$ ./esclu create-index --index books   可以创建一个名为books的索引
program
    .command('create-index')
    .description('create an index')
    .action(() => {
        if (!program.index) {
            const msg = 'No index specified! Use --index <name>';
            if (!program.json) throw Error(msg);
            console.log(JSON.stringify({error: msg}));
            return;
        }
        request.put(fullUrl(), handleResponse);
    })

// 列出Elasticsearch的索引
// 例：$ ./esclu li -j
program
    .command('list-indices')
    .alias('li') // 可用简化命令li来执行
    .description('get a list of indices in this cluster')
    .action(() => {
        const path = program.json ? '_all' : '_cat/indices?v'; // 在命令添加了--json的情况下访问/all会返回一个对象，键是索引的名称，值包含相关索引的信息。
        request({url: fullUrl(path), json: program.json}, handleResponse);
    });

// 批量插入Elasticsearch文档(ldj格式)
// 例：$ ./esclu bulk ./data/bulk_pg.ldj -i books -t book > ./data/bulk_result.json
program
    .command('bulk <file>')
    .description('read and perform bulk options from the specified file')
    .action(file => {
        fs.stat(file, (err, stats) => { // 判断文件的状态
            if (err) {
                if (program.json) {
                    console.log(JSON.stringify(err));
                    return;
                }
                throw err;
            }
            const options = {
                url: fullUrl('_bulk'), // _bulk API期望接受JSON格式内容
                json: true,
                headers: {
                    'content-length': stats.size, // 很重要，需要将文件内容以流的形式传输给服务器
                    'content-type': 'application/json',
                }
            };

            const req = request.post(options); // 此对象可以作为可写流发送，也可作为可读流接受服务器的响应
            const stream = fs.createReadStream(file);
            stream.pipe(req); // 将文件内容以流的形式写入请求
            req.pipe(process.stdout); // 将请求后的响应以流的形式在命令行中显示
        })
    })

// 根据参数进行查询
program
    .command('query [queries...]') // 该命令支持任意数量的参数（甚至为0）
    .alias('q')
    .description('perform an Elasticsearch query')
    .action((queries = []) => {
        const options = {
            url: fullUrl('_search'),
            json: program.json,
            qs: {},
        };
        if (queries && queries.length) {
            // 将查询参数通过空格连接起来，赋值给参数q
            options.qs.q = queries.join(' ');
        }
        if (program.filter) {
            options.qs._source = program.filter;
        }
        request(options, handleResponse);
    });

// 通过parse来解析命令行选项
program.parse(process.argv);

// 当用户输入我们无法识别的参数时候调用-h（查看帮助）
if (!program.args.filter(arg => typeof arg === 'object').length) {
    program.help();
}