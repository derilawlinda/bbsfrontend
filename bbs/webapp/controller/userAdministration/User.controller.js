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
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"frontend/bbs/utils/Validator",
 ], function (Controller,History,Fragment,HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea,JSONModel,coreLibrary,Validator) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	var ValueState = coreLibrary.ValueState;
    return Controller.extend("frontend.bbs.controller.userAdministration.User", {
       onInit: function () {
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		console.log(this.oJWT);
		this.company = oStore.get("company");
		var oModel = new JSONModel();
		oModel.setSizeLimit(2000);
		oModel.loadData(backendUrl+"getUsers",null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oModel,"userList");

		var roleModel = new JSONModel();
		roleModel.setSizeLimit(100);
		roleModel.loadData(backendUrl+"getRoles",null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(roleModel,"roles");

       },
	   roleFormatter: function(sStatus) {
		if(sStatus == 1){
			return 'Administrator'
		}
		else if(sStatus == 2){
			return 'Finance'
		}
		else if(sStatus == 3){
			return 'Staff'
		}else if(sStatus == 4){
			return 'Director'
		}else if(sStatus == 5){
			return 'Manager'
		}
	  },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createUserDialog) {
			this.createUserDialog = this.loadFragment({
				name: "frontend.bbs.view.userAdministration.CreateForm"
			});
		}
		this.createUserDialog.then(function (oDialog) {
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oCreateFragmentViewModel,"userCreate");
			this.oDialog = oDialog;
			this.oDialog.open();

		}.bind(this));
	   },
	   _closeDialog: function () {
			this.oDialog.close();
		},
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onSaveButtonClick : function (){
			
			var userModel = this.getView().getModel("userCreate");
			var userListModel = this.getView().getModel("userList");
			var userReqData = userModel.getData();
			userReqData.role_id = this.getView().byId("role").getSelectedKey();
			var oJWT = this.oJWT;

			var validator = new Validator();

			var password = this.getView().byId("password").getValue();
			var password2 = this.getView().byId("password2").getValue();

			if(password != null && password2 != null){

				if(password != password2){
					this.getView().byId("password").setValueState(ValueState.Error);
					this.getView().byId("password").setValueStateText("Password inputted not the same");
					this.getView().byId("password2").setValueState(ValueState.Error);
					this.getView().byId("password2").setValueStateText("Password inputted not the same");
				}else{
					this.getView().byId("password").setValueState(ValueState.Success);
					this.getView().byId("password2").setValueState(ValueState.Success);
				};
			}

			

            // Validate input fields against root page with id 'somePage'
          	if (validator.validate(this.byId("createUserForm"))) {
				var oDialog = this.oDialog;
				oDialog.setBusy(true);
				$.ajax({
					type: "POST",
					data: JSON.stringify(userReqData),
					crossDomain: true,
					headers: { 'Authorization': 'Bearer ' + oJWT },
					url: backendUrl+'user/createUser',
					contentType: "application/json",
					success: function (res, status, xhr) {
						  //success code
						oDialog.setBusy(false);
						oDialog.close();
						userListModel.loadData(backendUrl+"getUsers", null, true, "GET",false,false,{
							'Authorization': 'Bearer ' + oJWT
						});
						userListModel.refresh();
						MessageToast.show("Material Request created");
						$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
	
						
					},
					error: function (jqXHR, textStatus, errorThrown) {
						oDialog.setBusy(false);
						if (!this.oErrorDialog) {
							this.oErrorDialog = new Dialog({
								type: DialogType.Message,
								title: "Error",
								state: ValueState.Error,
								content: new Text({ text: jqXHR.responseJSON.msg }),
								beginButton: new Button({
									type: ButtonType.Emphasized,
									text: "OK",
									press: function () {
										this.oErrorDialog.close();
									}.bind(this)
								})
							});
						};
						this.oErrorDialog.open();
					}
				  });
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
		}
    });
 });