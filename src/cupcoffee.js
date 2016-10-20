var CupcoffeControllers = function() {
    return this;
}

var CupcoffeServices = {},
    CupcoffeGlobais = {
        cache: {}
    };

var Cupcoffe = function() {
    this.init = function() {
        if (CupcoffeConfig) {
            if ($.RestClient) {
                var rest = new $.RestClient(CupcoffeConfig.rest.host, CupcoffeConfig.rest.options || {})
                if (CupcoffeConfig.rest.config) {
                    for (var key in CupcoffeConfig.rest.config) {
                        rest.add(key, CupcoffeConfig.rest.config[key])
                    }
                }
                this.global('rest', rest);
            }
        }
        return this;
    }

    if (Vue) {
        this.vue = function(name, options) {
            if (options) {
                var vue = new Vue(options)
                this.global('Vue_' + name, vue);
            } else {
                return this.global('Vue_' + name);
            }
        }
    }

    if ($.RestClient) {
        this.rest = function() {
            return this.global('rest');
        }
    }

    this.cache = function(name, value) {
        if (!value) {
            return name ? CupcoffeGlobais['cache'][name] : CupcoffeGlobais['cache'];
        } else {
            CupcoffeGlobais['cache'][name] = value;
        }
    }

    this.global = function(name, value) {
        if (!value) {
            return name ? CupcoffeGlobais[name] : CupcoffeGlobais;
        } else {
            CupcoffeGlobais[name] = value;
        }
    }

    this.service = function(name, value) {
        if (!value) {
            return name ? CupcoffeServices[name] : CupcoffeServices;
        } else {
            CupcoffeServices[name] = value;
        }
    }

    this.initService = function(name) {
        if (CupcoffeServices[name]) {
            CupcoffeServices[name] = new CupcoffeServices[name]();
        }
    }

    this.initAllServices = function() {
        var servicesStart = {}

        for (var key in CupcoffeServices) {
            CupcoffeServices[key] = new CupcoffeServices[key]()
        }
    }

    this.setController = function(name, controller) {
        CupcoffeControllers.prototype[name] = controller;
    }

    this.global = function(name, value) {
        if (!value) {
            return name ? CupcoffeGlobais[name] : CupcoffeGlobais;
        } else {
            CupcoffeGlobais[name] = value;
        }
    }

    this.controller = function(name) {
        var control = new CupcoffeControllers()
        var arguments = Array.prototype.slice.call(arguments, 1);
        return control[name].apply(this, arguments);
    }

    if ($.RestClient) {
        this.preloader = function(datas, callback, index) {
            var $this = this,
                index = index || 0,
                item = datas[index]

            if (!this.global('finishLoadItens')) {
                this.global('finishLoadItens', [])
            }

            var finishLoadItens = this.global('finishLoadItens')

            if (item) {
                var limitTime = setTimeout(function() {
                    $this.preloader(datas, callback, ++index);
                }, CupcoffeConfig.preloader.limitTime)

                $this.rest()[item.controller].read(item.action).data(item.data).then(function(result) {
                    clearTimeout(limitTime)

                    if (result) {
                        $this.global(item.global, result);
                        finishLoadItens.push(item)
                        $this.global('finishLoadItens', finishLoadItens)
                        if (item.callback) {
                            item.callback(result)
                        }
                    }

                    $this.preloader(datas, callback, ++index);
                })
            } else if (callback) {
                callback(this.global('finishLoadItens'))
            }
        }
    }

    return this;
}
