sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"frontend/bbs/utils/Validator",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
 ], function (Controller,mobileLibrary, MessageToast, Text, TextArea,JSONModel,coreLibrary,Validator,History,MessageBox) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	var ValueState = coreLibrary.ValueState;
    return Controller.extend("frontend.bbs.controller.userAdministration.UserDetail", {
        onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("userDetail").attachPatternMatched(this._onObjectMatched, this);

        },
		_onObjectMatched: async function (oEvent) {
		    this.getView().byId("userPageID").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");

			var oUserModel = new JSONModel();
            console.log("Aaaaaa");
			await oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});

            this.userId = oEvent.getParameter("arguments").userID;
            console.log(this.userId);
			if(this.userId === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				this.userId = urlArray[urlArray.length - 1];
			}

            var roleModel = new JSONModel();
            roleModel.setSizeLimit(100);
            roleModel.loadData(backendUrl+"getRoles",null, true, "GET",false,false,{
                'Authorization': 'Bearer ' + this.oJWT
            });
            this.getOwnerComponent().setModel(roleModel,"roles");
			
			const userDetailModel = new JSONModel();
			this.getView().setModel(userDetailModel,"userDetailModel");

			userDetailModel.loadData(backendUrl+"user/getUserById", {
				id : this.userId
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			userDetailModel.refresh();

            this.getView().byId("userPageID").setBusy(false);
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
        onSaveButtonClick : function (oEvent){
            var userModel = this.getView().getModel("userDetailModel");
			var userReqData = userModel.getData();
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
            
            if (validator.validate(this.byId("editUserForm"))) {

                $.ajax({
					type: "POST",
					data: JSON.stringify(userReqData),
					crossDomain: true,
					headers: { 'Authorization': 'Bearer ' + oJWT },
					url: backendUrl+'user/editUser',
					contentType: "application/json",
					success: function (res, status, xhr) {
						MessageToast.show("User updated");
						$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
					},
					error: function (jqXHR, textStatus, errorThrown) {
						MessageBox.error(jqXHR.responseJSON.msg);
					}
				  });
            }
        }
        
    });
 });