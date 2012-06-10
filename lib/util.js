/**
 * Created with IntelliJ IDEA.
 * User: ramon
 * Date: 6/10/12
 * Time: 12:38 PM
 * To change this template use File | Settings | File Templates.
 */
var util = {
    extend: function(baseObj, newObj) {
        baseObj = baseObj || {};
        if (newObj) {
           for(var p in newObj) {
               baseObj[p] = newObj[p];
           }
        }
        return baseObj;
    }
};
module.exports = util;