sap.ui.define(["sap/ui/model/json/JSONListBinding"],function(n){"use strict";return n.extend("frontend.bbs.model.PagingJSONListBinding",{constructor:function(t,i,e,o,s,u){n.apply(this,arguments)},getLength:function(){return this.getModel().oData["@odata.count"]}})});