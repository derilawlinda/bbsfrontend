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

	return Controller.extend("frontend.bbs.controller.materialIssue.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("materialIssueDetail").attachPatternMatched(this._onObjectMatched, this);
			

        },
		_onObjectMatched: async function (oEvent) {

			this.getView().byId("materialIssueLineTableID").setBusy(true);
			
			var viewModel = new JSONModel({
				showFooter : false,
				editable : false,
				resubmit : false
			});
			this.getView().setModel(viewModel,"viewModel");

			var accountModel = new JSONModel();
			this.getView().setModel(accountModel,"accounts");

			var oItemsModel = new JSONModel();
			oItemsModel.setSizeLimit(5000);
			this.getView().setModel(oItemsModel,"items");

			this.getView().byId("materialIssuePageID").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");
			this.company = oStore.get("company");

			var oUserModel = new JSONModel();
			await oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().bindElement({
				path: "/value/" + window.decodeURIComponent(oEvent.getParameter("arguments").ID),
				model: "materialIssue"
			});
			var materialIssueCode = oEvent.getParameter("arguments").ID;
			if(materialIssueCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				materialIssueCode = urlArray[urlArray.length - 1];
			}
			const materialIssueDetailModel = new JSONModel();
			materialIssueDetailModel.loadData(backendUrl+"materialIssue/getMaterialIssueById", {
				code : materialIssueCode,
				company : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(materialIssueDetailModel,"materialIssueDetailModel");

			var oBudgetingModel = new JSONModel();
			oBudgetingModel.setSizeLimit(500);
				oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", {
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
			});
			this.getView().setModel(oBudgetingModel,"budgeting");

			materialIssueDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var materialIssueDetailData = this.getView().getModel("materialIssueDetailModel").getData();
				
				if(userData.user.role_id == 4){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(materialIssueDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(materialIssueDetailData.U_Status == 1){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					viewModel.setProperty("/resubmit", false);

					if(materialIssueDetailData.U_Status == 4){
						viewModel.setProperty("/resubmit", true);
					}
					if((materialIssueDetailData.U_Status == 4 || materialIssueDetailData.U_Status == 1) ){
						viewModel.setProperty("/showFooter", true);
						viewModel.setProperty("/editable", true);
					}
				};

				const oBudgetModel = new JSONModel();
				oBudgetModel.loadData(backendUrl+"budget/getBudgetById", {
					code : materialIssueDetailData.U_BudgetCode,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetModel,"budget");
				
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget", {
					budgetCode : materialIssueDetailData.U_BudgetCode,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				accountModel.refresh();

				var materialIssueLineTable = this.getView().byId("materialIssueLineTableID");
				var oItemsModel = this.getView().getModel("items");
				oItemsModel.setProperty("/data", []);
				var oItemData = oItemsModel.getData();
				var itemsByAccount = new JSONModel();
				
				var accounts = [];
				console.log(materialIssueDetailData.MATERIALISSUELINESCollection);
				for (let i = 0; i < materialIssueDetailData.MATERIALISSUELINESCollection.length; i++) {
					if(!(materialIssueDetailData.MATERIALISSUELINESCollection[i].U_AccountCode.toString() in accounts)){
						accounts.push(materialIssueDetailData.MATERIALISSUELINESCollection[i].U_AccountCode);
					};
				}
				var uniqueAccounts = [... new Set(accounts)];
				
				for (let i = 0; i < uniqueAccounts.length; i++) {
					this.getView().byId("materialIssuePageID").setBusy(true);

					itemsByAccount.loadData(backendUrl+"items/getItemsByAccount?accountCode=", {
						company : this.company,
						accountCode : uniqueAccounts[i]
					}, true, "GET",false,false,{
						'Authorization': 'Bearer ' + this.oJWT
					});
					itemsByAccount.dataLoaded().then(function(){
						var itemsByAccountData = itemsByAccount.getData();
						oItemData.data[uniqueAccounts[i]] = itemsByAccountData;
						var newItemModel = new sap.ui.model.json.JSONModel(oItemData);
						this.getView().setModel(newItemModel, 'items');
						newItemModel.refresh();
						this.getView().byId("materialIssuePageID").setBusy(false);
					}.bind(this))
				};

				
				for (let i = 0; i < materialIssueDetailData.MATERIALISSUELINESCollection.length; i++) {
					materialIssueLineTable.getRows()[i].getCells()[1].setBusy(true);
					let account = (materialIssueDetailData.MATERIALISSUELINESCollection[i].U_AccountCode).toString();
					materialIssueLineTable.getRows()[i].getCells()[1].bindAggregation("items", {
						path: 'items>/data/'+ account,
						template: new sap.ui.core.Item({
							key: "{items>ItemCode}",
							text: "{items>ItemCode} - {items>ItemName}"
						})
					});
					materialIssueLineTable.getRows()[i].getCells()[1].setBusy(false);
				}

				
			}.bind(this));

			this.getView().byId("materialIssueLineTableID").setBusy(false);
			
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

		onApproveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("materialIssuePageID");
			var viewModel = this.getView().getModel("viewModel");
			pageDOM.setBusy(true);
			var code = this.getView().byId("_IDGenText101").getText();
			const oModel = this.getView().getModel("materialIssueDetailModel");
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oDialog = this.oDialog;
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: JSON.stringify({
					company : this.company,
					oProperty : oProperty
				}),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialIssue/approveMI',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Issue approved" }),
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

		onSaveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("materialIssuePageID");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("materialIssueDetailModel");
			var jsonData = JSON.stringify({
				company : this.company,
				data : oModel.getData()
			});
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialIssue/saveMI',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Issue saved" }),
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

		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("materialIssueDetailModel");
			var oModelLineData = oModel.getData().MATERIALISSUELINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/MATERIALISSUELINESCollection",oModelLineData);
			oModel.refresh();
		},
		onBudgetChange : async function(oEvent){
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Budget Code");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
			}
			if(oValidatedComboBox.getValueState() == ValueState.None){
				this.getView().byId("materialIssuePageID").setBusy(true);

				var accountModel = this.getView().getModel("accounts");
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget?", {
					company : this.company,
					budgetCode : sSelectedKey
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				accountModel.refresh();

				var oModel = this.getView().getModel("materialIssueDetailModel");
				oModel.setProperty("/MATERIALISSUELINESCollection",[]);
				oModel.refresh();
				
				var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
				var budget = this.getView().getModel("budget");
				await budget.loadData(backendUrl+"budget/getBudgetById?code="+selectedID, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				budget.refresh();
				
				this.getView().byId("materialIssuePageID").setBusy(false);
			}
		},
		onRejectButtonClick : function(oEvent){
			if (!this.rejectMaterialIssueDialog) {
				this.rejectMaterialIssueDialog = this.loadFragment({
					name: "frontend.bbs.view.materialIssue.RejectForm"
				});
			}
			this.rejectMaterialIssueDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
			}.bind(this));
		},

		_closeDialog: function () {
			this.oDialog.close();
		},

		onConfirmRejectClick : function(){
			var pageDOM = this.getView().byId("materialIssuePageID");
			var materialIssueDetailData = this.getView().getModel("materialIssueDetailModel").getData();
			pageDOM.setBusy(true);
			var oDialog = this.getView().byId("rejectDialog");
			var code = materialIssueDetailData.Code;
			var rejectionRemarks = this.getView().byId("RejectionRemarksID").getValue();
			var viewModel = this.getView().getModel("viewModel");
			
			$.ajax({
				type: "POST",
				data: {
					"Code": code,
					"Remarks" : rejectionRemarks,
					"company" : this.company
				},
				headers: {"Authorization": "Bearer "+ this.oJWT},
				crossDomain: true,
				url: backendUrl+'materialIssue/rejectMI',
				success: function (res, status, xhr) {
					  //success code
					  oDialog.close();
					  pageDOM.setBusy(false);
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Issue rejected" }),
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
		
			var pageDOM = this.getView().byId("materialIssuePageID");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("materialIssueDetailModel");
			var jsonData = JSON.stringify({
				company : this.company,
				data : oModel.getData()
			});
			var oJWT = this.oJWT;
			var viewModel = this.getView().getModel("viewModel");

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialIssue/resubmitMI',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Issue resubmitted" }),
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
	   },

		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("materialIssueDetailModel");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Qty": ""
			};
			console.log(oModelData);
			oModelData.MATERIALISSUELINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'materialIssueDetailModel');
			f.refresh();
		
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
				await oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount", {
					company : this.company,
					accountCode : oSelectedItem
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var oItemByAccountData = oItemByAccountModel.getData();
				oItemData[oSelectedItem] = oItemByAccountData;
				var i = new sap.ui.model.json.JSONModel(oItemData);
				this.getView().setModel(i, 'items');
				i.setSizeLimit(5000);
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
		objectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Warning';
			}else if(sStatus == 2){
				return 'Information';
			}
			else if(sStatus == 3){
				return 'Success';
			}else{
				return 'Error';
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
		  
		}
	});
});