sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/webc/main/Toast",
        "sap/ui/core/routing/History"
        
    ],
    function(Controller,Toast,History) {
      "use strict";
  
      return Controller.extend("frontend.bbs.controller.Login", {
        onInit() {
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var oJWT = oStore.get("jwt");
            this.getOwnerComponent().checkToken(oJWT,"dashboard")
           
            

        },

        onLoginPressed(){

            // this.getOwnerComponent().getRouter().getTargets().display("notFound", {
			// 	fromTarget : "login"
			// });
            let username = this.getView().byId("username").valueOf().getValue();
            let password = this.getView().byId("password").valueOf().getValue();
            let loginErrorToast = this.getView().byId("loginError");
            let router = this.getOwnerComponent().getRouter();
           
            var oHistory, sPreviousHash;
            this.oHistory = History.getInstance();
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var sPreviousHash = oStore.get("prevHash");
            console.log(sPreviousHash);

            $.ajax({url : backendUrl+"login",
                type: 'POST',
                data: JSON.stringify({ 
                    email: username, 
                    password : password
                }),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(result){
				    oStore.put("jwt", result.jwt );
                    if (sPreviousHash !== null) {
                        alert("ke sini?");
                        console.log("atau ke sini ?");
                        window.history.go(-1);

                    } else {
                        console.log("ke sini kah ?");
                        router.navTo("dashboard", {}, true /*no history*/);
                    }
                },
                statusCode: {    
                    401: function(request,status,errorThrown){ 
                        loginErrorToast.show();
                    },
                    404: function(request,status,errorThrown){ 
                        loginErrorToast.show();
                    }
                },
                
                });
        }
      });
    }
  );
  