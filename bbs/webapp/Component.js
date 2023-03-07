/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "frontend/bbs/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("frontend.bbs.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                window.backendUrl = this.getManifestEntry("/sap.app/dataSources/bbsbackend/uri");

                

                
            },

            getContentDensityClass: function () {
                if (!this._sContentDensityClass) {
                    if (!Device.support.touch){
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
                return this._sContentDensityClass;
            },

            checkToken : function(oJWT,navTo){
                let router = this.getRouter();
                return new Promise(function(resolve, reject) {
                    $.ajaxSetup({
                        headers: { 'Authorization': 'Bearer ' + oJWT }
                    });
                    $.ajax({
                        url: backendUrl+"/checkToken",
                        method: 'POST',
                        contentType:"application/json; charset=utf-8",
                        dataType:"json",
                        success: function(result) {
                            resolve({data: result});
                            router.navTo(navTo);
                        },
                        error: function(xhr, status, error) {
                          if (xhr.status === 401) {
                            console.log(status); 
                          }
                        }
                    });
                });

                
            }
        });
    }
);