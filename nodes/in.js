const miio = require('miio');

module.exports = function (RED) {
    class MiioHumidifierInput {
        constructor(n) {
            RED.nodes.createNode(this, n);

            var node = this;
            node.config = n;

            node.setMaxListeners(255);
            node.on('close', () => this.onClose());

            if (node.config.ip && node.config.token) {
                node.connect().then(result => {
                    node.getStatus(true).then(result => {

                    });
                });

                node.refreshStatusTimer = setInterval(function () {
                    node.getStatus(true);
                }, 10000);
            }
        }

        onClose() {
            var that = this;

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
                        node.log('Miio Humidifier: Initialized');
                    });

                    node.device.on('thing:destroyed', () => {
                        node.log('Miio Humidifier: Destroyed');
                    });

                    resolve(device);
                }).catch(err => {
                    node.warn('Miio Humidifier Error: ' + err.message);
                    reject(err);
                });
            });
        }

        getStatus(force = false) {
            var node = this;

            return new Promise(function (resolve, reject) {
                if (force) {
                    if (node.device !== null) {
                        node.device.loadProperties(["power", "humidity", "child_lock", "dry", "depth", "limit_hum", "mode"])
                            .then(device => {
                                node.send({
                                    'payload': node.formatHomeKit(device)
                                });
                            }).catch(err => {
                                console.log('Encountered an error while controlling device');
                                console.log('Error(2) was:');
                                console.log(err.message);
                                node.connect();
                                reject(err);
                            });
                    } else {
                        node.connect();
                        reject('No device');
                    }
                } else {
                    resolve();
                }
            });
        }

        formatHomeKit(result) {
            var msg = {};

            if (result.power === "on") {
                msg.Active = 1;
                msg.CurrentHumidifierDehumidifierState = 2;
            } else if (result.power === "off") {
                msg.Active = 0;
                msg.CurrentHumidifierDehumidifierState = 0;
            }
            if (result.child_lock === "on") {
                msg.LockPhysicalControls = 1;
            } else if (result.child_lock === "off") {
                msg.LockPhysicalControls = 0;
            }
            if (result.dry === "on") {
                msg.SwingMode = 1;
            } else if (result.dry === "off") {
                msg.SwingMode = 0;
            }

            if (result.mode === "auto") {
                msg.RotationSpeed = 25;
            } else if (result.mode === "silent") {
                msg.RotationSpeed = 50;
            } else if (result.mode === "medium") {
                msg.RotationSpeed = 75;
            } else if (result.mode === "high") {
                msg.RotationSpeed = 100;
            } else {
                msg.RotationSpeed = 0;
            }

            msg.WaterLevel = Math.ceil(result.depth / 1.2);
            msg.CurrentRelativeHumidity = result.humidity;
            msg.TargetHumidifierDehumidifierState = 1;
            msg.RelativeHumidityHumidifierThreshold = result.limit_hum;

            return msg;
        }
    }

    RED.nodes.registerType('miio-humidifier-input', MiioHumidifierInput, {});
};