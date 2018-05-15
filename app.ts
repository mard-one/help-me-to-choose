import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path';

// tslint:disable-next-line:no-var-requires
import * as selectionAlgorithm from './src/js/selectionAlgorithm';

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client/dist'));

app.post('/dataProcess', (req, res) => {
  selectionAlgorithm(req.body, function callback(output: any) {
    console.log('output', output);
    res.send(output);
  });
});

app.get('/', (req, res) => {
  res.send(path.join(__dirname, 'public/dist/index.js'));
});

app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), (err: any) => {
  console.log('Listening on port ' + app.get('port'));
});
