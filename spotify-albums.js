const SpotifyWebApi = require('spotify-web-api-node');
const {removeAttributes, sortMap} = require('./utils')

async function getMyTopAlbums(spotifyApi) {
  const data = await spotifyApi.getMyTopTracks();

  let albums = new Map();
  for(let track of data.body.items) {
    let album = track.album.id;

    if(albums.has(album)) {
      albums.get(album).count++;
    } else {
      albums.set(album, {count: 1});
    }
  }

  let topAlbums = {};
  for(let albumId of sortMap(albums).keys()) {
    let album = await getAlbum(albumId, spotifyApi);
    removeAttributes(album, 'available_markets'); // available_markets was annoyingly long and I don't wanna read it while debugging
    topAlbums[albumId] = album;
  }
  return topAlbums;
}

async function getAlbum(albumId, spotifyApi) {
  const album = await spotifyApi.getAlbum(albumId)
    .catch(err => {console.log(err)});
  return album.body;
}

module.exports.getMyTopAlbums = getMyTopAlbums;