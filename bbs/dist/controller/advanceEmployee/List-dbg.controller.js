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
    return Controller.extend("frontend.bbs.controller.advanceEmployee.List", {
       onInit: function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/employee_advance.json"));
		this.getOwnerComponent().setModel(oModel,"advanceEmployee");
		var oBudgetingModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/budgeting.json"));
		this.getView().setModel(oBudgetingModel,"budgeting");
       },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createEmployeeAdvanceDialog) {
			this.createEmployeeAdvanceDialog = this.loadFragment({
				name: "frontend.bbs.view.advanceEmployee.CreateForm"
			});
		}
		this.createEmployeeAdvanceDialog.then(function (oDialog) {
			this.oDialog = oDialog;
			this.oDialog.open();
			var oEmployeeAdvanceDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oEmployeeAdvanceDetailModel.setData(dynamicProperties);
			this.getView().setModel(oEmployeeAdvanceDetailModel,"EmployeeAdvanceDetailModel");
			var oNewAdvanceEmployeeItems = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oNewAdvanceEmployeeItems,"new_ea_items");
			this.getView().getModel("new_ea_items").setProperty("/itemRow", []);

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
			if(sStatus == 'Approved'){
				return 'Accept'
			}else if(sStatus == 'Pending'){
				return 'Attention'
			}else{
				return 'Reject'
			}
		},
		dateFormatter : function(date){
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY/MM/DD" });   
			var dateFormatted = dateFormat.format(date);
			return dateFormatted;
		},
		onPress: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oPath = oEvent.getSource().getBindingContextPath();
			var id = oPath.split("/").slice(-1).pop();
			oRouter.navTo("advanceEmployeeDetail",{
				ID : id
			});

		},
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_ea_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"account_code": "",
				"item_name": "",
				"amount": ""
			};
			oModelData.itemRow.push(oNewObject);
			console.log(oModelData.itemRow);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_ea_items');
			f.refresh();
		
		}
    });
 });