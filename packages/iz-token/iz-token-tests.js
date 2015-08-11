Tinytest.add('IZToken apis', function(test) {
    var payload = {
        foo: 'bar'
    };
    var secret = 'xxx';

    // encode 
    var token = IZToken.encode(payload, secret);

    // decode 
    var decoded = IZToken.decode(token, secret);
    test.equal(payload, decoded);
});
