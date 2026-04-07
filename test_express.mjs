import express from 'express';
const app = express();
try {
    app.get('*', (req, res) => res.send('ok'));
    console.log('Express matched * successfully');
} catch (e) {
    console.error('Express failed to match *: ', e.message);
}
