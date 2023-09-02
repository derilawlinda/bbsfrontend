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

	return Controller.extend("frontend.bbs.controller.materialRequest.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("materialRequestDetail").attachPatternMatched(this._onObjectMatched, this);
		
			
			

		},
		_onObjectMatched: function (oEvent) {
			
			var viewModel = new JSONModel({
				showFooter : false,
				editable : false,
				resubmit : false
			});
			this.getView().setModel(viewModel,"viewModel");
			var oItemsModel = new JSONModel();
			oItemsModel.setSizeLimit(999999);
			this.getView().setModel(oItemsModel,"items");
			this.getView().byId("materialRequestPageID").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");
			this.company = oStore.get("company");
			var accountModel = new JSONModel();
			this.getView().setModel(accountModel,"accounts");
			

			
			this.materialRequestCode = oEvent.getParameter("arguments").materialRequestID;
			var userModel = this.getOwnerComponent().getModel("userModel");
			if(userModel === undefined){
				const bus = this.getOwnerComponent().getEventBus();
				bus.subscribe("username", "checktoken", this.buildForm, this);
			}else{
				var userData = userModel.getData();
				var a = { "userName" : userData.user.name,
				  "roleId" : userData.user.role_id,
				  "roleName" : userData.role[0].name,
				  "status" : "success"
				};
				this.buildForm("username","checkToken",a);
			}
			
			
			
			
		},

		buildForm: function(channelId, eventId, parametersMap) {
			if(parametersMap.status == "error"){
				alert("Error");
				this.getView().byId("materialRequestPageID").setBusy(false);
			}
			var materialRequestCode = this.materialRequestCode;
			var viewModel = this.getView().getModel("viewModel");
			

			if(this.materialRequestCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				this.materialRequestCode = urlArray[urlArray.length - 1];
			}
			const materialRequestDetailModel = new JSONModel();
			this.getView().setModel(materialRequestDetailModel,"materialRequestDetailModel");
			materialRequestDetailModel.loadData(backendUrl+"materialRequest/getMaterialRequestById", {
				code : this.materialRequestCode,
				company : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			materialRequestDetailModel.dataLoaded().then(function(){
				
				var materialRequestDetailData = this.getView().getModel("materialRequestDetailModel").getData();
				var materialReqLineTable = this.getView().byId("materialReqLineTableID");
				materialReqLineTable.setVisibleRowCount(materialRequestDetailData.MATERIALREQLINESCollection.length);
				if(parametersMap.roleId == 4){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(materialRequestDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(parametersMap.roleId == 5){
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(materialRequestDetailData.U_Status == 1){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(parametersMap.roleId == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					viewModel.setProperty("/resubmit", false);

					if(materialRequestDetailData.U_Status == 4){
						viewModel.setProperty("/resubmit", true);
					}
					if((materialRequestDetailData.U_Status == 4 || materialRequestDetailData.U_Status == 1) ){
						viewModel.setProperty("/showFooter", true);
						viewModel.setProperty("/editable", true);
					}
				};

				let budget = new JSONModel();
				this.getView().setModel(budget,"budget");
				budget.loadData(backendUrl+"budget/getBudgetById?", {
					code : materialRequestDetailData.U_BudgetCode,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});

				var oBudgetingModel = new JSONModel();
				oBudgetingModel.loadData(backendUrl+"getBudget", {
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getView().setModel(oBudgetingModel,"budgeting");

				var accountModel = this.getView().getModel("accounts");
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget?", {
					budgetCode : materialRequestDetailData.U_BudgetCode,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				accountModel.refresh();

				
				var oItemsModel = this.getView().getModel("items");
				oItemsModel.setSizeLimit(999999);
				oItemsModel.setProperty("/data", []);
				var oItemData = oItemsModel.getData();
				var itemsByAccount = new JSONModel();
				itemsByAccount.setSizeLimit(999999);

				var accounts = [];
				if(materialRequestDetailData.MATERIALREQLINESCollection.length > 0){
					for (let i = 0; i < materialRequestDetailData.MATERIALREQLINESCollection.length; i++) {
						if(materialRequestDetailData.MATERIALREQLINESCollection[i].U_AccountCode){
							if(!(materialRequestDetailData.MATERIALREQLINESCollection[i].U_AccountCode.toString() in accounts)){
								accounts.push(materialRequestDetailData.MATERIALREQLINESCollection[i].U_AccountCode);
							};
						}
					}
					var uniqueAccounts = [... new Set(accounts)];
					
					for (let i = 0; i < uniqueAccounts.length; i++) {
						// this.getView().byId("materialRequestPageID").setBusy(true);
	
						itemsByAccount.loadData(backendUrl+"items/getItemsByAccount", {
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
							
						}.bind(this))
					};
	
					for (let i = 0; i < materialRequestDetailData.MATERIALREQLINESCollection.length; i++) {
						// materialReqLineTable.getRows()[i].getCells()[1].setBusy(true);
						if(materialRequestDetailData.MATERIALREQLINESCollection[i].U_AccountCode){
							let account = (materialRequestDetailData.MATERIALREQLINESCollection[i].U_AccountCode).toString();
						materialReqLineTable.getRows()[i].getCells()[1].bindAggregation("items", {
							path: 'items>/data/'+ account,
							template: new sap.ui.core.Item({
								key: "{items>ItemCode}",
								text: "{items>ItemCode} - {items>ItemName}"
							})
						});
						}
						// materialReqLineTable.getRows()[i].getCells()[1].setBusy(false);
					}
				}
				// this.getView().byId("materialRequestPageID").setBusy(false);

				

			}.bind(this));
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
		onApproveButtonClick : function (){
			var pageDOM = this.getView().byId("materialRequestPageID");
			var viewModel = this.getView().getModel("viewModel");
			pageDOM.setBusy(true);
			const oModel = this.getView().getModel("materialRequestDetailModel");
			var oProperty = oModel.getProperty("/");
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: JSON.stringify({
					company : this.company,
					oProperty : oProperty
				}),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialRequest/approveMR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Request approved" }),
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
		onRejectButtonClick : function(oEvent){
			if (!this.rejectMaterialRequestDialog) {
				this.rejectMaterialRequestDialog = this.loadFragment({
					name: "frontend.bbs.view.materialRequest.RejectForm"
				});
			}
			this.rejectMaterialRequestDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
			}.bind(this));
		},

		_closeDialog: function () {
			this.oDialog.close();
		},

		onConfirmRejectClick : function(){
			var pageDOM = this.getView().byId("materialRequestPageID");
			var materialRequestDetailData = this.getView().getModel("materialRequestDetailModel").getData();
			pageDOM.setBusy(true);
			var oDialog = this.getView().byId("rejectDialog");
			var code = materialRequestDetailData.Code;
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
				url: backendUrl+'materialRequest/rejectMR',
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  oDialog.close();
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Request rejected" }),
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
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("materialRequestDetailModel");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Qty": ""
			};
			oModelData.MATERIALREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'materialRequestDetailModel');
			f.refresh();
		
		},
		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("materialRequestDetailModel");
			var oModelLineData = oModel.getData().MATERIALREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/MATERIALREQLINESCollection",oModelLineData);
			oModel.refresh();
		},

		onSaveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("materialRequestPageID");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("materialRequestDetailModel");
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data:  JSON.stringify({
					company : this.company,
					data : oModel.getData()
				}),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialRequest/saveMR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Request saved" }),
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

		onResubmitButtonClick : function(oEvent) {
		
			var pageDOM = this.getView().byId("materialRequestPageID");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("materialRequestDetailModel");
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
				url: backendUrl+'materialRequest/resubmitMR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Request resubmitted" }),
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
				this.getView().byId("materialRequestPageID").setBusy(true);

				var accountModel = this.getView().getModel("accounts");
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget?", {
					budgetCode : sSelectedKey,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				accountModel.refresh();

				var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
				var budget = this.getView().getModel("budget");
				await budget.loadData(backendUrl+"budget/getBudgetById?code="+selectedID, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				budget.refresh();
				
				this.getView().byId("materialRequestPageID").setBusy(false);
			}
		},
		onAccountCodeChange : async function(oEvent){
			
			var oSelectedItem = oEvent.getSource().getSelectedKey(); //Get Selected Item
			var oSelectedRow = oEvent.getSource().getParent(); //Selected Row.
			oSelectedRow.getCells()[1].setSelectedKey("");
			oSelectedRow.getCells()[1].setBusy(true);
			oSelectedRow.getCells()[1].setEnabled(true);
	
		
	
			var oItemModel = this.getView().getModel("items");
			oItemModel.setSizeLimit(1000);
			var oItemData = oItemModel.getData();
			if(!(oSelectedItem in oItemData)){
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