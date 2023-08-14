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
				showFooter : false,
				editable : false,
				resubmit : false,
				is_approver : false,
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
			this.getView().setModel(reimbursementDetailModel,"reimbursementDetailModel");

			reimbursementDetailModel.loadData(backendUrl+"reimbursement/getReimbursementById?code="+reimbursementCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			reimbursementDetailModel.refresh();
			

			var oBudgetingModel = new JSONModel();
				oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
			});
			this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
			reimbursementDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var reimbursementDetailData = this.getView().getModel("reimbursementDetailModel").getData();

				if(userData.user.role_id == 4){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(reimbursementDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(reimbursementDetailData.U_Status == 1){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					viewModel.setProperty("/resubmit", false);

					if(reimbursementDetailData.U_Status == 4){
						viewModel.setProperty("/resubmit", true);
					}
					if((reimbursementDetailData.U_Status == 4 || reimbursementDetailData.U_Status == 1) ){
						viewModel.setProperty("/showFooter", true);
						viewModel.setProperty("/editable", true);
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

				accountModel.dataLoaded().then(function() {
					var reimbursementLineTableID = this.getView().byId("reimbursementLineTableID");
					var oItemsModel = this.getView().getModel("items");
					oItemsModel.setProperty("/data/",[]);
					oItemsModel.refresh();
					var oItemByAccountModel = new JSONModel();
					var reimbursements = reimbursementDetailData.REIMBURSEMENTLINESCollection;
					var oJWT = this.oJWT;

					for (let i = 0; i < reimbursements.length; i++) {
						reimbursementLineTableID.getRows()[i].getCells()[1].setBusy(true);
						var oItemsData = oItemsModel.getData();
						let account = (reimbursements[i].U_AccountCode).toString();


						if(!(reimbursements[i].U_AccountCode in oItemsData)){
							oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount?accountCode="+account, null, true, "GET",false,false,{
								'Authorization': 'Bearer ' + oJWT
							});
							oItemByAccountModel.dataLoaded().then(function() {
								var oItemByAccountData = oItemByAccountModel.getData();
								var oItemsModel = this.getView().getModel("items");
								oItemsModel.setProperty("/data/"+account,oItemByAccountData);
								oItemsModel.refresh();
								reimbursementLineTableID.getRows()[i].getCells()[1].bindAggregation("items", {
									path: 'items>/data/'+ account,
									template: new sap.ui.core.Item({
										key: "{items>ItemCode}",
										text: "{items>ItemCode} - {items>ItemName}"
									})
								});
								reimbursementLineTableID.getRows()[i].getCells()[1].setBusy(false);

								
							}.bind(this))
						}else{
							reimbursementLineTableID.getRows()[i].getCells()[1].bindAggregation("items", {
								path: 'items>/data/'+ account,
								template: new sap.ui.core.Item({
									key: "{items>ItemCode}",
									text: "{items>ItemCode} - {items>ItemName}"
								})
							});
							reimbursementLineTableID.getRows()[i].getCells()[1].setBusy(false);
						}
					}
					
				}.bind(this))
				
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
		onSaveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("reimbursementPageID");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("reimbursementDetailModel");
			var jsonData = JSON.stringify(oModel.getData());
			var oJWT = this.oJWT;
			console.log(jsonData);

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'reimbursement/saveReimbursement',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Reimbursement saved" }),
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
		onDelete: function(oEvent){
			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("reimbursementDetailModel");
			var oModelLineData = oModel.getData().REIMBURSEMENTLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/REIMBURSEMENTLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},
		onAddPress : function(oEvent){
			
			const oModel = this.getView().getModel("reimbursementDetailModel");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_NPWP": "",
				"U_Amount": 0,
				"U_Description": "",
			};
			oModelData.REIMBURSEMENTLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'reimbursementDetailModel');
			f.refresh();
		},
		onAmountChange : function(event){
			const oModel = this.getView().getModel("reimbursementDetailModel");
			var oModelData = oModel.getData().REIMBURSEMENTLINESCollection;
			const viewModel = this.getView().getModel("viewModel");
			var oBudgetingData = this.getView().getModel("budget").getData();
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += Number(oModelData[i]["U_Amount"]);
			}
			const oModelHeader = this.getView().getModel("reimbursementDetailModel");
			oModelHeader.setProperty("/U_TotalAmount", sum);
			var budgetAmount = oBudgetingData.U_RemainingBudget;
			if(sum > budgetAmount){
				this.getView().byId("submitButton").setEnabled(false);
				viewModel.setProperty("/amountExceeded","Advance Amount exceeded Budget!")
			}else{
				this.getView().byId("submitButton").setEnabled(true);
				viewModel.setProperty("/amountExceeded","")
			}

		},
		onRejectButtonClick : function(oEvent){
			if (!this.rejectReimbursementDialog) {
				this.rejectReimbursementDialog = this.loadFragment({
					name: "frontend.bbs.view.reimbursement.RejectForm"
				});
			}
			this.rejectReimbursementDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
			}.bind(this));
		},

		onConfirmRejectClick : function(){
			var pageDOM = this.getView().byId("reimbursementPageID");
			var reimbursementDetailData = this.getView().getModel("reimbursementDetailModel").getData();
			pageDOM.setBusy(true);
			var oDialog = this.getView().byId("rejectDialog");
			var code = reimbursementDetailData.Code;
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
				url: backendUrl+'reimbursement/rejectReimbursement',
				success: function (res, status, xhr) {
					  //success code
					  oDialog.close();
					  pageDOM.setBusy(false);
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Reimbursement rejected" }),
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