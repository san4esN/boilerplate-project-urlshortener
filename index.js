import express from 'express';
import cors from 'cors';
const app = express();
import bodyParser from 'body-parser';
import { promises } from 'dns';
import { nanoid } from "nanoid";
import urls from "url"
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.all('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlMap= new Map();
function shorteningURL(longURL){
  if(urlMap.has(longURL)){
    return urlMap.get(longURL);
  }
  const shortURL = nanoid(10);
  urlMap.set(shortURL,longURL);
  urlMap.set(longURL,shortURL);
  return shortURL;
}

function lengtheningURL(shortURL){
  return urlMap.get(shortURL);

}
app.post('/api/shorturl', function(req, res) {  
  //const dnsPromice = promises
  const url = urls.parse(req.body.url) 
  promises.lookup(url.hostname||"null")
  .then((result)=>{
  const shortURL = shorteningURL(url);
  urlMap.set(url,shortURL);
  res.json({original_url: url.href, short_url: shortURL})
  })
  .catch((result)=>{
    res.json({error:"invalid url"})
  })
});

app.get('/api/shorturl/:url?',function(req,res){
  if(req.statusCode===301 || req.statusCode===302) {
    return;
  }
  const shortURL = req.params.url;
  const longURL = lengtheningURL(shortURL);
  res.redirect(longURL.href)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});