sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Input",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
 ], function (Controller,History,Fragment,HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea,Input,JSONModel,Core) {
    "use strict";
	var endTerm;
	var startTerm;
	var matches = [];

    return Controller.extend("frontend.bbs.controller.budgeting.List", {
       onInit: async function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/budgeting.json"));
		this.getView().setModel(oModel,"budgeting");
		
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

			
		}
    });
 });