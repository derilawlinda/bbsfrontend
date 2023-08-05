sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/m/MessageToast",
	"frontend/bbs/model/models"
 ], function (Controller,History,JSONModel,ODataModel,MessageToast,Models) {
    "use strict";
	var endTerm;
	var startTerm;
	var matches = [];

    return Controller.extend("frontend.bbs.controller.budgeting.List", {
		
       onInit: async function () {
		this.getView().byId("idBudgetTable").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		var oModel = new JSONModel();
		oModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true
		});
		this.getView().setModel(viewModel,"viewModel");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("idBudgetTable").setBusy(false);
		}.bind(this));
		this.getView().setModel(oModel,"budgeting");
		var oBudgetingAccount = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/budgeting_accounts.json"));
		this.getView().setModel(oBudgetingAccount,"budgeting_accounts");

		var userModel = this.getOwnerComponent().getModel("userModel");
		if(userModel === undefined){
			const bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("username", "checktoken", this.toggleCreateButton, this);
		}else{
			var userData = userModel.getData();
			var a = { "userName" : userData.user.name,
			  "roleId" : userData.user.role_id,
			  "roleName" : userData.role[0].name,
			  "status" : "success"
			};
			this.toggleCreateButton("username","checkToken",a);
		}

		
	},

	toggleCreateButton : function(channelId, eventId, parametersMap){
			if(parametersMap.roleId == 4 || parametersMap.roleId == 5){
				this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
			}
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
			this.getView().byId("CreatePillar").setSelectedKey("");
			this.getView().byId("CreateClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreatePillar").setEnabled(false);
			this.getView().byId("CreateClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification2").setEnabled(false);


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
			var oDialog = this.oDialog;
			oDialog.setBusy(true);
			const oModel = this.getView().getModel("budgetingDetailModel");
			const oModelAccounts = this.getView().getModel("new_budgeting_accounts");
			var budgetingModel = this.getView().getModel("budgeting");
			oModel.setProperty("/BUDGETREQLINESCollection", oModelAccounts.getData().BUDGETREQLINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'budget/createBudget',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.setBusy(false);
					oDialog.close();
					MessageToast.show("Budget created");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
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
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			oRouter.navTo("budgetingDetail",{
				budgetID : id
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
		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("new_budgeting_accounts");
			var oModelLineData = oModel.getData().BUDGETREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/BUDGETREQLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},
    });
 });