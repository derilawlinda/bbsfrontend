sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";
        var endTerm;
        var startTerm;
        var matches = [];
       
        var oPillarConfigurationModel = new sap.ui.model.json.JSONModel(); 
        oPillarConfigurationModel.loadData(sap.ui.require.toUrl("frontend/bbs/model/pillars.json"));
        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
        },
        

         //app Congiguration model
         createPillarModel: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            var that = this;

            oPillarConfigurationModel.dataLoaded().then(function(){
                var pillarJson = oPillarConfigurationModel.getData();
                const pillarArray = that.search(pillarJson,'Pillar');
                oModel.setData(pillarArray);
                
            });
            return oModel;
        },
        createClassificationModel: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            var that = this;

            oPillarConfigurationModel.dataLoaded().then(function(){
                var pillarJson = oPillarConfigurationModel.getData();
                const classificationArray = that.search(pillarJson,'Classification');
                oModel.setData(classificationArray);
                
            });
            return oModel;
        },
        createSubClassModel: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            var that = this;

            oPillarConfigurationModel.dataLoaded().then(function(){
                var pillarJson = oPillarConfigurationModel.getData();
                const subClassificationArray = that.search(pillarJson,'Subclass');
                oModel.setData(subClassificationArray);
                
            });
            return oModel;
        },
        createSubClass2Model: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            var that = this;

            oPillarConfigurationModel.dataLoaded().then(function(){
                var pillarJson = oPillarConfigurationModel.getData();
                const subClassification2Array = that.search(pillarJson,'Subclass2');
                oModel.setData(subClassification2Array);
                
            });
            return oModel;
        },
        createSalesOrderModel: function () {
            var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
            return oSalesOrderModel;
        },
        createCompanyModel : function () {
            var oCompanyModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
            return oCompanyModel;
        },
        createAccountModel : function () {
            var oAccountModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/new_accounts.json"));
            return oAccountModel;
        },

        search : function (arr, term) {
		
            if(term != endTerm){
                matches = [];
            };
            if (!Array.isArray(arr)) return matches;
            
            var that = this;
            arr.forEach(function(i) {
                
                if (i.subheader === term) {
                 const filterData =  (i.nodes && Array.isArray(i.nodes))? i.nodes.filter(subheader => subheader.value ===term):[];
                    matches.push(i);
                } else {
                    that.search(i.nodes, term);
                }
            endTerm = term;
    
            });
            return matches;
        }
    };
});