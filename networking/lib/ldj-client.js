const EventEmitter = require('events');
class LDJClient extends EventEmitter {
    constructor(stream) {
        super();
        let buffer = '';
        stream.on('data', data => {
            buffer += data;
            let boundary = buffer.indexOf('\n'); // LDJ数据以换行符作为结束符号
            while (boundary !== -1) {
                const input = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1); // 将buffer重置为空字符串
                this.emit('message', JSON.parse(input));
                boundary = buffer.indexOf('\n'); // 将boundary设置为-1，跳出循环
            }
        })
    }
    static connect(stream) {
        return new LDJClient(stream);
    }
}

module.exports = LDJClient