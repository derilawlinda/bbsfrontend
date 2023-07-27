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
		this.getView().byId("materialRequestTableID").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		var oModel = new JSONModel();
		oModel.loadData(backendUrl+"materialRequest/getMaterialRequests", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oModel,"materialRequest");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("materialRequestTableID").setBusy(false);
		}.bind(this));

		var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
		this.getView().setModel(oSalesOrderModel,"salesOrder");
		var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
		this.getView().setModel(oCompaniesModel,"companies");
		var oItemsModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/items.json"));
		this.getView().setModel(oItemsModel,"items");
		var oMaterialRequestHeader = new sap.ui.model.json.JSONModel();
		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true
		});
		this.getView().setModel(viewModel,"viewModel");
		// var dynamicProperties = [];
		// oBudgetingDetailModel.setData(dynamicProperties);
		
		this.getView().setModel(oMaterialRequestHeader,"materialRequestHeader");
		var budgetRequestHeader = new sap.ui.model.json.JSONModel({
			U_RemainingBudget : 0
		});
		this.getView().setModel(budgetRequestHeader,"budgetHeader");
		var oBudgetingModel = new JSONModel();
		oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");

		//NEW MR ITEM MODEL
		var oNewMaterialRequestItems = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewMaterialRequestItems,"new_mr_items");
		this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection", []);

		var userModel = this.getOwnerComponent().getModel("userModel");
		if(userModel === undefined){
			const bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("username", "checktoken", this.toggleCreateButton, this);
		}else{
			var userData = userModel.getData();
			var a = { "userName" : userData.user.name,
			  "roleId" : userData.user.role_id,
			  "roleName" : userData.role[0].name,
			  "status" : "success"
			};
			this.toggleCreateButton("username","checkToken",a);
		}
		
		

       },

	   toggleCreateButton : function(channelId, eventId, parametersMap){
		console.log(parametersMap);
			if(parametersMap.roleId == 4 || parametersMap.roleId == 5){
				this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
			}
	   },
	   onCreateButtonClick : function(oEvent) {
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
			this.oDialog = oDialog;
			this.oDialog.open();
			var oMaterialRequestDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oMaterialRequestDetailModel.setData(dynamicProperties);
			this.getView().setModel(oMaterialRequestDetailModel,"materialRequestgDetailModel");
			this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection", []);

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
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			oRouter.navTo("materialRequestDetail",{
				materialRequestID : id
			});
			
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 2){
				return 'Accept'
			}else if(sStatus == 1){
				return 'Attention'
			}else{
				return 'Reject'
			}
		  },
		  textFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Pending'
			}else if(sStatus == 2){
				return 'Approved by Manager'
			}else if(sStatus == 3){
				return 'Approved by Director'
			}else{
				return 'Rejected'
			}
		  
		},
		  onBudgetChange : async function(oEvent){
			this.getView().byId("createMRForm").setBusy(true);
			var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
			var budgetingModel = new JSONModel();
			await budgetingModel.loadData(backendUrl+"budget/getBudgetById?code="+selectedID, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			var budgetingData = budgetingModel.getData();
			var approvedBudget = budgetingData.U_TotalAmount;
			var usedBudget = budgetingData.BUDGETUSEDCollection;
			let sumUsedBudget = 0;
			for (let i = 0; i < usedBudget.length; i++ ) {
				sumUsedBudget += usedBudget[i]["U_Amount"];
			};
			budgetingData.U_RemainingBudget = approvedBudget - sumUsedBudget;
			var budgetRequestHeader = this.getView().getModel("budgetHeader");
			budgetRequestHeader.setData(budgetingData);
			this.getView().byId("createMRForm").setBusy(false);

		  },
		  onSaveButtonClick : function(oEvent) {
			var oDialog = this.oDialog;
			oDialog.setBusy(true);
			const oModel = this.getView().getModel("materialRequestHeader");
			const oModelAccounts = this.getView().getModel("new_mr_items");
			var materialRequestModel = this.getView().getModel("materialRequest");
			oModel.setProperty("/METERIALREQLINESCollection", oModelAccounts.getData().MATERIALREQLINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'materialRequest/createMaterialRequest',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.setBusy(false);
					oDialog.close();
					materialRequestModel.loadData(backendUrl+"materialRequest/getMaterialRequests", null, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					MessageToast.show("Material Request created");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});

					view.getModel('materialRequest').refresh();
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// alert(JSON.stringify(oProperty));
	   },
		  onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_mr_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Qty": ""
			};
			oModelData.MATERIALREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_mr_items');
			f.refresh();
		
		},
		textFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Pending'
			}else if(sStatus == 2){
				return 'Approved by Manager'
			}else if(sStatus == 3){
				return 'Approved by Director'
			}else{
				return 'Rejected'
			}
		  
		},
		dateFormatter : function(date){
			var unformattedDate = new Date(date);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
			var dateFormatted = dateFormat.format(unformattedDate);
			return dateFormatted;
		}
    });
 });