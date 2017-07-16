//COMMANDS
//node bamazonCustomer.js

let Inquirer = require('inquirer');
const bamazonConnection = require('./connections.js').bamazon;

bamazonConnection.queryAsync("SELECT * FROM products").then( res => {

	for (var i = 0; i < res.length; i++) {
          console.log(
            "ID: " +
            res[i].item_id +
            " || Name: " +
            res[i].product_name +
            " || Price: " +
            res[i].price +
            " || Quantity: " +
            res[i].stock_quantity
          );
        }   
	
	function shoppingCart(){	
    	const questions = [
			{
				type : "text",
				name : "id",
				message: "What's product ID of item you would like to buy?"
			},
			{
				type : "text",
				name : "quantity",
				message : "How many units of this item you would like to buy?"
			}	
		];	

		Inquirer.prompt(questions).then( data => {
			bamazonConnection.queryAsync("SELECT stock_quantity, product_name, price FROM products WHERE item_id = ?", [data.id])
			.then( res => {	
				if (res[0].stock_quantity > data.quantity) {
					let supply = res[0].stock_quantity - data.quantity;
					let total = parseInt(res[0].price) * parseInt(data.quantity);
						bamazonConnection.queryAsync("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [supply, data.id])
						.then( log => {	
							console.log(`You're purchasing ${data.quantity} ${res[0].product_name}s. Your total comes to $${total}.`);
						} )
						.catch( err => { throw err });	
						bamazonConnection.end();
				}

				else {
					console.log(`I'm sorry, we don't have ${data.quantity}. Please order ${res[0].stock_quantity} or less.`);
					shoppingCart();
				}
			});
		});
	};

	shoppingCart();

});