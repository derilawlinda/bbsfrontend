sap.ui.define([
    "sap/ui/model/json/JSONListBinding"
   ], function (
    JSONListBinding
    ) {
    "use strict";
   /**
   * PagingJSONListBinding
   * @class
   * @extends sap.ui.model.json.JSONListBinding
   */
    return JSONListBinding.extend("frontend.bbs.model.PagingJSONListBinding", {
       constructor: function (oModel, sPath, oContext, aSorters, aFilters, mParameters) {
       JSONListBinding.apply(this, arguments);
       },
       getLength: function() {
       return this.getModel().oData["@odata.count"];
    }
   });
   });