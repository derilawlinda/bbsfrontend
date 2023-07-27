sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/Fragment","sap/ui/layout/HorizontalLayout","sap/ui/layout/VerticalLayout","sap/m/Dialog","sap/m/Button","sap/m/Label","sap/m/library","sap/m/MessageToast","sap/m/Text","sap/m/TextArea","sap/ui/model/json/JSONModel","frontend/bbs/libs/lodash"],function(e,t,a,r,o,s,i,n,l,u,d,g,c){"use strict";var m=l.ButtonType;var h=l.DialogType;return e.extend("frontend.bbs.controller.materialRequest.List",{onInit:async function(){this.getView().byId("materialRequestTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");var a=new c;a.loadData(backendUrl+"materialRequest/getMaterialRequests",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(a,"materialRequest");a.dataLoaded().then(function(){this.getView().byId("materialRequestTableID").setBusy(false)}.bind(this));var r=new c(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));this.getView().setModel(r,"salesOrder");var o=new c(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));this.getView().setModel(o,"companies");var s=new c(sap.ui.require.toUrl("frontend/bbs/model/items.json"));this.getView().setModel(s,"items");var i=new sap.ui.model.json.JSONModel;var n=new sap.ui.model.json.JSONModel({showCreateButton:true});this.getView().setModel(n,"viewModel");this.getView().setModel(i,"materialRequestHeader");var l=new sap.ui.model.json.JSONModel({U_RemainingBudget:0});this.getView().setModel(l,"budgetHeader");var u=new c;u.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(u,"budgeting");var d=new sap.ui.model.json.JSONModel;this.getView().setModel(d,"new_mr_items");this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection",[]);var g=this.getOwnerComponent().getModel("userModel");if(g===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var m=g.getData();var h={userName:m.user.name,roleId:m.user.role_id,roleName:m.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",h)}},toggleCreateButton:function(e,t,a){console.log(a);if(a.roleId==4||a.roleId==5){this.getView().getModel("viewModel").setProperty("/showCreateButton",false)}},onCreateButtonClick:function(e){if(!this.createMaterialRequestDialog){this.createMaterialRequestDialog=this.loadFragment({name:"frontend.bbs.view.materialRequest.CreateForm"})}this.createMaterialRequestDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});this.getView().setModel(t,"createFragmentViewModel");this.oDialog=e;this.oDialog.open();var a=new sap.ui.model.json.JSONModel;var r=[];a.setData(r);this.getView().setModel(a,"materialRequestgDetailModel");this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection",[])}.bind(this))},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(e){var a,r;a=t.getInstance();r=a.getPreviousHash();if(r!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},_closeDialog:function(){this.oDialog.close()},onPress:function(e){var t=this.getOwnerComponent().getRouter();var a=e.getSource();var r=a.getCells()[0].getText();t.navTo("materialRequestDetail",{materialRequestID:r})},buttonFormatter:function(e){if(e==2){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},onBudgetChange:async function(e){this.getView().byId("createMRForm").setBusy(true);var t=parseInt(e.getParameters("selectedItem").value);var a=new c;await a.loadData(backendUrl+"budget/getBudgetById?code="+t,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var r=a.getData();var o=r.U_TotalAmount;var s=r.BUDGETUSEDCollection;let i=0;for(let e=0;e<s.length;e++){i+=s[e]["U_Amount"]}r.U_RemainingBudget=o-i;var n=this.getView().getModel("budgetHeader");n.setData(r);this.getView().byId("createMRForm").setBusy(false)},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);const a=this.getView().getModel("materialRequestHeader");const r=this.getView().getModel("new_mr_items");var o=this.getView().getModel("materialRequest");a.setProperty("/METERIALREQLINESCollection",r.getData().MATERIALREQLINESCollection);var s=a.getProperty("/");var i=this.getView();var n=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(s),crossDomain:true,headers:{Authorization:"Bearer "+n},url:backendUrl+"materialRequest/createMaterialRequest",contentType:"application/json",success:function(e,a,r){t.setBusy(false);t.close();o.loadData(backendUrl+"materialRequest/getMaterialRequests",null,true,"GET",false,false,{Authorization:"Bearer "+n});u.show("Material Request created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});i.getModel("materialRequest").refresh()},error:function(e,t,a){console.log("Got an error response: "+t+a)}})},onAddPress:function(e){const t=this.getView().getModel("new_mr_items");var a=t.getData();var r={U_AccountCode:"",U_ItemCode:"",U_Qty:""};a.MATERIALREQLINESCollection.push(r);var o=new sap.ui.model.json.JSONModel(a);this.getView().setModel(o,"new_mr_items");o.refresh()},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var r=a.format(t);return r}})});