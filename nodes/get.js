const miio = require('miio');


module.exports = function (RED) {
    class MiioHumidifierGet {
        constructor(config) {
            RED.nodes.createNode(this, config);

            var node = this;
            node.config = config;
            node.cleanTimer = null;
            node.status({}); //clean

            //get server node
            node.server = RED.nodes.getNode(node.config.server);
            if (node.server) {
            } else {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: "node-red-contrib-miio-humidifier/get:status.server_node_error"
                });
            }



            node.status({}); //clean

            node.on('input', function (message_in) {
                clearTimeout(node.cleanTimer);
                var status = node.server.status;

                if (Object.keys(status).length) {

                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "node-red-contrib-miio-humidifier/get:status.received",
                    });

                    node.send({
                        payload: status,
                        status: status,
                        payload_in:message_in
                    });

                    node.cleanTimer = setTimeout(function () {
                        node.status({}); //clean
                    }, 3000);
                } else {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "node-red-contrib-miio-humidifier/get:status.device_not_set"
                    });
                }
            });
        }
    }

    RED.nodes.registerType('miio-humidifier-get', MiioHumidifierGet, {});
};