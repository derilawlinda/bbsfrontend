sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("frontend.bbs.controller.App", {
        onInit() {
        },
        checkToken (request){
          $.ajaxSetup({
            headers: { 'Authorization': 'Bearer ' + oJWT }
          });
          $.ajax({
              url: backendUrl+"checkToken",
              method: 'POST',
              contentType:"application/json; charset=utf-8",
              dataType:"json",
              success: function(data) {
                console.log("Dashboard here..");
                  router.navTo("dashboard");
              },
              error: function(xhr, status, error) {
                if (xhr.status === 401) {
                  router.navTo("");
                }
              }
          });
        }
      });
    }
  );
  