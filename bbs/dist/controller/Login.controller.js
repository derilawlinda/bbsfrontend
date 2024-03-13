sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/webc/main/Toast","sap/ui/core/routing/History"],function(e,t,s){"use strict";return e.extend("frontend.bbs.controller.Login",{onInit(){var e=jQuery.sap.storage(jQuery.sap.storage.Type.local);var t=e.get("jwt");this.getOwnerComponent().checkToken(t,"dashboard");this.domain=window.location.hostname;var s=this.domain.split(".")[0];console.log(s);if(s=="ess-kkb"||s=="ess-bbs"){this.getView().byId("Company").setEnabled(false);if(s=="ess-kkb"){this.getView().byId("Company").setSelectedKey("KKB")}else if(s=="ess-bbs"){this.getView().byId("Company").setSelectedKey("BBS_LIVE")}}},onLoginPressed(){var e=jQuery.sap.storage(jQuery.sap.storage.Type.local);let t=this.getView().byId("Company").getSelectedKey();e.put("company",t);let o=this.getView().byId("username").valueOf().getValue();let a=this.getView().byId("password").valueOf().getValue();let n=this.getView().byId("loginError");let i=this.getOwnerComponent().getRouter();var r,l;this.oHistory=s.getInstance();var l=e.get("prevHash");console.log(l);$.ajax({url:backendUrl+"login",type:"POST",data:JSON.stringify({email:o,password:a}),contentType:"application/json; charset=utf-8",dataType:"json",success:function(t){e.put("jwt",t.jwt);if(l!==null){window.history.go(-1)}else{i.navTo("dashboard",{},true)}},statusCode:{401:function(e,t,s){n.show()},404:function(e,t,s){n.show()}}})}})});