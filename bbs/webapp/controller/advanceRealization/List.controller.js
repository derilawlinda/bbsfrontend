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
    return Controller.extend("frontend.bbs.controller.advanceRealization.List", {
       onInit: function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/employee_advance.json"));
		this.getOwnerComponent().setModel(oModel,"advanceRealization");

       },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createBudgetingDialog) {
			this.createBudgetingDialog = this.loadFragment({
				name: "frontend.bbs.view.budgeting.CreateForm"
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
		_closeDialog: function () {
			this.oDialog.close();
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 'Realized'){
				return 'Accept'
			}else if(sStatus == 'Unrealized'){
				return 'Attention'
			}
		  }
    });
 });