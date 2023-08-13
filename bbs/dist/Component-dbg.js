/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.loader.config({
	map: {
		"*": {
			"lodash": "bbs-frontend/extlib/d-forest"
		}
	},
	shim: {
		"bbs-frontend/extlib/d-forest": {
			"amd": true,
			"deps": [],
			"exports": "_"
		}
	}
});

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "frontend/bbs/model/models",
        "sap/ui/model/json/JSONModel",
    ],
    function (UIComponent, Device, models,JSONModel) {
        "use strict";

        return UIComponent.extend("frontend.bbs.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                window.backendUrl = this.getManifestEntry("/sap.app/dataSources/bbsbackend/uri");
                window.BUDGET_APPROVAL_STATUS = {
                    "APPROVED_BY_MANAGER" : 2, 
                    "APPROVED_BY_DIRECTOR" : 3
                };
                this.setModel(models.createCompanyModel(), "companies");
                // this.setModel(models.createPillarModel(), "oPillarModel");
                // this.setModel(models.createClassificationModel(), "oClassificationModel");
                // this.setModel(models.createSubClassModel(), "oSubClassModel");
                // this.setModel(models.createSubClass2Model(), "oSubClass2Model");
                this.setModel(models.createSalesOrderModel(), "salesOrder");
		        this.setModel(models.createAccountModel(),"accounts");
                
                this.router = this.getRouter();

                
            },

            getContentDensityClass: function () {
                if (!this._sContentDensityClass) {
                    if (!Device.support.touch){
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
                return this._sContentDensityClass;
            },

            checkToken : async function (oJWT,route){
                
                var oRouter = this.router;
                var that = this;
                $.ajaxSetup({
                    headers: { 'Authorization': 'Bearer ' + oJWT }
                });
                $.ajax({
                    url: backendUrl+"checkToken",
                    method: 'POST',
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(result) {
                        console.log(result);
                        var oUserModel = new JSONModel({
                            userName: result.user.name,
                            roleId : result.user.role_id,
                            roleName : result.role[0].name
                        });
                        that.setModel(oUserModel,"userModel");
                    },
                    error: function(xhr, status, error) {
                      if (xhr.status === 401) {
                        oRouter.navTo("Login", {}, true /*no history*/);
                      }
                    }
                });

                
            }
        });
    }
);