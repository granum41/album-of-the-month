require('dotenv').config();

const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const topPlayed = require('./spotify-albums.js');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:8888/callback';

// This file is copied from: https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/tutorial/00-get-access-token.js
const scopes = [
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
  ];
  
// credentials are optional
const spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
  });

const app = express();
app.set('json spaces', 2);
app.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log(`Sucessfully retreived access token. Expires in ${expires_in} s.` );
      res.redirect('myAlbums'); // TODO only one endpoint so redirect to it

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        spotifyApi.setAccessToken(access_token);
      }, expires_in / 2 * 1000);
    })
    .catch(error => {
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.get('/myAlbums', (req, res) => {
    topPlayed.getMyTopAlbums(spotifyApi)
    .then((topAlbum) => {
      console.log("Trying to send response..." + topAlbum);
      res.send(topAlbum);
    }).catch((error) => {
      console.log(error);
      res.send('Failed... ' + error);
    });
});

app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);