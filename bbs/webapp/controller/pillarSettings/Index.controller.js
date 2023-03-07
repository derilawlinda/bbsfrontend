sap.ui.define([
	'sap/ui/core/mvc/Controller', 
    'sap/ui/model/json/JSONModel', 
    'sap/m/MessageToast'
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	var PageController = Controller.extend("frontend.bbs.controller.pillarSettings.Index", {
		onInit: function(evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/pillars.json"));
			this.getView().setModel(oModel);
		},

		handleButtonPress: function(evt) {
			MessageToast.show("Button pressed");
		}

	});

	return PageController;

});