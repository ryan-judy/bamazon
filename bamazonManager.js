//COMMANDS
//node bamazonManager.js  

let Inquirer = require('inquirer');
const bamazonConnection = require('./connections.js').bamazon;

bamazonConnection.queryAsync("SELECT * FROM products").then( res => {

  let initialize = function() {
    const initialize = [
      {
        name: "operation",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product",
          "Log Out"
        ]
      }];  

    Inquirer.prompt(initialize).then( data => {
      if( data.operation === "View Products for Sale") {
        displayProducts();
       }


      if( data.operation === "View Low Inventory" ){
        viewInventory();
      }


      if( data.operation === "Add to Inventory" ){
        addStock();
      }


      if( data.operation === "Add New Product" ){
        addProduct();
      }

      if( data.operation === "Log Out" ){
        bamazonConnection.end();
      }

      });
  };

  initialize();

  let displayProducts = function() {
    for (var i = 0; i < res.length; i++) {
      console.log(
        "ID: " +
        res[i].item_id +
        " || Name: " +
        res[i].product_name +
        " || Department: " +
        res[i].department_name +
        " || Price: $" +
        res[i].price +
       " || Quantity: " +
        res[i].stock_quantity
      );
    }

    initialize();

  };  


  let viewInventory = function() {
    bamazonConnection.queryAsync("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < 5")
      .then( data => {
        for (var i = 0; i < data.length; i++) {
          console.log(
            "ID: " +
            data[i].item_id +
            " || Name: " +
            data[i].product_name +
            " || Department: " +
            data[i].department_name +
            " || Price: $" +
            data[i].price +
            " || Stock: " +
            data[i].stock_quantity
          );
        } 
      })
      .then( () => initialize() );  
  }

  let addStock = function() {
    choices = res.map( item => {
                return {
                  name: [`Item: ${item.product_name} || Stock: ${item.stock_quantity}`],
                  value: item.item_id
                }
    })

    const questions = [
      {
        type: 'list',
        name: 'inventoryChoice',
        message: 'Which item would you like to add Inventory?',
        choices: choices
      },
      {
        type : "text",
        name : "quantity",
        message : "How many units of this item you would like to add?"
      } 
    ];  

    Inquirer.prompt(questions).then( data => {
      bamazonConnection.queryAsync("SELECT stock_quantity, product_name, price FROM products WHERE item_id = ?", [data.inventoryChoice])
        .then( res => { 
          let newSupply = parseInt(res[0].stock_quantity) + parseInt(data.quantity);
          bamazonConnection.queryAsync("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newSupply, data.inventoryChoice])
            .then( log => { 
              console.log(`You've added ${data.quantity} units to ${res[0].product_name}s.`);
            })
            .then( () => initialize() );
        });
      });
  }

  let addProduct = function() {
    const questions = [
       {
         type : "text",
         name : "item",
         message: "What is the item would you like to add?"
       },
       {
         type : "list",
         name : "department",
         message : "Which department is that in?",
         choices : ['electronics', 'toys', 'patio and garden', 'video games', 'sports and outdoors', 
         'personal care', 'school and office supplies', 'pets', 'furniture', 'food and drink', 'home', 
         'accessories', 'clothing', 'personal care', 'miscellaneous']
       },
       {
         type : "text",
         name : "price",
         message : "How much will this item cost? (Do not include $)"
       },
       {
         type : "text",
         name : "stock",
         message : "How many of these would you like to add?"
       }
   ];  

    Inquirer.prompt(questions).then( data => {
      const insertQuery = "INSERT INTO products ( product_name, department_name, price, stock_quantity ) VALUES (?, ?, ?, ?)";
   
      bamazonConnection.queryAsync(insertQuery, [data.item, data.department, data.price, data.stock])
        .then( () => console.log("You've added an item.") )
        .then( () => initialize() );
    })

  }

});