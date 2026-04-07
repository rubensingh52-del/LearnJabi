import express from 'express';
const app = express();
try {
    app.get('{*path}', (req, res) => res.send('ok'));
    console.log('Express matched {*path} successfully');
} catch (e) {
    console.error('Express failed to match {*path}: ', e.message);
}
