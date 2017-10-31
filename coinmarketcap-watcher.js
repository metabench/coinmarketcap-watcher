var jsgui = require('jsgui3');
var each = jsgui.each;
var Evented_Class = jsgui.Evented_Class;

//var autobahn = require('autobahn');
var request = require('request');
//var moment = require('moment');
var Array_Table = require('arr-table');

var arr_obj_to_arr_kv = (arr_obj) => {
    var arr_items = [], arr_values;
    each(arr_obj, (item) => {
        if (item) {
            arr_values = [];
            each(item, (val) => {
                arr_values.push(val);
            });
            //throw 'stop';
            arr_items.push(arr_values);
        }
    });
    var keys = Object.keys(arr_obj[0]);
    var res = [keys, arr_items];
    return res;
}

var arr_keys_to_obj_keys = (arr_keys) => {
    var res = {};
    each(arr_keys, (v, i) => {
        res[i] = v;
    });
    return res;
}

class Coinmarketcap_Watcher extends Evented_Class {
    constructor() {
        super();
    }
    // https://api.coinmarketcap.com/v1/ticker/

    get_ticker(callback) {
        request('https://api.coinmarketcap.com/v1/ticker/', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('get_active_currency_pairs body', body);
                var obj_ticker_data = JSON.parse(body);
                //callback(null, arr_obj_to_arr_kv(obj_ticker_data));
                callback(null, (obj_ticker_data));
            }
        });
    }
    get_arrkv_ticker(callback) {
        this.get_ticker((err, res_ticker) => {
            if (err) { throw err; } else {
                callback(null, arr_obj_to_arr_kv(res_ticker));
            }
        });
    }
    get_top_n_symbols_by_market_cap(n, callback) {
        // get the ticker data in array key value.
        this.get_arrkv_ticker((err, akv_ticker) => {
            if (err) { callback(err) } else {
                var at_cmc_ticker = new Array_Table(akv_ticker);
                //console.log('at_cmc_ticker', at_cmc_ticker);
                //console.log('at_cmc_ticker.keys', at_cmc_ticker.keys);
                // then get the top 25 of them.
                //  could get them as standard JavaScript objects.
                var at_top_25 = at_cmc_ticker.get_new_top_n(25);
                //console.log('at_top_25', at_top_25);
                var res = at_top_25.get_arr_field_values('symbol');
                //return res;
                callback(null, res);
                //jsgui.get_truth_map_from_arr
            }
        });
    }
    // Would be nice to frequently save the coinmarketcap ticker data to the db.
}

if (require.main === module) {

    var watcher = new Coinmarketcap_Watcher();
    //console.log('pre start');

    /*

    watcher.get_arrkv_ticker((err, ticker_data) => {
        if (err) {
            throw err;
        } else {
            console.log('ticker_data', ticker_data);
            console.log('ticker_data[0]', ticker_data[0]);
            // another function could turn it into arrays.

        }
    });
    */
    //watcher.watch();

    watcher.get_top_n_symbols_by_market_cap(25, (err, top_25) => {
        if (err) { callback(err); } else {
            console.log('top_25', top_25);
        }
    })

} else {
    //console.log('required as a module');

}

module.exports = Coinmarketcap_Watcher;