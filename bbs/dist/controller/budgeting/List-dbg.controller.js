sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel"
 ], function (Controller,History,JSONModel,ODataModel) {
    "use strict";
	var endTerm;
	var startTerm;
	var matches = [];

    return Controller.extend("frontend.bbs.controller.budgeting.List", {
		
       onInit: async function () {
		this.getView().byId("idBudgetTable").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		var oJWT = oStore.get("jwt");
		// var userData = await this.getOwnerComponent().checkToken(oJWT,currentRoute);
		// if(userData.status == "Error"){
		// 	window.location.href = "../index.html"
		// 	return;
		// }
		
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		var oModel = new JSONModel();
		oModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("idBudgetTable").setBusy(false);
		}.bind(this));
		this.getOwnerComponent().setModel(oModel,"budgeting");
		var oBudgetingAccount = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/budgeting_accounts.json"));
		this.getView().setModel(oBudgetingAccount,"budgeting_accounts");
		
		
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

		})
		return matches;
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
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
				Date : new Date()
			});
			this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
			var oBudgetingDetailModel = new sap.ui.model.json.JSONModel({
				U_TotalAmount : 0,
			});
			// var dynamicProperties = [];
			// oBudgetingDetailModel.setData(dynamicProperties);
			
			this.getView().setModel(oBudgetingDetailModel,"budgetingDetailModel");
			var oNewBudgetingAccounts = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oNewBudgetingAccounts,"new_budgeting_accounts");
			this.getView().getModel("new_budgeting_accounts").setProperty("/BUDGETREQLINESCollection", []);

		}.bind(this));
	   },
	   onSaveButtonClick : function(oEvent) {
			const oModel = this.getView().getModel("budgetingDetailModel");
			const oModelAccounts = this.getView().getModel("new_budgeting_accounts");
			var budgetingModel = this.getView().getModel("budgeting");
			oModel.setProperty("/BUDGETREQLINESCollection", oModelAccounts.getData().BUDGETREQLINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oDialog = this.oDialog;
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				crossDomain: true,
				url: backendUrl+'budget/createBudget',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.close();
					budgetingModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					view.getModel('budgeting').refresh();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// alert(JSON.stringify(oProperty));
	   },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_closeDialog: function () {
			this.oDialog.close();
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 2 || sStatus == 3){
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
		dateFormatter : function(date){
			var unformattedDate = new Date(date);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
			var dateFormatted = dateFormat.format(unformattedDate);
			return dateFormatted;
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
		onPress: function (oEvent) {
			
			var oRouter = this.getOwnerComponent().getRouter();
			var oPath = oEvent.getSource().getBindingContextPath();
			var budget = oPath.split("/").slice(-1).pop();
			oRouter.navTo("budgetingDetail",{
				budgetID : budget
			});

			
		},

		onAddPress : function(oEvent){
			
			const oModel = this.getView().getModel("new_budgeting_accounts");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_Amount": ""
			};
			oModelData.BUDGETREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_budgeting_accounts');
			f.refresh();
		
		},

		onAmountChange : function(event){
			const oModel = this.getView().getModel("new_budgeting_accounts");
			var oModelData = oModel.getData().BUDGETREQLINESCollection;
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			const oModelHeader = this.getView().getModel("budgetingDetailModel");
			console.log(oModelHeader.getData());
			oModelHeader.setProperty("/U_TotalAmount", sum);
			console.log(oModelHeader.getData());

		}
    });
 });