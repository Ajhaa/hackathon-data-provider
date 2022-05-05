import express from 'express'
import Rand from 'rand-seed';
import { fileHandler, fileWriter } from "./src/fileHandler";
import { User } from "./src/types";
import { randomElementSeed } from "./src/util";
import { getCoordinates } from "./src/coordinates";
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

function setHeaders(res : express.Response) {
    res.header("Content-Type",'application/json')
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Cache-Control", "private, max-age=0")
}

async function getUserWithSeed(req) {
    const usersJson = await fileHandler("./data/users.json")
    const users: User[] = JSON.parse(usersJson)
    const seed = new Rand(req.headers['seed'] as string || 'drWho')
    const user = randomElementSeed(seed, users);
    return user;
}

app.get('/me',  async (req, res) => {
    const json = await fileHandler("./data/users.json")
    setHeaders(res)
    const users: User[] = JSON.parse(json)
    const seed = new Rand(req.headers['seed'] as string || 'drWho')
    res.send(randomElementSeed(seed, users))
})

app.get('/users', async (req, res) => {
    const users = await fileHandler("./data/users.json")
    setHeaders(res)
    res.send(users)
})

app.get('/activities', async (req, res) => {
    const activities = await fileHandler("./data/activities.json")
    setHeaders(res)
    res.send(activities)
})

app.get('/fromFlights', async (req, res) => {
    const fromFlights = await fileHandler("./data/fromFlights.json")
    setHeaders(res)
    res.send(fromFlights)
})

app.get('/toFlights', async (req, res) => {
    const toFlights = await fileHandler("./data/toFlights.json")
    setHeaders(res)
    res.send(toFlights)
})

app.get('/coordinates', async (req, res) => {
    const userJson = await fileHandler("./data/users.json")
    setHeaders(res)
    const users = JSON.parse(userJson).map(u => ({ userId: u.id, coordinates: getCoordinates() }))
    res.send(JSON.stringify(users))
})

app.get('/flags', async (req, res) => {
    const flagsJson = await fileHandler("./data/flags.json")
    setHeaders(res)
    let flags = JSON.parse(flagsJson);
    if (req.query.sort === 'votes') {
        flags = flags.sort((f1, f2) => f2.votes.length - f1.votes.length);
    }
    res.send(JSON.stringify(flags))
});

app.post('/flags', async (req, res) => {
    const flagsJson = await fileHandler("./data/flags.json")
    const flags = JSON.parse(flagsJson);
    const newFlag = req.body;
    flags.push(newFlag);
    await fileWriter('./data/flags.json', JSON.stringify(flags, null, '  '));
    res.status(200).end();
});

app.post('/flags/:id/vote', async (req, res) => {
    const user = await getUserWithSeed(req);
    const flagsJson = await fileHandler("./data/flags.json")
    const flags = JSON.parse(flagsJson);
    for (let flag of flags) {
        if (flag.id === req.params.id) {
            if (!flag.votes.includes(user.id)) flag.votes.push(user.id);
        }
    }
    await fileWriter('./data/flags.json', JSON.stringify(flags, null, '  '));
    res.status(200).end();
});

app.options('/me',  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
    res.header("Access-Control-Allow-Headers", "seed")
    res.sendStatus(204)
})

app.get('/robots.txt',  async (req, res) => {
    res.header("Content-Type",'text/plain');
    res.send('User-agent: *\nDisallow: /')
})

app.listen(PORT)

console.log(`App listening on ${PORT}`)
