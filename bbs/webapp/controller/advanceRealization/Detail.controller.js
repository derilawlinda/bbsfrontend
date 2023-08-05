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
				is_finance : false,
				showFooter : true
			});
			this.getView().setModel(viewModel,"viewModel");
			viewModel.setData({
				NPWP: [
					{"Name" : 0},
					{"Name" : 2.5},
					{"Name" : 3}
				]
			});
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

			

			advanceRequestDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var advanceRequestDetailModel = this.getView().getModel("advanceRequestDetailModel").getData();
				var ojwt = this.oJWT;
				console.log(advanceRequestDetailModel.U_RealiStatus);
				if(userData.user.role_id == 4){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					viewModel.setProperty("/is_finance", false);
					if(advanceRequestDetailModel.U_RealiStatus == 4){
						viewModel.setProperty("/showFooter", false);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					viewModel.setProperty("/is_finance", false);
					if(advanceRequestDetailModel.U_RealiStatus == 3){
						viewModel.setProperty("/showFooter", false);
					}
				}
				else if(userData.user.role_id == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					viewModel.setProperty("/is_finance", false);
					if(advanceRequestDetailModel.U_RealiStatus == 2){
						viewModel.setProperty("/showFooter", false);
						viewModel.setProperty("/editable", false);
					}
				}
				else if(userData.user.role_id == 2){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", false);
					viewModel.setProperty("/is_finance", true);
					viewModel.setProperty("/editable", false);
					if(advanceRequestDetailModel.U_RealiStatus == 4){
						viewModel.setProperty("/showFooter", true);
					}
				};
;

				

				var accountModel = new JSONModel();
				accountModel.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+advanceRequestDetailModel.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + ojwt
				});
				this.getView().setModel(accountModel,"accounts");

				accountModel.dataLoaded().then(function() {
					var oItemModel = this.getView().getModel("items");
					this.getView().getModel("items").setProperty("/data", []);
					var oItemData = oItemModel.getData();

					var accountData = accountModel.getData();
					accountData.value.map(function(item) {
						var oItemByAccountModel = new JSONModel();
						oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount?accountCode='"+item.Code+"'", null, true, "GET",false,false,{
							'Authorization': 'Bearer ' + ojwt
						});
						oItemByAccountModel.dataLoaded().then(function() {
							var oItemByAccountData = oItemByAccountModel.getData();
							oItemData.data[item.Code] = oItemByAccountData;

						}.bind(this))
						
					}.bind(this));
					var i = new sap.ui.model.json.JSONModel(oItemData);
					this.getView().setModel(i, 'items');
					i.refresh();

				}.bind(this))

				this.getView().byId("advanceRequestPageId").setBusy(false);
				
			}.bind(this));
		},

		onSaveButtonClick : function(oEvent) {
			this.getView().byId("advanceRequestPageId").setBusy(true);
			const oModel = this.getView().getModel("advanceRequestDetailModel");
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oJWT = this.oJWT;
			var pageView = this.getView().byId("advanceRequestPageId");

			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'advanceRequest/submitAdvanceRealization',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					pageView.setBusy(false);
					MessageToast.show("Advance Realization Submitted");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
					view.getModel('materialRequest').refresh();
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
					pageView.setBusy(false);
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// alert(JSON.stringify(oProperty));
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
			var oModelData = oModel.getData().ADVANCEREQLINESCollection;
			console.log(oModelData);
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			console.log(sum);
			const oModelHeader = this.getView().getModel("advanceRequestDetailModel");
			oModelHeader.setProperty("/U_Amount", sum);

		},
		onBudgetChange : async function(oEvent){
			this.getView().byId("createARForm").setBusy(true);
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
			var budgetRequestHeader = this.getView().getModel("budget");
			budgetRequestHeader.setData(budgetingData);
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
				url: backendUrl+'advanceRequest/approveAdvanceRealization',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					//   pageDOM.setBusy(false);
					  
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
						// viewModel.setProperty("/showFooter", false);
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