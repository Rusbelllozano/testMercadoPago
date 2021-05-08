var express = require('express');
var exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
var port = process.env.PORT || 3000

var app = express();
var mercadopago = require('mercadopago');
mercadopago.configure({
  access_token: 'APP_USR-2572771298846850-120119-a50dbddca35ac9b7e15118d47b111b5a-681067803',
  integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
});


app.engine('hbs', exphbs({ extname: 'hbs' }));
app.set('view engine', 'hbs');
// app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static('assets'));
// app.use(app.router);

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
  res.render('home');
});
app.get('/detail', function (req, res) {
  res.render('detail', req.query);
});

app.post('/checkout', function (req, res) {
  // console.log(req.body)

  var preference = {
    items: [
      {
        id:'1234',
        title: req.body.title,
        description:'Dispositivo móvil de Tienda e-commerce',
        quantity: parseInt(req.body.unit),
        picture_url: req.body.img,
        currency_id: 'COP',
        unit_price: parseInt(req.body.price)
      }
    ],
    payer: {
      "name": "Lalo",
      "surname": "Landa",
      "email": "test_user_83958037@testuser.com",
      "phone": {
        "area_code": "52",
        "number": 5549737300
      },
      "identification": {
        "type": "CC",
        "number": "681094118"
      },
      "address": {
        "street_name": "Insurgentes Sur",
        "street_number": 1602,
        "zip_code": "03940"
      }
    },
    back_urls: {
      "success": "https://rusbelllozano-mp-ecommerce.herokuapp.com/approved",
      "failure": "https://rusbelllozano-mp-ecommerce.herokuapp.com/failure",
      "pending": "https://rusbelllozano-mp-ecommerce.herokuapp.com/pending"
    },
    notification_url:"https://rusbelllozano-mp-ecommerce.herokuapp.com/notification",
    auto_return: "approved",
    payment_methods: {
      "excluded_payment_methods": [
        {
          "id": "amex"
        }
      ],
      "excluded_payment_types": [
        {
          "id": "atm"
        }
      ],
      "installments": 6
    },
    external_reference: "ruslllozano@gmail.com",
  };
  // console.log(preference);
  mercadopago.preferences.create(preference)
    .then(function (response) {
      // Este valor reemplazará el string "<%= global.id %>" en tu HTML
      res.redirect(response.body.init_point)
      // global.id = response.body.id;
    }).catch(function (error) {
      console.log(error);
    });
});

app.get('/approved', function (req, res) {
  let datos = {
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id
  }
  res.render('backurl-approved',datos)
});
app.get('/failure', function (req, res) {
  let datos = {
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id
  }
  res.render('backurl-failure',datos)
});
app.get('/pending', function (req, res) {
  let datos = {
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id
  }
  res.render('backurl-pending',datos)
});
app.post('/notification', function (req, res) {
  console.log(req.body)
    fs.writeFileSync(path.join(__dirname,'/public/reswebhook.json'),JSON.stringify(req.body))
    console.log(req.body)
    res.status(201)
    
});
app.listen(port);
