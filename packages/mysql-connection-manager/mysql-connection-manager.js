if(process.env.MYSQL_HOST) {
    mysqlManager = {};
    var mysqlConfig = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        connectionLimit: process.env.MYSQL_CONNECTION_LIMIT
    };

    var mysql = Npm.require('mysql');
    var MySQLConnectionManager = Npm.require('mysql-connection-manager');

    var options = {
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

    var pool = mysql.createPool(mysqlConfig);

    mysqlManager.manager = new MySQLConnectionManager(options, pool);

    mysqlManager.getPoolConnection = Meteor.wrapAsync(function (callback) {
        try {
            mysqlManager.manager.connection.getConnection(function (err, connection) {
                callback(err, connection);
            });
        } catch (e) {
            console.log('err');
            throw e;
        }
    });


    mysqlManager.manager.on('connect', function (connection) {
        console.log("Mysql connected")
    });

    mysqlManager.manager.on('reconnect', function (connection) {
        console.log("Mysql reconnected")
    });

    mysqlManager.manager.on('disconnect', function () {
        console.log("Mysql disconnected")
    });

    mysqlManager.fetchVNWData = Meteor.wrapAsync(function (query, callback) {
        var conn = mysqlManager.getPoolConnection();

        conn.query(query, function (err, rows, fields) {
            if (err) throw err;
            conn.release();
            callback(err, rows);
        });
    });
}