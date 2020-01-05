const EventEmitter = require('events');
const miio = require('miio');

module.exports = function (RED) {
    class ServerNode {
        constructor(n) {
            RED.nodes.createNode(this, n);

            var node = this;
            node.config = n;
            node.state = [];
            node.status = {};

            node.setMaxListeners(255);
            node.refreshFindTimer = null;
            node.refreshFindInterval = node.config.polling * 1000;
            node.on('close', () => this.onClose());

            node.connect().then(result => {
                node.getStatus(true).then(result => {
                    node.emit("onInitEnd", result);
                });
            });

            node.refreshStatusTimer = setInterval(function () {
                node.getStatus(true);
            }, node.refreshFindInterval);
        }

        onClose() {
            var that = this;
            clearInterval(that.refreshStatusTimer);

            if (that.device) {
                that.device.destroy();
                that.device = null;
            }
        }

        connect() {
            var node = this;

            return new Promise(function (resolve, reject) {
                node.miio = miio.device({
                    address: node.config.ip,
                    token: node.config.token
                }).then(device => {
                    node.device = device;
                    node.device.updateMaxPollFailures(0);

                    node.device.on('thing:initialized', () => {
                        node.log('Miio humiditifier: Initialized');
                    });

                    node.device.on('thing:destroyed', () => {
                        node.log('Miio humiditifier: Destroyed');
                    });

                    resolve(device);

                }).catch(err => {
                    node.emit('onConnectionError', err.message);
                    node.warn('Miio humiditifier Error: ' + err.message);
                    reject(err);
                });
            });
        }

        getStatus(force = false) {
            var that = this;

            return new Promise(function (resolve, reject) {
                if (force || !that.status) {
                    if (that.device !== null && that.device !== undefined) {
                        that.device.loadProperties(["power", "humidity", "child_lock", "dry", "depth", "limit_hum", "mode", 'buzzer', 'led_b', 'temp_dec']).then(result => {

                            that.emit("onState", result);

                            for (var key in result) {
                                var value = result[key];
                                if (key in that.status) {
                                    if (!(key in that.status) || that.status[key] !== value) {
                                        that.status[key] = value;
                                        that.emit("onStateChanged", {key: key, value: value}, true);
                                    }
                                } else { //init: silent add
                                    that.status[key] = value;
                                    that.emit("onStateChanged", {key: key, value: value}, false);
                                }
                            }

                            resolve(that.status);
                        }).catch(err => {
                            console.log('Encountered an error while controlling device');
                            console.log('Error(1) was:');
                            console.log(err.message);
                            that.status = {};
                            that.emit('onConnectionError', err.message);
                            reject(err);
                        });

                    } else {
                        that.connect();
                        that.status = {};
                        that.emit('onConnectionError', 'No device');
                        reject('No device');
                    }
                } else {
                    resolve(that.status);
                }
            });
        }

    }

    RED.nodes.registerType('miio-humidifier-server', ServerNode, {});
};

