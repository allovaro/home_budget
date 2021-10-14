const Express = require('express');
const Cors = require('cors');
const Keeper = require('./calc_data');

const app = Express();
const myEx = new Keeper('./db.db');

const host = '127.0.0.1';
const port = 7000;

app.use(Express.json());
app.use(Cors());

(async () => {
    await myEx.connectDb();
})();

app.get('/api/get_all_tags/:year', async (req, res) => {
    const { year } = req.params;
    const tags = await myEx.getAvailableTags(year);
    // const myJson = JSON.stringify({ allTags: tags });
    res.json({ allTags: tags });
});

app.get('/api/get_categories/:year', async (req, res) => {
    const { year } = req.params;
    const categories = await myEx.getAvailableCategories(year);
    // const myJson = JSON.stringify({ allTags: tags });
    res.json({ categories });
});

app.get('/api/get_accounts/:year', async (req, res) => {
    const { year } = req.params;
    const categories = await myEx.getAvailableAccounts(year);
    // const myJson = JSON.stringify({ allTags: tags });
    res.json({ categories });
});

app.get('/about', (req, res) => {
    res.status(200).type('text/plain');
    res.send('About page');
});

app.post('/api/get_statistics', async (req, res) => {
    const retVal = await myEx.getStats(req.body);
    res.status(200).type('text/plain');
    res.send(retVal);
});

app.post('/api/user', (req, res) => {
    res.status(200).type('text/plain');
    res.send('Create user request');
});

app.use((req, res, next) => {
    res.status(404).type('text/plain');
    res.send('Not found');
});

app.listen(port, host, () => {
    console.log(`Server listens http://${host}:${port}`);
});
