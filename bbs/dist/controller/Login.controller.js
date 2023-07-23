sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/webc/main/Toast","sap/ui/core/routing/History"],function(e,t,o){"use strict";return e.extend("frontend.bbs.controller.Login",{onInit(){var e=jQuery.sap.storage(jQuery.sap.storage.Type.local);var t=e.get("jwt");this.getOwnerComponent().checkToken(t,"dashboard")},onLoginPressed(){let e=this.getView().byId("username").valueOf().getValue();let t=this.getView().byId("password").valueOf().getValue();let s=this.getView().byId("loginError");let a=this.getOwnerComponent().getRouter();var n,r;this.oHistory=o.getInstance();var i=jQuery.sap.storage(jQuery.sap.storage.Type.local);var r=i.get("prevHash");$.ajax({url:backendUrl+"login",type:"POST",data:JSON.stringify({email:e,password:t}),contentType:"application/json; charset=utf-8",dataType:"json",success:function(e){i.put("jwt",e.jwt);if(r!==undefined||r!==""){window.history.go(-1)}else{a.navTo("dashboard",{},true)}},statusCode:{401:function(e,t,o){s.show()},404:function(e,t,o){s.show()}}})}})});