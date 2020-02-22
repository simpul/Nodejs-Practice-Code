const express = require('express');
const morgan = require('morgan'); // 提供了HTTP请求日志记录功能

const app = new express();
app.use(morgan('dev'));
app.get('/hello/:name', (req, res) => {
    res.status(200).json({'hello': req.params.name});
});
app.listen(60701, () => console.log('Ready.'));