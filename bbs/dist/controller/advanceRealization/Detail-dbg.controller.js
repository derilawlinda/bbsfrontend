sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/m/MessageToast",
], function (Controller, History, JSONModel,Dialog,Button,mobileLibrary,Text,coreLibrary,MessageToast) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("frontend.bbs.controller.advanceRealization.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			
			this.oRouter.getRoute("advanceRealizationDetail").attachPatternMatched(this._onObjectMatched, this);
			var oItemsModel = new JSONModel();
			this.getView().setModel(oItemsModel,"items");

        },
		_onObjectMatched: async function (oEvent) {
			var viewModel = new JSONModel({
				showFooter : false,
				editable : true,
				resubmit : false,
				is_finance : false,
				is_save : false,
				is_approver : false,
				is_submit : false,
				NPWP: [
					{"Name" : 0},
					{"Name" : 2.5},
					{"Name" : 3}
				]
			});
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("advanceRequestPageId").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");
			this.company =  oStore.get("company");

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
			advanceRequestDetailModel.loadData(backendUrl+"advanceRequest/getAdvanceRequestById", {
				code : advanceRequestCode,
				company : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(advanceRequestDetailModel,"advanceRequestDetailModel");
			var advanceRealLineTableID = this.getView().byId("advanceRealLineTableID");

			

			advanceRequestDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var advanceRequestDetailData = this.getView().getModel("advanceRequestDetailModel").getData();
				var ojwt = this.oJWT;
				this.onAmountChange();

				if(userData.user.role_id == 4){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(advanceRequestDetailData.U_RealiStatus == 3){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(advanceRequestDetailData.U_RealiStatus == 2){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(userData.user.role_id == 3){

					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);

					if(advanceRequestDetailData.U_RealiStatus == 1){
						viewModel.setProperty("/is_save", false);
						viewModel.setProperty("/is_submit", true);
						viewModel.setProperty("/showFooter", true);
					}

					if(advanceRequestDetailData.U_RealiStatus == 2){
						viewModel.setProperty("/is_save", true);
						viewModel.setProperty("/is_submit", false);
						viewModel.setProperty("/showFooter", true);
						viewModel.setProperty("/editable", true);

					}
					if((advanceRequestDetailData.U_RealiStatus == 5) ){
					console.log(advanceRequestDetailData.U_RealiStatus);

						viewModel.setProperty("/editable", true);
						viewModel.setProperty("/is_save", false);
						viewModel.setProperty("/resubmit", true);
						viewModel.setProperty("/showFooter", true);
					}
					
					
				}
				else if(userData.user.role_id == 2){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", false);
					viewModel.setProperty("/is_finance", true);
					viewModel.setProperty("/editable", false);
					if(advanceRequestDetailData.U_RealiStatus == 4){
						viewModel.setProperty("/showFooter", true);
					}
				};

				const oBudgetModel = new JSONModel();
				oBudgetModel.loadData(backendUrl+"budget/getBudgetById", {
					code : advanceRequestDetailData.U_BudgetCode,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetModel,"budget");
				oBudgetModel.dataLoaded().then(function() {
					var budgetingData = oBudgetModel.getData();
					var approvedBudget = budgetingData.U_TotalAmount;
					var usedBudget = budgetingData.BUDGETUSEDCollection;
					let sumUsedBudget = 0;
					if(usedBudget.length > 0){
						for (let i = 0; i < usedBudget.length; i++ ) {
							sumUsedBudget += usedBudget[i]["U_Amount"];
						};
					}
					var budgetRequestHeader = this.getView().getModel("budget");
					budgetRequestHeader.setProperty("/U_RemainingBudget",approvedBudget - sumUsedBudget);
					this.getView().byId("advanceRequestPageId").setBusy(false);

				}.bind(this));


				var accountModel = new JSONModel();
				accountModel.loadData(backendUrl+"coa/getCOAsByAR", {
					ARCode : advanceRequestDetailData.Code,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + ojwt
				});
				this.getView().setModel(accountModel,"accounts");

				accountModel.dataLoaded().then(function() {
					var oItemsModel = this.getView().getModel("items");
					oItemsModel.setProperty("/data/",[]);
					oItemsModel.refresh();
					var oItemByAccountModel = new JSONModel();
					var realizations = advanceRequestDetailData.REALIZATIONREQLINESCollection;

					for (let i = 0; i < realizations.length; i++) {
						advanceRealLineTableID.getRows()[i].getCells()[1].setBusy(true);
						var oItemsData = oItemsModel.getData();
						let account = (realizations[i].U_AccountCode).toString();


						if(!(realizations[i].U_AccountCode in oItemsData)){
							oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount", {
								accountCode : account,
								company : this.company
							}, true, "GET",false,false,{
								'Authorization': 'Bearer ' + ojwt
							});
							oItemByAccountModel.dataLoaded().then(function() {
								var oItemByAccountData = oItemByAccountModel.getData();
								var oItemsModel = this.getView().getModel("items");
								oItemsModel.setProperty("/data/"+account,oItemByAccountData);
								oItemsModel.refresh();
								advanceRealLineTableID.getRows()[i].getCells()[1].bindAggregation("items", {
									path: 'items>/data/'+ account,
									template: new sap.ui.core.Item({
										key: "{items>ItemCode}",
										text: "{items>ItemCode} - {items>ItemName}"
									})
								});
								advanceRealLineTableID.getRows()[i].getCells()[1].setBusy(false);

								
							}.bind(this))
						}else{
							advanceRealLineTableID.getRows()[i].getCells()[1].bindAggregation("items", {
								path: 'items>/data/'+ account,
								template: new sap.ui.core.Item({
									key: "{items>ItemCode}",
									text: "{items>ItemCode} - {items>ItemName}"
								})
							});
							advanceRealLineTableID.getRows()[i].getCells()[1].setBusy(false);
						}
					}
					
				}.bind(this))
				

				this.getView().byId("advanceRequestPageId").setBusy(false);
				
			}.bind(this));
			
		},

		onSubmitButtonClick : function(oEvent) {
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var oProperty = oModel.getProperty("/");
			oModel.setProperty("/U_DifferenceAmt", oProperty.U_Amount - oProperty.U_RealizationAmt);
			if(oProperty.U_RealizationAmt < oProperty.U_Amount){
				if (!this.transferAdvanceRequestDialog) {
					this.transferAdvanceRequestDialog = this.loadFragment({
						name: "frontend.bbs.view.advanceRealization.Transfer"
					});
				}
				this.transferAdvanceRequestDialog.then(function (oDialog) {
					this.oDialog = oDialog;
					this.oDialog.open();
				}.bind(this));
			}else{
				if (!this.oTransferConfirmationMessageDialog) {
					this.oTransferConfirmationMessageDialog = new Dialog({
						type: DialogType.Message,
						title: "Confirmation",
						state: ValueState.Attention,
						content: new Text({ text: "Realized Amount equals to the advance amount.  Continue ?" }),
						beginButton: new Button({
							type: ButtonType.Emphasized,
							text: "OK",
							press: function () {
								this.submitAdvanceRealization();
								viewModel.setProperty("/resubmit", false);
								viewModel.setProperty("/is_submit", false);
								viewModel.setProperty("/is_save", true);
								this.oTransferConfirmationMessageDialog.close();
							}.bind(this)
						}),
						endButton : new Button({
							type: ButtonType.Default,
							text: "Cancel",
							press: function () {
								this.oTransferConfirmationMessageDialog.close();
							}.bind(this)
						})
					});
				}
				this.oTransferConfirmationMessageDialog.open();
			}

			
			// alert(JSON.stringify(oProperty));
	   },

	   onConfirmButtonClick : function(){

			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var pageView = this.getView().byId("advanceRequestPageId");
			var view = this.getView();
			var oProperty = oModel.getProperty("/");
			var oJWT = this.oJWT;
			var company = this.company;
			pageView.setBusy(true);

			$.ajax({
				type: "POST",
				data: JSON.stringify({
					oProperty : oProperty,
					company : company
				}),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'advanceRequest/confirmAdvanceRealization',
				contentType: "application/json",
				success: function (res, status, xhr) {
					//success code
					pageView.setBusy(false);
					MessageToast.show("Advance Realization confimed");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});

					view.getModel('advanceRequestDetailModel').refresh();
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
					pageView.setBusy(false);
					console.log("Got an error response: " + textStatus + errorThrown);
				}
			});

	   },

	   submitAdvanceRealization : function(){
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var view = this.getView();
			var pageView = this.getView().byId("advanceRequestPageId");
			var dialogID = this.getView().byId("transferDialogID");
			var oProperty = oModel.getProperty("/");
			var oJWT = this.oJWT;
			var company = this.company;
			var viewModel = this.getView().getModel("viewModel");
			pageView.setBusy(true);

			$.ajax({
				type: "POST",
				data: JSON.stringify({
					oProperty : oProperty,
					company : company
				}),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'advanceRequest/submitAdvanceRealization',
				contentType: "application/json",
				success: function (res, status, xhr) {
					//success code
					pageView.setBusy(false);
					MessageToast.show("Advance Realization Submitted");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
					view.getModel('advanceRequestDetailModel').refresh();
					viewModel.setProperty("/resubmit", false);
					viewModel.setProperty("/is_submit", false);
					viewModel.setProperty("/is_save", true);
					
					dialogID.close();
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
					pageView.setBusy(false);
					dialogID.close();
					console.log("Got an error response: " + textStatus + errorThrown);
				}
			});
			
	   },


	   onRejectButtonClick : function(oEvent){
			if (!this.rejectAdvanceRealizationDialog) {
				this.rejectAdvanceRealizationDialog = this.loadFragment({
					name: "frontend.bbs.view.advanceRealization.RejectForm"
				});
			}
			this.rejectAdvanceRealizationDialog.then(function (oDialog) {
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
					"Remarks" : rejectionRemarks,
					"company" : this.company
				},
				headers: {"Authorization": "Bearer "+ this.oJWT},
				crossDomain: true,
				url: backendUrl+'advanceRequest/rejectAdvanceRealization',
				success: function (res, status, xhr) {
					//success code
					oDialog.close();
					pageDOM.setBusy(false);
					if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Advance Realization rejected" }),
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
					accountCode : oSelectedItem,
					company : this.company
				}, true, "GET",false,false,{
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
			const oAdvanceRequestData = oModel.getData();
			const advanceAmount = oAdvanceRequestData.U_Amount;
			var oModelData = oModel.getData().REALIZATIONREQLINESCollection;
			var viewModel = this.getView().getModel("viewModel");
			let sum = 0;
			if(oModelData.length > 0){
				for (let i = 0; i < oModelData.length; i++ ) {
					sum += Number(oModelData[i]["U_Amount"]);
				}
			}
			const oModelHeader = this.getView().getModel("advanceRequestDetailModel");
			oModelHeader.setProperty("/U_RealizationAmt", sum);
			oModelHeader.setProperty("/U_DifferenceAmt", advanceAmount - sum);
			if(sum > advanceAmount) {
				this.getView().byId("realizationAmount").setState(ValueState.Error);
				viewModel.setProperty("/amountExceeded","Realization Amount exceeded Advance Amount");
				this.getView().byId("submitButton").setEnabled(false);
				this.getView().byId("saveButton").setEnabled(false);
			}else{
				this.getView().byId("realizationAmount").setState(ValueState.None);
				viewModel.setProperty("/amountExceeded","");
				this.getView().byId("submitButton").setEnabled(true);
				this.getView().byId("saveButton").setEnabled(true);
			};

		},
		onBudgetChange : async function(oEvent){
			this.getView().byId("createARForm").setBusy(true);
			var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
			var budgetingModel = new JSONModel();
			await budgetingModel.loadData(backendUrl+"budget/getBudgetById", {
				code : selectedID,
				company : this.company
			}, true, "GET",false,false,{
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
			var budgetRequestHeader = this.getView().getModel("budget");
			budgetRequestHeader.setData(budgetingData);
			this.getView().byId("createARForm").setBusy(false);

		  },
		  onSaveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("advanceRequestPageId");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("advanceRequestDetailModel");
			var jsonData = JSON.stringify({
				company : this.company,
				data : oModel.getData()});
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
							content: new Text({ text: "Advance Realization saved" }),
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

		  onApproveButtonClick : function (){
			var pageDOM = this.getView().byId("advanceRequestPageId");
			var viewModel = this.getView().getModel("viewModel");
			pageDOM.setBusy(true);
			var code = this.getView().byId("advanceRequestId").getText();
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var oAdvanceRequestData = oModel.getData();
			var code = oAdvanceRequestData.Code;
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: {
					"Code": code,
					"company" : this.company
				},
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'advanceRequest/approveAdvanceRealization',
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Realization approved" }),
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

		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_NPWP": "",
				"U_Amount": 0,
				"U_Description": "",
			};
			oModelData.REALIZATIONREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'advanceRequestDetailModel');
			f.refresh();
		
		},
		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("advanceRequestDetailModel");
			var oModelLineData = oModel.getData().REALIZATIONREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/REALIZATIONREQLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
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
		objectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Warning';
			}else if(sStatus == 2){
				return 'Information';
			}
			else if(sStatus == 3){
				return 'Success';
			}else if(sStatus == 5){
				return 'Information';
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
			}else if(sStatus == 5){
				return 'Transferred'
			}else{
				return 'Rejected'
			}
		  
		},
		realizationButtonFormatter: function(sStatus) {
			if(sStatus == 3 || sStatus == 4){
				return 'Success'
			}else if(sStatus == 1 || sStatus == 2){
				return 'Warning'
			}else{
				return 'Error'
			}
		  },
		  realizationObjectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Information'}
			else if(sStatus == 2){
				return 'Warning'
			}
			else if(sStatus == 3){
				return 'Success'
			}else if(sStatus == 4){
				return 'Information'
			}else if(sStatus == 6){
				return 'Success'
			}
			else{
				return 'Error'
			}
		  },
		
		relizationTextFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Unrealized'
			}else if(sStatus == 2){
				return 'Submitted'
			}else if(sStatus == 3){
				return 'Approved by Manager'
			}else if(sStatus == 4){
				return 'Approved by Director'
			}else if(sStatus == 6){
				return 'Realized'
			}else{
				return 'Rejected'
			}
		  
		}
	});
});