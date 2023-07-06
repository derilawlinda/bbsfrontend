sap.ui.define([
	'./BaseController',
    "sap/ui/Device",
    "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library",
	
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,Device, Controller, JSONModel, Popover, Button, library) {
        "use strict";

        var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;

        return BaseController.extend("frontend.bbs.controller.BBSSAPAddOnDashboard", {

		_bExpanded: false,
			
		onInit: async function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var oJWT = oStore.get("jwt");
			var oModel = this.getOwnerComponent().getModel("navigationList");
			this.getView().setModel(oModel);
			this._setToggleButtonTooltip(!Device.system.desktop);
			var currentRoute = this.getRouter().getHashChanger().getHash();
			var userData = await this.getOwnerComponent().checkToken(oJWT,currentRoute);
			var oViewModel = new JSONModel({userName: userData.data.user.name});
			var userData = this.getOwnerComponent().setModel(oViewModel,"userModel");
			this.getView().setModel(oViewModel,"view");
			Device.media.attachHandler(this._handleWindowResize, this);
			this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
			this.getOwnerComponent().getModel("navigationList").setProperty('/selectedKey', currentRoute);
			this.getView().byId('_IDGenNavigationList1').getSelectedItem().oParent.setProperty("expanded",true);
		},

		onRouteChange: function (oEvent) {
			this.getOwnerComponent().getModel("navigationList").setProperty('/selectedKey', oEvent.getParameter('name'));

			if (Device.system.phone) {
				this.onSideNavButtonPress();
			}
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
						text: 'Logout',
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
