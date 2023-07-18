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
    return Controller.extend("frontend.bbs.controller.materialIssue.Index", {
       onInit: function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/material_issue.json"));
		this.getOwnerComponent().setModel(oModel,"materialIssue");
		var oNewMaterialIssueAccounts = new sap.ui.model.json.JSONModel();
		var oBudgetingModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/budgeting.json"));
		this.getView().setModel(oBudgetingModel,"budgeting");
		this.getView().setModel(oNewMaterialIssueAccounts,"new_mi_items");
		this.getView().getModel("new_mi_items").setProperty("/itemRow", []);

       },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 'Issued'){
				return 'Accept'
			}else{
				return 'Attention'
			}
		},
		onPress: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oPath = oEvent.getSource().getBindingContextPath();
			var id = oPath.split("/").slice(-1).pop();
			oRouter.navTo("materialIssueDetail",{
				ID : id
			});

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
		onCreateButtonClick : function(oEvent) {
			if (!this.createMaterialIssueDialog) {
				this.createMaterialIssueDialog = this.loadFragment({
					name: "frontend.bbs.view.materialIssue.CreateForm"
				});
			}
			this.createMaterialIssueDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
				var oMaterialIssueDetailModel = new sap.ui.model.json.JSONModel();
				var dynamicProperties = [];
				oMaterialIssueDetailModel.setData(dynamicProperties);
				this.getView().setModel(oMaterialIssueDetailModel,"materialIssueModel");
				this.getView().getModel("new_mi_items").setProperty("/itemRow", []);
	
			}.bind(this));
		   },
		_closeDialog: function () {
			this.oDialog.close();
		},
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_mi_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"account_code": "",
				"item_name": "",
				"amount": ""
			};
			oModelData.itemRow.push(oNewObject);
			console.log(oModelData.itemRow);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_mi_items');
			f.refresh();
		
		}
    });
 });