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
	"sap/ui/model/json/JSONModel",
	'frontend/bbs/libs/lodash'
 ], function (Controller,History,Fragment,HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea,JSONModel) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
    return Controller.extend("frontend.bbs.controller.materialRequest.List", {
       onInit: async function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/material_request.json"));
		this.getOwnerComponent().setModel(oModel,"materialRequest");
		var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
		this.getView().setModel(oSalesOrderModel,"salesOrder");
		var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
		this.getView().setModel(oCompaniesModel,"companies");
		var oBudgetingModel = new JSONModel();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var oJWT = oStore.get("jwt");
		oBudgetingModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + oJWT
		});
		this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
		var oNewMaterialRequestItems = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewMaterialRequestItems,"new_mr_items");
		this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection", []);
		
		

       },
	   onCreateButtonClick : function(oEvent) {
		console.log(this.getView().getModel("budgeting"));
		if (!this.createMaterialRequestDialog) {
			this.createMaterialRequestDialog = this.loadFragment({
				name: "frontend.bbs.view.materialRequest.CreateForm"
			});
		}
		this.createMaterialRequestDialog.then(function (oDialog) {
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
				Date : new Date()
			});
			this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
			oCreateFragmentViewModel.setProperty("/Date", new Date());
			console.log(oCreateFragmentViewModel);
			this.oDialog = oDialog;
			this.oDialog.open();
			var oMaterialRequestDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oMaterialRequestDetailModel.setData(dynamicProperties);
			this.getView().setModel(oMaterialRequestDetailModel,"budgetingDetailModel");
			this.getView().getModel("new_mr_items").setProperty("/itemRow", []);

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
		  },
		  onBudgetChange : function(oEvent){
			var budgetingModel = this.getView().getModel("budgeting");
			var budgetingData = budgetingModel.getData().value;
			var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
			let result = _.find(budgetingData, function(obj) {
				if (obj.Code == selectedID) {
					return true;
				}
			});
			var materialRequestHeader = new sap.ui.model.json.JSONModel(result);
			this.getView().setModel(materialRequestHeader,"materialRequestHeader");

		  },
		  onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_mr_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"account_code": "",
				"item_name": "",
				"amount": ""
			};
			oModelData.MATERIALREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_mr_items');
			f.refresh();
		
		}
    });
 });