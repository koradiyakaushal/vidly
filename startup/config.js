const config = require('config');

module.exports = function () {
    if (!config.get('jwtPrivateKey')) {
        // console.error('FATAL Error: jwtkey not provided');
        config['jwtPrivateKey'] = 'jwtkey';
        // process.exit(1);
        // throw new Error('FATAL Error: jwtkey not provided');
    }
};
