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
	"sap/ui/model/json/JSONModel"
 ], function (Controller,History,Fragment,HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea,JSONModel) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
    return Controller.extend("frontend.bbs.controller.userAdministration.User", {
       onInit: function () {
		var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/users.json"));
		this.getView().setModel(oModel);

       },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createUserDialog) {
			this.createUserDialog = new Dialog({
				type: DialogType.Message,
				title: "Confirm",
				content: new Text({ text: "Do you want to submit this order?" }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: "Submit",
					press: function () {
						MessageToast.show("Submit pressed!");
						this.createUserDialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						this.createUserDialog.close();
					}.bind(this)
				})
			});
		}

		this.createUserDialog.open();
	   },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
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
		}
    });
 });