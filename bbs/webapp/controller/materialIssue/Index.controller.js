sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	'frontend/bbs/libs/lodash'
 ], function (Controller,History,mobileLibrary, JSONModel) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
    return Controller.extend("frontend.bbs.controller.materialIssue.Index", {
       onInit: async function  () {
		this.getView().byId("materialIssueTableID").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		var oItemsModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/items.json"));
		this.getView().setModel(oItemsModel,"items");
		var oModel = new JSONModel();
		oModel.loadData(backendUrl+"materialIssue/getMaterialIssues", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oModel,"materialIssue");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("materialIssueTableID").setBusy(false);
		}.bind(this));
		
		//GET BUDGET DATA
		var budgetRequestHeader = new sap.ui.model.json.JSONModel({
			U_RemainingBudget : 0
		});
		this.getView().setModel(budgetRequestHeader,"budgetHeader");
		var oBudgetingModel = new JSONModel();
		oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");

		//NEW MATERIAL ISSUE MODEL
		var oNewMaterialIssueAccounts = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewMaterialIssueAccounts,"new_mi_items");
		this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection", []);
		

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
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
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
		onBudgetChange : function(oEvent){
			var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
			var budgetingModel = new JSONModel();
			budgetingModel.loadData(backendUrl+"budget/getBudgetById?code="+selectedID, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			var budgetingData = budgetingModel.getData().value;
			let result = _.find(budgetingData, function(obj) {
				if (obj.Code == selectedID) {
					return true;
				}
			});
			var approvedBudget = result.U_TotalAmount;
			var usedBudget = result.BUDGETUSEDCollection;
			let sumUsedBudget = 0;
			for (let i = 0; i < usedBudget.length; i++ ) {
				sumUsedBudget += usedBudget[i]["U_Amount"];
			};
			result.U_RemainingBudget = approvedBudget - sumUsedBudget;
			var budgetRequestHeader = this.getView().getModel("budgetHeader");
			budgetRequestHeader.setData(result);

		  },
		onCreateButtonClick : function(oEvent) {
			if (!this.createMaterialIssueDialog) {
				this.createMaterialIssueDialog = this.loadFragment({
					name: "frontend.bbs.view.materialIssue.CreateForm"
				});
			}
			this.createMaterialIssueDialog.then(function (oDialog) {
				var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
					Date : new Date()
				});
				var oMaterialIssueHeader = new sap.ui.model.json.JSONModel();
			
				this.getView().setModel(oMaterialIssueHeader,"materialIssueHeader");
				this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
				this.oDialog = oDialog;
				this.oDialog.open();
				var oMaterialIssueDetailModel = new sap.ui.model.json.JSONModel();
				var budgetRequestHeader = this.getView().getModel("budgetHeader");


				var dynamicProperties = [];
				oMaterialIssueDetailModel.setData(dynamicProperties);
				budgetRequestHeader.setData(dynamicProperties);

				this.getView().setModel(oMaterialIssueDetailModel,"materialIssueDetailModel");
				this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection", []);
	
			}.bind(this));
		   },
		_closeDialog: function () {
			this.oDialog.close();
		},
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_mi_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Qty": ""
			};
			oModelData.MATERIALISSUELINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_mi_items');
			f.refresh();
		
		},
		onSaveButtonClick : function(oEvent) {
			const oModel = this.getView().getModel("materialIssueHeader");
			const oModelItems = this.getView().getModel("new_mi_items");
			var materialIssueModel = this.getView().getModel("materialIssue");
			oModel.setProperty("/MATERIALISSUELINESCollection", oModelItems.getData().MATERIALISSUELINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oDialog = this.oDialog;
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'materialIssue/createMaterialIssue',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.close();
					materialIssueModel.loadData(backendUrl+"materialIssue/getMaterialIssues", null, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					view.getModel('materialIssue').refresh();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// alert(JSON.stringify(oProperty));
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
		buttonFormatter: function(sStatus) {
			if(sStatus == 2 || sStatus == 3){
				return 'Accept'
			}else if(sStatus == 1){
				return 'Attention'
			}else{
				return 'Reject'
			}
		  }
    });
 });