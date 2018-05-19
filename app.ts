import * as express from 'express';
import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path';

// tslint:disable-next-line:no-var-requires
import * as selectionAlgorithm from './src/js/selectionAlgorithm';

mongoose.connect(
  'mongodb://userhelper:userhelper@ds129540.mlab.com:29540/help-me-to-choose',
  err => {
    if (err) {
      console.log('Could NOT connect to database: ', err);
    } else {
      console.log('Connected to database');
    }
  }
);

const schema = new Schema({
  rawData: [
    {
      priority: Number,
      name: String,
      rankGroup: [
        {
          rank: Number,
          name: String
        }
      ]
    }
  ],
  resultData: [
    {
      totalRank: Number,
      name: String
    }
  ],
  date: { type: Date, default: Date.now }
});

const ResultData = mongoose.model('ResultData', schema);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client/dist'));

app.post('/dataProcess', (req, res) => {
  selectionAlgorithm(req.body, function callback(output: any) {
    const result = new ResultData({
      rawData: req.body,
      resultData: output
    });
    result.save();
    res.send(output);
  });
});

app.get('/', (req, res) => {
  res.send(path.join(__dirname, 'public/dist/index.js'));
});

app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'), (err: any) => {
  console.log('Listening on port ' + app.get('port'));
});
