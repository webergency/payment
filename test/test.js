const Payment = require('../lib/payment');

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

let intent = payment.intent({ id: 1231, amount: 15312, currency: 'EUR' });

payment.verify({ id: 1231, amount: 15312, currency: 'EUR' }, intent );
