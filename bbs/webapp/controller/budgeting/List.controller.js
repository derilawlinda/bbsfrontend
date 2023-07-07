sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel"
 ], function (Controller,History,JSONModel,ODataModel) {
    "use strict";
	var endTerm;
	var startTerm;
	var matches = [];

    return Controller.extend("frontend.bbs.controller.budgeting.List", {
       onInit: function () {
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		var oJWT = oStore.get("jwt");
		var oModel = new JSONModel();
		oModel.loadData(backendUrl+"getBudget", { key: "value" }, true, "GET",false,false,{
			'Authorization': 'Bearer ' + oJWT
		});
		  this.getView().setModel(oModel,"budgeting");
		var oBudgetingAccount = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/budgeting_accounts.json"));
		this.getView().setModel(oBudgetingAccount,"budgeting_accounts");
		
		
		
		
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
			this.oDialog = oDialog;
			this.oDialog.open();
			var oBudgetingDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oBudgetingDetailModel.setData(dynamicProperties);
			this.getView().setModel(oBudgetingDetailModel,"budgetingDetailModel");
			var oNewBudgetingAccounts = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oNewBudgetingAccounts,"new_budgeting_accounts");
			this.getView().getModel("new_budgeting_accounts").setProperty("/accountRow", []);

		}.bind(this));
	   },
	   onSaveButtonClick : function(oEvent) {
		console.log(oEvent);
	   },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_closeDialog: function () {
			this.oDialog.close();
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 'Approved'){
				return 'Accept'
			}else if(sStatus == 'Pending'){
				return 'Attention'
			}else{
				return 'Reject'
			}
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
			var oPath = oEvent.getSource().getBindingContextPath();
			var budget = oPath.split("/").slice(-1).pop();
			oRouter.navTo("budgetingDetail",{
				budgetID : budget
			});

			
		},
		onAddPress : function(oEvent){
			
			const oModel = this.getView().getModel("new_budgeting_accounts");
			const oAccounts = console.log(this.getView().getModel("accounts"));
			var oModelData = oModel.getData();
			var oNewObject = {
				"account_code": "",
				"account_name": "",
				"amount": ""
			};
			oModelData.accountRow.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_budgeting_accounts');
			f.refresh();
		
		}
    });
 });