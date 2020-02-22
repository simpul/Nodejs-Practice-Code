### 2. 文件操作--filesystem

watcher-argv.js 监听某个文件变化

watcher-spawn.js 监听某个文件变化后创建子进程执行系统命令

watcher-spawn-parse.js 使用eventemitter类

cat.js read-stream.js  创建读写流



### 3. Socket网络编程--networking

net-watcher.js 建立一个简单的socket连接

net-watcher-unix.js  简单的unix socket

net-watcher-json-service.js JSON格式的信息

net-watcher-json-client.js 建立socket客户端连接

test-json-service.js 模拟将一条信息因连接中断而分两次发送的服务器

lib/ldj-client.js  实现一个LDJ缓存模块解决客户端分块获取JSON消息的问题

net-watcher-ldj-client.js 引用上面模块的一个服务器

test/ldj-client-test.js 使用Mocha对封装的LDJ模块进行单元测试



### 4. 创建健壮的微服务--microservices

zmq-watcher.pub.js 使用zeromq模块实现发布/订阅模式中的发布者

zmq-watcher-sub.js  对应上述模式的订阅者

![A4C7A944-62C5-4440-9286-BA48FB37AD0A](/Users/taozi/Library/Containers/com.tencent.qq/Data/Library/Application Support/QQ/Users/562778710/QQ/Temp.db/A4C7A944-62C5-4440-9286-BA48FB37AD0A.png)

zmq-filer-rep.js 请求/响应模式中的响应器

zmq-filer-req.js 请求器

![E589CF27-FA6B-4657-86AA-196BBA855C3D](/Users/taozi/Library/Containers/com.tencent.qq/Data/Library/Application Support/QQ/Users/562778710/QQ/Temp.db/E589CF27-FA6B-4657-86AA-196BBA855C3D.png)

 并行处理信息模式：ROUTER/DEALER模式。

ROUTER socket可理解为REP socket的并发版，处理多个请求，并记录每个请求来自哪个链接，在响应时找到对应的来源。DEALER socket则是并行的REQ socket，能够并行发出多个请求。在ROUTER和DEALER之间创建一个传输管道：ROUTER接收请求后转发给DEALER，然后DEALER发送给跟它连接的响应器。在接收到响应后转发给ROUTER，ROUTER再根据消息的帧记录的来源数据决定将消息返回给哪个REQ。

![image-20200216153723201](/Users/taozi/Library/Application Support/typora-user-images/image-20200216153723201.png)

zmq-filer-rep.cluster.js  利用cluster模块创建多个子进程用于响应请求，并且使用ipc与主进程中的DEALER进行通信

![image-20200216155414046](/Users/taozi/Library/Application Support/typora-user-images/image-20200216155414046.png)

zmq-filer-req-loop.js 用于持续发出请求，测试上述的cluster用例。



### 5.  数据转换--database

本章使用Node把XML数据转换为按行分隔的JSON格式（LDJ），其中要处理的目标数据保存在data目录下，开发的程序和配置文件保存在databases目录下。

test/parse-rdf-test.js  基于Mocha和Chai（断言库）的行为驱动开发

lib/parse-rdf.js  使用cheerio解析rdf内容，提取需要的属性

rdf-to-json.js  提取rdf文件转换为json格式输出

rdf-to-bulk.js  通过node-dir模块遍历目录树将所有rdf文件遍历并解析成Elasticsearch能够批量导入的格式（data/bulk_pg.ldj为执行后的结果）



### 6. 操作数据库--esclu

本章使用上一章从XML经过处理成LDJ格式的JSON文件，存储到Elasticsearch数据库中。本章节使用Elasticsearch v5.2，下载地址：https://www.elastic.co/downloads/past-releases/elasticsearch-5-2-2 ，解压后在命令行运行bin/elasticsearch。另外需要Java 8的运行时环境，请安装JDK的1.8.0_73或更高版本。

esclu 可执行文件，使用$ chmod +x esclu 命令赋予它执行权限

index.js  用nodejs实现与文档数据库Elasticsearch进行交互



### 7. 开发RESTful Web 服务--web-services

运用Express + nconf + request 开发服务端API



### 8. 打造漂亮的用户界面--ux

webpack+Bootstrap+typescript+handlebars

实现哈希路由，展示页面



### 9. 使用Node-RED进行流式开发--nodered













