// Write your package code here!

//CONFIG : [module], config


var CONFIG = {};


Core = {};

Utils = {};

Core.imported = function () {
    return 'Core is imported!';
};

Core.registerConfig = function (module, configObj) {
    CONFIG[module] = CONFIG[module] || {};

    _.extend(CONFIG[module], configObj);
};

Core.getConfig = function (module, config) {
    if (module == void 0) return CONFIG;
    else if (config == void 0) return CONFIG[module];
    else if (CONFIG[module] == void 0) return null;
    else return CONFIG[module][config];
};