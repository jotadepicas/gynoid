
const Gynoid = require('./lib/gynoid');

module.exports = function (context) {
  const cluster = require('../../lib/cluster');
  const gynoid = new Gynoid(cluster);

  return {
    registerGynoid: (req, res) => {
      gynoid.registerGynoid(req, res);
    },
    unregisterGynoid: (req, res) => {
      gynoid.unregisterGynoid(req, res);
    },
    reloadGynoid: function (req, res) {
      gynoid.reloadGynoid(req, res);
    },
    extendDroid: function (req, res) {
      gynoid.extendDroid(req, res);
    },
    removeExtension: function (req, res) {
      gynoid.removeExtension(req, res);
    },
    listExtensions: function (req, res) {
      gynoid.listExtensions(req, res);
    },
    listDroids: function (req, res) {
      gynoid.listDroids(req, res);
    },
    ping: function (req, res) {
      gynoid.ping(req, res);
    },
    addKey: function (req, res) {
      gynoid.addKey(req, res);
    },
    removeKey: function (req, res) {
      gynoid.removeKey(req, res);
    },
    listKeys: function (req, res) {
      gynoid.listKeys(req, res);
    },
    listAllKeys: function (req, res) {
      gynoid.listAllKeys(req, res);
    },
    secure: function (req, res) {
      gynoid.secure(req, res);
    }
  };
};
