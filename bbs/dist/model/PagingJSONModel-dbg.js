sap.ui.define([
    "frontend/bbs/model/PagingJSONListBinding",
    "sap/ui/model/json/JSONModel"
    ], function (
      PagingListBinding,
      JSONModel
      ) {
      /**
      * PagingJSONModel
    
      *@class
      * @extends sap.ui.model.json.JSONModel
      */
      return JSONModel.extend("frontend.bbs.model.PagingJSONModel", {
        constructor: function(oRestClient) {
          JSONModel.apply(this, arguments );
        },
        bindList: function(sPath, oContext, aSorters, aFilters, mParameters) {
        return new PagingListBinding(this, sPath, oContext, aSorters, aFilters,
          mParameters);
        }
     });
    });