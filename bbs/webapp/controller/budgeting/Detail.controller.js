sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/m/Input",
	"sap/m/TextArea"
], function (Controller, History, JSONModel,Dialog,Button,mobileLibrary,Text,coreLibrary,Input,TextArea) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("frontend.bbs.controller.budgeting.Detail", {

		
		onInit: async function () {
			this.currentRoute = this.getOwnerComponent().getRouter().getHashChanger().getHash();
			this.oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = this.oStore.get("jwt");
			var oOwnerComponent = this.getOwnerComponent();
			var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
			this.getView().setModel(oSalesOrderModel,"salesOrder");
			this.oRouter = oOwnerComponent.getRouter();
			this.userModel = oOwnerComponent.getModel("userModel");
			this.getView().setModel(this.userModel,"userModel");
			this.oRouter.getRoute("budgetingDetail").attachPatternMatched(this._onObjectMatched, this);
			
		},
		_onObjectMatched: function (oEvent) {
			var viewModel = new JSONModel({
				showFooter : false,
				editable : true,
				resubmit : false
			});
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("budgetingPageId").setBusy(true);
			this.budgetCode = oEvent.getParameter("arguments").budgetID;
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
				this.getView().byId("budgetingPageId").setBusy(false);
			}
			var budgetCode = this.budgetCode;
			var viewModel = this.getView().getModel("viewModel");

			if(parametersMap.roleId == 4 || parametersMap.roleId == 5 ){
				viewModel.setProperty("/is_approver", true);
				viewModel.setProperty("/is_requestor", false);
			}else if(parametersMap.roleId == 3){
				viewModel.setProperty("/is_approver", false);
				viewModel.setProperty("/is_requestor", true);
			}

			if(budgetCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				budgetCode = urlArray[urlArray.length - 1];
			}
			const budgetingDetailModel = new JSONModel();
			budgetingDetailModel.loadData(backendUrl+"budget/getBudgetById?code="+budgetCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(budgetingDetailModel,"budgetingDetailModel");
			budgetingDetailModel.dataLoaded().then(function(){
				var budgetingDetailData = budgetingDetailModel.getData();
		
				if(parametersMap.roleId == 4){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(budgetingDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(parametersMap.roleId == 5){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(budgetingDetailData.U_Status == 1){
						viewModel.setProperty("/showFooter", true);
					}
				}
				else if(parametersMap.roleId == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					viewModel.setProperty("/resubmit", false);

					if(budgetingDetailData.U_Status == 4){
						viewModel.setProperty("/resubmit", true);
					}
					if((budgetingDetailData.U_Status == 4 || budgetingDetailData.U_Status == 1) ){
						viewModel.setProperty("/showFooter", true);
						viewModel.setProperty("/editable", true);
					}
				};

				var companyPath = this.getView().byId("company").getSelectedItem().getBindingContext("companies").getPath();
				this.getView().byId("CreatePillar").bindAggregation("items", {
					path: "companies>"+ companyPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>text}",
						text: "{companies>text}"
					})
				});

				this.getView().byId("CreatePillar").setSelectedKey(budgetingDetailData.U_Pillar);
				var pillarPath = this.getView().byId("CreatePillar").getSelectedItem().getBindingContext("companies").getPath();
				
				this.getView().byId("CreateClassification").bindAggregation("items", {
					path: "companies>"+ pillarPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>text}",
						text: "{companies>text}"
					})
				});
				this.getView().byId("CreateClassification").setSelectedKey(budgetingDetailData.U_Classification);
				var classificationPath = this.getView().byId("CreateClassification").getSelectedItem().getBindingContext("companies").getPath();

				this.getView().byId("CreateSubClassification").bindAggregation("items", {
					path: "companies>"+ classificationPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>text}",
						text: "{companies>text}"
					})
				});
				this.getView().byId("CreateSubClassification").setSelectedKey(budgetingDetailData.U_SubClass);
				var classificationPath = this.getView().byId("CreateSubClassification").getSelectedItem().getBindingContext("companies").getPath();

				this.getView().byId("CreateSubClassification2").bindAggregation("items", {
					path: "companies>"+ classificationPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>text}",
						text: "{companies>text}"
					})
				});
				this.getView().byId("CreateSubClassification2").setSelectedKey(budgetingDetailData.U_SubClass2);
				var classificationPath = this.getView().byId("CreateSubClassification2").getSelectedItem().getBindingContext("companies").getPath();

				this.getView().byId("budgetingPageId").setBusy(false);

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

		
		onApproveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("budgetingPageId");
			pageDOM.setBusy(true);
			var code = this.getView().byId("_IDGenText101").getText();
			$.ajax({
				type: "POST",
				data: {
					"Code": code
				},
				headers: {"Authorization": "Bearer "+ this.oJWT},
				crossDomain: true,
				url: backendUrl+'budget/approveBudget',
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Budget approved" }),
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
			if (!this.rejectBudgetingDialog) {
				this.rejectBudgetingDialog = this.loadFragment({
					name: "frontend.bbs.view.budgeting.RejectForm"
				});
			}
			this.rejectBudgetingDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
			}.bind(this));
		},

		_closeDialog: function () {
			this.oDialog.close();
		},

		onConfirmRejectClick : function(){
			var pageDOM = this.getView().byId("budgetingPageId");
			var budgetingDetailData = this.getView().getModel("budgetingDetailModel").getData();
			pageDOM.setBusy(true);
			var code = budgetingDetailData.Code;
			var rejectionRemarks = this.getView().byId("RejectionRemarksID").getValue();
			
			$.ajax({
				type: "POST",
				data: {
					"Code": code,
					"Remarks" : rejectionRemarks
				},
				headers: {"Authorization": "Bearer "+ this.oJWT},
				crossDomain: true,
				url: backendUrl+'budget/rejectBudget',
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  this.rejectBudgetingDialog.close();
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Budget rejected" }),
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
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  }.bind(this));
		},

		onAmountChange : function(event){
			const oModel = this.getView().getModel("budgetingDetailModel");
			var oModelData = oModel.getData().BUDGETREQLINESCollection;
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			const oModelHeader = this.getView().getModel("budgetingDetailModel");
			oModelHeader.setProperty("/U_TotalAmount", sum);

		},
		onCompanyChange : function(oEvent){
			this.getView().byId("CreatePillar").setSelectedKey("");
			this.getView().byId("CreateClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification2").setEnabled(false);


			var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
			this.companyPath = comboPath;
			var comboPillar = this.getView().byId("CreatePillar");
			comboPillar.setEnabled(true);
			comboPillar.bindAggregation("items", {
				path: "companies>"+ comboPath + "/nodes",
				template: new sap.ui.core.Item({
					key: "{companies>text}",
					text: "{companies>text}"
				})
			});
		},
		onPillarChange : function(oEvent){
			this.getView().byId("CreateClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateSubClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification2").setEnabled(false);
			var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
			var comboBox = this.getView().byId("CreateClassification");
			comboBox.setEnabled(true);
			comboBox.bindAggregation("items", {
				path: "companies>"+ comboPath + "/nodes",
				template: new sap.ui.core.Item({
					key: "{companies>text}",
					text: "{companies>text}"
				})
			});
		},

		onClassificationChange : function(oEvent){

			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateSubClassification2").setEnabled(false);
			var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
			var comboBox = this.getView().byId("CreateSubClassification");
			comboBox.setEnabled(true);
			comboBox.bindAggregation("items", {
				path: "companies>"+ comboPath + "/nodes",
				template: new sap.ui.core.Item({
					key: "{companies>text}",
					text: "{companies>text}"
				})
			});
		},
		onSubClassificationChange : function(oEvent){

			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
			var comboBox = this.getView().byId("CreateSubClassification2");
			comboBox.setEnabled(true);
			comboBox.bindAggregation("items", {
				path: "companies>"+ comboPath + "/nodes",
				template: new sap.ui.core.Item({
					key: "{companies>text}",
					text: "{companies>text}"
				})
			});
		},
		onAddPress : function(oEvent){
			
			const oModel = this.getView().getModel("budgetingDetailModel");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_Amount": ""
			};
			oModelData.BUDGETREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'budgetingDetailModel');
			f.refresh();
		
		},

		onSaveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("budgetingPageId");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("budgetingDetailModel");
			var jsonData = JSON.stringify(oModel.getData());
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'budget/saveBudget',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Budget saved" }),
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
		
			var pageDOM = this.getView().byId("budgetingPageId");
			pageDOM.setBusy(true);
			var oModel = this.getView().getModel("budgetingDetailModel");
			var jsonData = JSON.stringify(oModel.getData());
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: jsonData,
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'budget/resubmitBudget',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Budget resubmitted" }),
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
			var oModel = this.getView().getModel("budgetingDetailModel");
			var oModelLineData = oModel.getData().BUDGETREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/BUDGETREQLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},
	});
});