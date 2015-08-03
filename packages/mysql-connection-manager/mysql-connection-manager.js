if(Meteor.settings.hasOwnProperty('mysql')) {
    var mysqlConfig = Meteor.settings.mysql;
    var MySQLConnectionManager = Npm.require('mysql-connection-manager');

    var options = {
        host: mysqlConfig.host,
        port: 3306,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database,
        autoReconnect: true,// Whether or not to re-establish a database connection after a disconnect.
        reconnectDelay: [
            500,// Time between each attempt in the first group of reconnection attempts; milliseconds.
            1000,// Time between each attempt in the second group of reconnection attempts; milliseconds.
            5000,// Time between each attempt in the third group of reconnection attempts; milliseconds.
            30000,// Time between each attempt in the fourth group of reconnection attempts; milliseconds.
            300000// Time between each attempt in the fifth group of reconnection attempts; milliseconds.
        ],
        useConnectionPooling: true,// Whether or not to use connection pooling.
        reconnectDelayGroupSize: 5,// Number of reconnection attempts per reconnect delay value.
        maxReconnectAttempts: 25,// Maximum number of reconnection attempts. Set to 0 for unlimited.
        keepAlive: true,// Whether or not to send keep-alive pings on the database connection(s).
        keepAliveInterval: 30000// How frequently keep-alive pings will be sent; milliseconds.
    };

    mysqlManager = new MySQLConnectionManager(options);

    mysqlManager.on('connect', function (connection) {
        console.log("Mysql connected")
    });

    mysqlManager.on('reconnect', function (connection) {
        console.log("Mysql reconnected")
    });

    mysqlManager.on('disconnect', function () {
        console.log("Mysql disconnected")
    });
}