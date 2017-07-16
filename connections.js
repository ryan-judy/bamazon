const Promises = require('bluebird');
const MySQL = Promises.promisifyAll(require('mysql'));
Promises.promisifyAll(require("mysql/lib/Connection").prototype);
Promises.promisifyAll(require("mysql/lib/Pool").prototype);

var bamazonConnection = MySQL.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

let allConnections = {
	'bamazon' : bamazonConnection
};

module.exports = allConnections;