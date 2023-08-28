sap.ui.loader.config({map:{"*":{lodash:"bbs-frontend/extlib/d-forest"}},shim:{"bbs-frontend/extlib/d-forest":{amd:true,deps:[],exports:"_"}}});sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","frontend/bbs/model/models","sap/ui/model/json/JSONModel"],function(e,t,s,o){"use strict";return e.extend("frontend.bbs.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(s.createDeviceModel(),"device");window.backendUrl=this.getManifestEntry("/sap.app/dataSources/bbsbackend/uri");window.BUDGET_APPROVAL_STATUS={APPROVED_BY_MANAGER:2,APPROVED_BY_DIRECTOR:3};var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);var n=t.get("company");var a=t.get("jwt");var i=new o;this.setModel(i,"globalModel");this.router=this.getRouter()},getContentDensityClass:function(){if(!this._sContentDensityClass){if(!t.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass},checkToken:async function(e,t){var s=this.router;var n=this;$.ajaxSetup({headers:{Authorization:"Bearer "+e}});$.ajax({url:backendUrl+"checkToken",method:"POST",contentType:"application/json; charset=utf-8",dataType:"json",success:function(e){console.log(e);var t=new o({userName:e.user.name,roleId:e.user.role_id,roleName:e.role[0].name});n.setModel(t,"userModel")},error:function(e,t,o){if(e.status===401){s.navTo("Login",{},true)}}})}})});