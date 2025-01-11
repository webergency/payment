# @webergency/payment
Online Payment Service

Payment Gateway Initialization
```js
const Payment = require('@webergency/payment');

const payment = new Payment(
{
    gateway: 
    {
        stripe: 
        {
            secret_key  : 'sk_test_RMjWjkdAqQGkbgsV95KGTq6c00PBMRcMAS',
            publish_key : 'pk_test_YRFq7gkARUGGPCujan2l9ri900OvyFWI83'
        }
    },
    callback:
    {
        url : 'https://ecommerce.webergency.com/payment',
    }
});
```
Creating new payment intent
```js
let intent = payment.intent({ id: 1231, amount: 15312, currency: 'EUR' });
```
Getting intent ID from intent token
```js
let id = payment.id( intent_token );
```
Veryfying signed payment intent token
```js
payment.verify({ id: 1231, amount: 15312, currency: 'EUR' }, intent_token );
```