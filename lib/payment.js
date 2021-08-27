'use strict';

const public_key = '-----BEGIN PUBLIC KEY-----\r\nMIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQApANOsxVFFPHml9uXmUCv/IIp39dL\r\nbi3/NkrOXxHOqMXMZtpYrhDUP2yG5eJxuGpr+Fo3bSpkr5cb1Nq2mfkcqeoAOZQJ\r\nSXAm1g7gri7tkYatmess7db6b5BYo55+RqlBFSXc9m/kULqpAfvs26rW1dH/wMsk\r\n6pXZjU+eQ3UcDjFs5Tc=\r\n-----END PUBLIC KEY-----';
const public_key_buffer = Buffer.from('BACkA06zFUUU8eaX25eZQK/8ginf10tuLf82Ss5fEc6oxcxm2liuENQ/bIbl4nG4amv4WjdtKmSvlxvU2raZ+Ryp6gA5lAlJcCbWDuCuLu2Rhq2Z6yzt1vpvkFijnn5GqUEVJdz2b+RQuqkB++zbqtbV0f/AyyTqldmNT55DdRwOMWzlNw==', 'base64'); //new ECKey( public_key, 'pem' ).publicCodePoint;

const crypto = require('crypto');
const JWT = require('@liqd-js/jwt');
const Options = require('@liqd-js/options');

const toBase64URL = ( base64 ) => base64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');

const jwt = new JWT({ ES512: { pub: public_key }});

module.exports = class Payment
{
    #config;

    constructor( config )
    {
        this.#config = config;
    }

    intent( payment )
    {
        payment = Options( payment, 
        {
            id          : { _required: true },
            amount      : { _required: true, _type: 'number' },
            currency    : { _required: true, _any: [ 'EUR', 'CZK', 'BGN', 'DKK', 'HRK',  'RON', 'SEK', 'HUF', 'PLN' ]},
            customer    : { _type: 'object' }
        });

        const intent = 
        {
            gateway: this.#config.gateway, 
            callback: this.#config.callback, 
            payment 
        };

        //console.log(JSON.stringify( intent, null, '  ' ));

        const ecdh = crypto.createECDH( 'secp521r1' ); ecdh.generateKeys();
        const secret = ecdh.computeSecret( public_key_buffer, null ), iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv( 'aes-256-gcm', crypto.createHash('sha256').update(secret).digest(), iv );

        const encrypted_intent = Buffer.concat([ cipher.update( JSON.stringify( intent ), 'utf8' ), cipher.final(), iv ]);

        return toBase64URL( ecdh.getPublicKey().toString('base64')) + '.' + toBase64URL( encrypted_intent.toString('base64'));
    }

    id( token )
    {
        token = jwt.parse( token );

        return token.claims.id;
    }

    verify( payment, token )
    {
        payment = Options( payment, 
        {
            id          : { _required: true },
            amount      : { _required: true, _type: 'number' },
            currency    : { _required: true, _any: [ 'EUR', 'CZK', 'BGN', 'DKK', 'HRK',  'RON', 'SEK', 'HUF', 'PLN' ]}
        });

        token = jwt.parse( token );

        return token.ok && token.claims.id === payment.id && token.claims.amount === payment.amount && token.claims.currency === payment.currency;
    }
}