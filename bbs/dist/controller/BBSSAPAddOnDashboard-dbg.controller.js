sap.ui.define([
	'./BaseController',
    "sap/ui/Device",
    "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/routing/History",
	"sap/ui/core/EventBus"
       
	
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,Device, Controller, JSONModel, Popover, Button, library,History,EventBus) {
        "use strict";

        var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;

        return BaseController.extend("frontend.bbs.controller.BBSSAPAddOnDashboard", {

		_bExpanded: false,
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},	
		onInit: async function () {
			var oUserModel = new JSONModel();
			const bus = this.getOwnerComponent().getEventBus();

			var oComponent = this.getOwnerComponent();
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");
			this.company = oStore.get('company');
			oUserModel.attachRequestFailed(function(oEvent){
				
				bus.publish("username", "checktoken", 
				{ "status" : "error"
				});
				window.location.href = '../index.html';


			});
			await oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			var userData = oUserModel.getData();

    		bus.publish("username", "checktoken", 
				{ "userName" : userData.user.name,
				  "roleId" : userData.user.role_id,
				  "roleName" : userData.role[0].name,
				  "status" : "success"
			});
			this.getOwnerComponent().setModel(oUserModel,"userModel");
			this.getView().setModel(oUserModel,"userModel");
			this.getView().getModel('userModel').setProperty("/company",this.company);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oModel = this.getOwnerComponent().getModel("navigationList");
			this.getView().setModel(oModel);
			this._setToggleButtonTooltip(!Device.system.desktop);
			var currentRoute = this.getRouter().getHashChanger().getHash();
			Device.media.attachHandler(this._handleWindowResize, this);
			this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
			this.getOwnerComponent().getModel("navigationList").setProperty('/selectedKey', currentRoute);
		},

		onRouteChange: function (oEvent) {
			this.getOwnerComponent().getModel("navigationList").setProperty('/selectedKey', oEvent.getParameter('name'));

			if (Device.system.phone) {
				this.onSideNavButtonPress();
			}
		},

		onLogoutItemSelect: function(event){
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var oJWT = oStore.get("jwt");
			console.log(oJWT);
			var oRouter = this.getRouter();
			$.ajax({url : backendUrl+"logout",
                type: 'POST',
                headers: {"Authorization": "Bearer "+oJWT},
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(result){
                    jQuery.sap.storage.clear();
					window.location.href = '../index.html';
                },
                statusCode: {    
                    401: function(request,status,errorThrown){ 
						window.location.href = '../index.html';

                    },
                    404: function(request,status,errorThrown){ 
                        loginErrorToast.show();
                    }
                },
                
                });
			
		},

		onParentItemSelect: function(event){
			var oNavItem = event.getSource();
			var router = this.getRouter();
			
			if(oNavItem.getItems().length == 0){
				oNavItem.setHref("#/"+oNavItem.mProperties.key)
			}
		},

		handleUserNamePress: function (event) {
			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [
					new Button({
						text: 'Change Company',
						type: ButtonType.Transparent
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

			oPopover.openBy(event.getSource());
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		},
		_handleWindowResize: function (oDevice) {
			if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
				this.onSideNavButtonPress();
				// set the _bExpanded to false on tablet devices
				// extending and collapsing of side navigation should be done when resizing from
				// desktop to tablet screen sizes)
				this._bExpanded = (oDevice.name === "Desktop");
			}
		}
        });
    });
