define(function(require) {
  require('lib/socket.io');

  var socket = io.connect('http://localhost:8080');
  socket.emit('join');
  socket.on('awaiting', function(data) {
    console.log('Waiting for an opponent');
  });
  socket.on('gamestarted', function(data) {
    console.log('Game started');
  });
  socket.on('gamewon', function(data) {
    console.log('Game WON! \o/');
  });
});
