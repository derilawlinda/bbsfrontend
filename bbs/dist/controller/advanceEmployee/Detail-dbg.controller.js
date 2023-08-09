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

	return Controller.extend("frontend.bbs.controller.advanceEmployee.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("advanceEmployeeDetail").attachPatternMatched(this._onObjectMatched, this);
			var oItemsModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/items.json"));
			this.getView().setModel(oItemsModel,"items");

        },
		_onObjectMatched: async function (oEvent) {
			var viewModel = new JSONModel({
				showFooter : false,
				editable : false,
				resubmit : false,
				is_finance : false
			});
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("advanceRequestPageId").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");

			var oUserModel = new JSONModel();
			await oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().bindElement({
				path: "/value/" + window.decodeURIComponent(oEvent.getParameter("arguments").ID),
				model: "advanceRequest"
			});
			var advanceRequestCode = oEvent.getParameter("arguments").ID;
			if(advanceRequestCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				advanceRequestCode = urlArray[urlArray.length - 1];
			}
			const advanceRequestDetailModel = new JSONModel();
			advanceRequestDetailModel.loadData(backendUrl+"advanceRequest/getAdvanceRequestById?code="+advanceRequestCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(advanceRequestDetailModel,"advanceRequestDetailModel");

			var oBudgetingModel = new JSONModel();
				oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
			});
			this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
			advanceRequestDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var advanceRequestDetailData = this.getView().getModel("advanceRequestDetailModel").getData();

				if(userData.user.role_id == 4){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(advanceRequestDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(advanceRequestDetailData.U_Status == 1){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					viewModel.setProperty("/resubmit", false);

					if(advanceRequestDetailData.U_Status == 4){
						viewModel.setProperty("/resubmit", true);
					}
					if((advanceRequestDetailData.U_Status == 4 || advanceRequestDetailData.U_Status == 1) ){
						viewModel.setProperty("/showFooter", true);
						viewModel.setProperty("/editable", true);
					}
				}
				else if(userData.user.role_id == 2){
					viewModel.setProperty("/is_finance", true);
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", false);

					if(advanceRequestDetailData.U_Status != 3){
						viewModel.setProperty("/showFooter", false);

					}
				};;

				var accountModel = new JSONModel();
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+advanceRequestDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getView().setModel(accountModel,"accounts");

				const oBudgetModel = new JSONModel();
				oBudgetModel.loadData(backendUrl+"budget/getBudgetById?code="+advanceRequestDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetModel,"budget");
				oBudgetModel.dataLoaded().then(function() {
					var budgetingData = oBudgetModel.getData();
					console.log(budgetingData);
					var approvedBudget = budgetingData.U_TotalAmount;
					var usedBudget = budgetingData.BUDGETUSEDCollection;
					let sumUsedBudget = 0;
					if(usedBudget.length > 0){
						for (let i = 0; i < usedBudget.length; i++ ) {
							sumUsedBudget += usedBudget[i]["U_Amount"];
						};
					}
					budgetingData.U_RemainingBudget = approvedBudget - sumUsedBudget;
					var budgetRequestHeader = this.getView().getModel("budget");
					budgetRequestHeader.setData(budgetingData);
					this.getView().byId("advanceRequestPageId").setBusy(false);

				}.bind(this));

				

				var advanceReqLineTable = this.getView().byId("advanceRequestLineTableID");
				var oItemsModel = this.getView().getModel("items");
				oItemsModel.setProperty("/data", []);
				var oItemData = oItemsModel.getData();
				var itemsByAccount = new JSONModel();

				var accounts = [];
				for (let i = 0; i < advanceRequestDetailData.ADVANCEREQLINESCollection.length; i++) {
					if(!(advanceRequestDetailData.ADVANCEREQLINESCollection[i].U_AccountCode.toString() in accounts)){
						accounts.push(advanceRequestDetailData.ADVANCEREQLINESCollection[i].U_AccountCode);
					};
				}
				var uniqueAccounts = [... new Set(accounts)];
				
				for (let i = 0; i < uniqueAccounts.length; i++) {
					this.getView().byId("advanceRequestPageId").setBusy(true);

					itemsByAccount.loadData(backendUrl+"items/getItemsByAccount?accountCode="+uniqueAccounts[i], null, true, "GET",false,false,{
						'Authorization': 'Bearer ' + this.oJWT
					});
					itemsByAccount.dataLoaded().then(function(){
						var itemsByAccountData = itemsByAccount.getData();
						oItemData.data[uniqueAccounts[i]] = itemsByAccountData;
						var newItemModel = new sap.ui.model.json.JSONModel(oItemData);
						this.getView().setModel(newItemModel, 'items');
						newItemModel.refresh();
						this.getView().byId("advanceRequestPageId").setBusy(false);
					}.bind(this))
				};

				
				for (let i = 0; i < advanceRequestDetailData.ADVANCEREQLINESCollection.length; i++) {
					advanceReqLineTable.getRows()[i].getCells()[1].setBusy(true);
					let account = (advanceRequestDetailData.ADVANCEREQLINESCollection[i].U_AccountCode).toString();
					advanceReqLineTable.getRows()[i].getCells()[1].bindAggregation("items", {
						path: 'items>/data/'+ account,
						template: new sap.ui.core.Item({
							key: "{items>ItemCode}",
							text: "{items>ItemCode} - {items>ItemName}"
						})
					});
					advanceReqLineTable.getRows()[i].getCells()[1].setBusy(false);
				}


				
			}.bind(this));
		},
		onAccountCodeChange : async function(oEvent){
			
			var oSelectedItem = oEvent.getSource().getSelectedKey(); //Get Selected Item
			var oSelectedRow = oEvent.getSource().getParent(); //Selected Row.
			oSelectedRow.getCells()[1].setBusy(true);
			oSelectedRow.getCells()[1].setSelectedKey("");
			oSelectedRow.getCells()[1].setEnabled(true);
			oSelectedRow.getCells()[1].setEnabled(true);

			var oItemModel = this.getView().getModel("items");
			var oItemData = oItemModel.getData();
			if(!(oSelectedItem.toString() in oItemData)){
				var oItemByAccountModel = new JSONModel();
				await oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount?accountCode="+oSelectedItem+"", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var oItemByAccountData = oItemByAccountModel.getData();
				oItemData[oSelectedItem] = oItemByAccountData;
				var i = new sap.ui.model.json.JSONModel(oItemData);
				this.getView().setModel(i, 'items');
				i.refresh();
			}

			oSelectedRow.getCells()[1].bindAggregation("items", {
				path: 'items>/'+ oSelectedItem,
				template: new sap.ui.core.Item({
					key: "{items>ItemCode}",
					text: "{items>ItemCode} - {items>ItemName}"
				})
			});
			oSelectedRow.getCells()[1].setBusy(false);
		},
		onAmountChange : function(event){
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			const viewModel = this.getView().getModel("viewModel");
			var oBudgetingData = this.getView().getModel("budget").getData();
			var oModelData = oModel.getData().ADVANCEREQLINESCollection;
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			const oModelHeader = this.getView().getModel("advanceRequestDetailModel");
			oModelHeader.setProperty("/U_Amount", sum);
			var budgetAmount = oBudgetingData.U_RemainingBudget;
			if(sum > budgetAmount){
				this.getView().byId("advanceAmount").setState(ValueState.Error);
				this.getView().byId("resubmitButton").setEnabled(false);
				this.getView().byId("submitButton").setEnabled(false);
				viewModel.setProperty("/amountExceeded","Advance Amount exceeded Budget!")
			}else{
				this.getView().byId("advanceAmount").setState(ValueState.None);
				this.getView().byId("resubmitButton").setEnabled(true);
				this.getView().byId("submitButton").setEnabled(true);
				viewModel.setProperty("/amountExceeded","")
			}

		},
		onBudgetChange : async function(oEvent){
			this.getView().byId("createARForm").setBusy(true);
			var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
			
			var budgetModel = this.getView().getModel("budget");
			await budgetModel.loadData(backendUrl+"budget/getBudgetById?code="+selectedID, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			budgetModel.refresh();

			var accountModel = this.getView().getModel("accounts");
			accountModel.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+selectedID, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			accountModel.refresh();

			const oModelHeader = this.getView().getModel("advanceRequestDetailModel");
			oModelHeader.setProperty("/U_Amount", 0);
			var budgetingData = budgetModel.getData();
			var approvedBudget = budgetingData.U_TotalAmount;
			var usedBudget = budgetingData.BUDGETUSEDCollection;
			let sumUsedBudget = 0;
			if(usedBudget.length > 0){
				for (let i = 0; i < usedBudget.length; i++ ) {
					sumUsedBudget += usedBudget[i]["U_Amount"];
				};
			}
			var remainingBudget = approvedBudget - sumUsedBudget;
			budgetingData.U_RemainingBudget = remainingBudget;
			budgetModel.setData(budgetingData);
			budgetModel.refresh();

			var oModel = this.getView().getModel("advanceRequestDetailModel");
			oModel.setProperty("/ADVANCEREQLINESCollection",[]);
			oModel.refresh();

			this.onAmountChange();
			this.getView().byId("createARForm").setBusy(false);

		  },

		  onApproveButtonClick : function (){
			var pageDOM = this.getView().byId("advanceRequestPageId");
			var viewModel = this.getView().getModel("viewModel");
			// pageDOM.setBusy(true);
			var code = this.getView().byId("_IDGenText101").getText();
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var budgetInformation = this.getView().getModel("budget").getData();
			oModel.setProperty("/budgeting",budgetInformation);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oDialog = this.oDialog;
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'advanceRequest/approveAR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					//   pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Advance Request approved" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
						// viewModel.setProperty("/showFooter", false);
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
		},
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Amount": ""
			};
			oModelData.ADVANCEREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'advanceRequestDetailModel');
			f.refresh();
		
		},
		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("advanceRequestDetailModel");
			var oModelLineData = oModel.getData().ADVANCEREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/ADVANCEREQLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},
		onSaveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("advanceRequestPageId");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("advanceRequestDetailModel");
			var jsonData = JSON.stringify(oModel.getData());
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'advanceRequest/saveAR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Advance Request saved" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
					}
		
					this.oSuccessMessageDialog.open();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });

		},
		onRejectButtonClick : function(oEvent){
			if (!this.rejectAdvanceRequestDialog) {
				this.rejectAdvanceRequestDialog = this.loadFragment({
					name: "frontend.bbs.view.advanceEmployee.RejectForm"
				});
			}
			this.rejectAdvanceRequestDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
			}.bind(this));
		},

		_closeDialog: function () {
			this.oDialog.close();
		},

		onConfirmRejectClick : function(){
			var pageDOM = this.getView().byId("advanceRequestPageId");
			var advanceRequestDetailData = this.getView().getModel("advanceRequestDetailModel").getData();
			pageDOM.setBusy(true);
			var oDialog = this.getView().byId("rejectDialog");
			var code = advanceRequestDetailData.Code;
			var rejectionRemarks = this.getView().byId("RejectionRemarksID").getValue();
			var viewModel = this.getView().getModel("viewModel");
			
			$.ajax({
				type: "POST",
				data: {
					"Code": code,
					"Remarks" : rejectionRemarks
				},
				headers: {"Authorization": "Bearer "+ this.oJWT},
				crossDomain: true,
				url: backendUrl+'advanceRequest/rejectAR',
				success: function (res, status, xhr) {
					  //success code
					  oDialog.close();
					  pageDOM.setBusy(false);
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Advance Request rejected" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									viewModel.setProperty("/showFooter", false);
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
					}
					this.oSuccessMessageDialog.open();
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
		},

		onResubmitButtonClick : function(oEvent) {
		
			var pageDOM = this.getView().byId("advanceRequestPageId");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("advanceRequestDetailModel");
			var jsonData = JSON.stringify(oModel.getData());
			var oJWT = this.oJWT;
			var viewModel = this.getView().getModel("viewModel");

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'advanceRequest/resubmitAR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Advance Request resubmitted" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									viewModel.setProperty("/showFooter", false);
									viewModel.setProperty("/editable", false);
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
					}
		
					this.oSuccessMessageDialog.open();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
	   }
	});
});