sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library"
], function (Controller, History, JSONModel,Dialog,Button,mobileLibrary,Text,coreLibrary) {
	"use strict";

	
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("frontend.bbs.controller.reimbursement.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("reimbursementDetail").attachPatternMatched(this._onObjectMatched, this);
			var oItemsModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/items.json"));
			this.getView().setModel(oItemsModel,"items");

        },
		_onObjectMatched: async function (oEvent) {
			var viewModel = new sap.ui.model.json.JSONModel({
				NPWP: [
					{"Name" : 0},
					{"Name" : 2.5},
					{"Name" : 3}
				]
			});
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("reimbursementPageID").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");

			var oUserModel = new JSONModel();
			await oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().bindElement({
				path: "/value/" + window.decodeURIComponent(oEvent.getParameter("arguments").ID),
				model: "reimbursements"
			});
			var reimbursementCode = oEvent.getParameter("arguments").ID;
			if(reimbursementCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				reimbursementCode = urlArray[urlArray.length - 1];
			}

			
			const reimbursementDetailModel = new JSONModel();
			reimbursementDetailModel.loadData(backendUrl+"reimbursement/getReimbursementById?code="+reimbursementCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(reimbursementDetailModel,"reimbursementDetailModel");

			var oBudgetingModel = new JSONModel();
				oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
			});
			this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
			reimbursementDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var reimbursementDetailData = this.getView().getModel("reimbursementDetailModel").getData();
				if(userData.user.role_id == 4){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(reimbursementDetailData.U_Status == 3){
						viewModel.setProperty("/showFooter", false);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(reimbursementDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", false);
					}
				}
				else if(userData.user.role_id == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					if(reimbursementDetailData.U_Status != 1){
						viewModel.setProperty("/showFooter", false);
						viewModel.setProperty("/editable", false);
					}
				};

				var accountModel = new JSONModel();
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+reimbursementDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getView().setModel(accountModel,"accounts");

				const oBudgetModel = new JSONModel();
				oBudgetModel.loadData(backendUrl+"budget/getBudgetById?code="+reimbursementDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetModel,"budget");
				oBudgetModel.dataLoaded().then(function() {
					var budgetingData = oBudgetModel.getData();
					var approvedBudget = budgetingData.U_TotalAmount;
					var usedBudget = budgetingData.BUDGETUSEDCollection;
					let sumUsedBudget = 0;
					for (let i = 0; i < usedBudget.length; i++ ) {
						sumUsedBudget += usedBudget[i]["U_Amount"];
					};
					budgetingData.U_RemainingBudget = approvedBudget - sumUsedBudget;
					var budgetRequestHeader = this.getView().getModel("budget");
					budgetRequestHeader.setData(budgetingData);
					this.getView().byId("reimbursementPageID").setBusy(false);

				}.bind(this));

				var oItemsModel = this.getView().getModel("items");
				oItemsModel.setProperty("/data", []);
				var oItemData = oItemsModel.getData();
				var itemsByAccount = new JSONModel();

				var accounts = [];
				for (let i = 0; i < reimbursementDetailData.REIMBURSEMENTLINESCollection.length; i++) {
					if(!(reimbursementDetailData.REIMBURSEMENTLINESCollection[i].U_AccountCode.toString() in accounts)){
						accounts.push(reimbursementDetailData.REIMBURSEMENTLINESCollection[i].U_AccountCode);
					};
				}
				var uniqueAccounts = [... new Set(accounts)];
				
				for (let i = 0; i < uniqueAccounts.length; i++) {
					this.getView().byId("reimbursementPageID").setBusy(true);

					itemsByAccount.loadData(backendUrl+"items/getItemsByAccount?accountCode="+uniqueAccounts[i], null, true, "GET",false,false,{
						'Authorization': 'Bearer ' + this.oJWT
					});
					itemsByAccount.dataLoaded().then(function(){
						var itemsByAccountData = itemsByAccount.getData();
						oItemData.data[uniqueAccounts[i]] = itemsByAccountData;
						var newItemModel = new sap.ui.model.json.JSONModel(oItemData);
						this.getView().setModel(newItemModel, 'items');
						newItemModel.refresh();
						this.getView().byId("reimbursementPageID").setBusy(false);
					}.bind(this))
				};

				var reimbursementLineTableID = this.getView().byId("reimbursementLineTableID");
				for (let i = 0; i < reimbursementDetailData.REIMBURSEMENTLINESCollection.length; i++) {
					reimbursementLineTableID.getRows()[i].getCells()[1].setBusy(true);
					let account = (reimbursementDetailData.REIMBURSEMENTLINESCollection[i].U_AccountCode).toString();
					reimbursementLineTableID.getRows()[i].getCells()[1].bindAggregation("items", {
						path: 'items>/data/'+ account,
						template: new sap.ui.core.Item({
							key: "{items>ItemCode}",
							text: "{items>ItemCode} - {items>ItemName}"
						})
					});
					reimbursementLineTableID.getRows()[i].getCells()[1].setBusy(false);
				}
				
			}.bind(this));
		},

		onApproveButtonClick : function (){
			var pageDOM = this.getView().byId("reimbursementPageID");
			var viewModel = this.getView().getModel("viewModel");
			pageDOM.setBusy(true);
			const oModel = this.getView().getModel("reimbursementDetailModel");
			var oProperty = oModel.getProperty("/");
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'reimbursement/approveReimbursement',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Reimbursement approved" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
						viewModel.setProperty("/showFooter", false);
					}
		
					this.oSuccessMessageDialog.open();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
		},

        onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("dashboard", {}, true);
			}
		}
	});
});