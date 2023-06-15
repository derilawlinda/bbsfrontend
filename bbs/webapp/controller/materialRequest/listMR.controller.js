sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/model/json/JSONModel"
 ], function (Controller,History,Fragment,HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea,JSONModel) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
    return Controller.extend("frontend.bbs.controller.materialRequest.listMR", {
       onInit: async function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/material_request.json"));
		this.getOwnerComponent().setModel(oModel,"materialRequest");
		var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
		this.getView().setModel(oSalesOrderModel,"salesOrder");
		var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
		this.getView().setModel(oCompaniesModel,"companies");
		

       },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createBudgetingDialog) {
			this.createBudgetingDialog = this.loadFragment({
				name: "frontend.bbs.view.materialRequest.CreateForm"
			});
		}
		this.createBudgetingDialog.then(function (oDialog) {
			this.oDialog = oDialog;
			this.oDialog.open();
			var oBudgetingDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oBudgetingDetailModel.setData(dynamicProperties);
			this.getView().setModel(oBudgetingDetailModel,"budgetingDetailModel");
			this._oMessageManager.registerObject(this.oView.byId("formContainer"), true);

		}.bind(this));
	   },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
       onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("login", {}, true /*no history*/);
			}
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_closeDialog: function () {
			this.oDialog.close();
		},
		onPress: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oPath = oEvent.getSource().getBindingContextPath();
			var id = oPath.split("/").slice(-1).pop();
			oRouter.navTo("materialRequestDetail",{
				materialRequestID : id
			});

			
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 'Approved'){
				return 'Accept'
			}else if(sStatus == 'Pending'){
				return 'Attention'
			}else{
				return 'Reject'
			}
		  }
    });
 });