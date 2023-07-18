sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("frontend.bbs.controller.budgeting.Detail", {

		onInit: async function () {
			this.currentRoute = this.getOwnerComponent().getRouter().getHashChanger().getHash();
			this.oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = this.oStore.get("jwt");
			// var userData = await this.getOwnerComponent().checkToken(this.oJWT,this.currentRoute);
			// if(userData.status == "Error"){
			// 	window.location.href = "../index.html"
			// 	return;
			// };
			var oOwnerComponent = this.getOwnerComponent();
			var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
			this.getView().setModel(oSalesOrderModel,"salesOrder");
			this.oRouter = oOwnerComponent.getRouter();
			this.userModel = oOwnerComponent.getModel("userModel");
			this.getView().setModel(this.userModel,"userModel");
			this.oRouter.getRoute("budgetingDetail").attachPatternMatched(this._onObjectMatched, this);
			var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
			this.getView().setModel(oCompaniesModel,"companies");
		},
		_onObjectMatched: function (oEvent) {
		
			this.getView().bindElement({
				path: "/value/" + window.decodeURIComponent(oEvent.getParameter("arguments").budgetID),
				model: "budgeting"
			});
			const budgetingModel = this.getView().getModel('budgeting');
			var value = budgetingModel.getProperty('/value/'+window.decodeURIComponent(oEvent.getParameter("arguments").budgetID));
			const budgetingDetailModel = new JSONModel(value);
			this.getView().setModel(budgetingDetailModel,"budgetingDetailModel");
			
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
			
			var code = this.getView().byId("_IDGenText101").getText();
			$.ajax({
				type: "POST",
				data: {
					"Code": code
				},
				crossDomain: true,
				url: backendUrl+'budget/approveBudget',
				success: function (res, status, xhr) {
					  //success code
					console.log(res);
					console.log("Success");
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
		},
		onAmountChange : function(event){
			const oModel = this.getView().getModel("budgetingDetailModel");
			var oModelData = oModel.getData().BUDGETREQLINESCollection;
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			console.log(sum);
			const oModelHeader = this.getView().getModel("budgetingDetailModel");
			oModelHeader.setProperty("/U_TotalAmount", sum);

		}
	});
});