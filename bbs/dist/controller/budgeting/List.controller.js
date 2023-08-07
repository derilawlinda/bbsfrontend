sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/ui/model/odata/v4/ODataModel","sap/m/MessageToast","frontend/bbs/model/models"],function(e,t,i,a,s,n){"use strict";var o;var r;var l=[];return e.extend("frontend.bbs.controller.budgeting.List",{onInit:async function(){this.getView().byId("idBudgetTable").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");var a=new i;a.loadData(backendUrl+"getBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var s=new sap.ui.model.json.JSONModel({showCreateButton:true});this.getView().setModel(s,"viewModel");a.dataLoaded().then(function(){this.getView().byId("idBudgetTable").setBusy(false)}.bind(this));this.getView().setModel(a,"budgeting");var n=new i(sap.ui.require.toUrl("frontend/bbs/model/budgeting_accounts.json"));this.getView().setModel(n,"budgeting_accounts");var o=this.getOwnerComponent().getModel("userModel");if(o===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var r=o.getData();var l={userName:r.user.name,roleId:r.user.role_id,roleName:r.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",l)}},toggleCreateButton:function(e,t,i){if(i.roleId==4||i.roleId==5){this.getView().getModel("viewModel").setProperty("/showCreateButton",false)}},search:function(e,t){if(t!=o){l=[]}if(!Array.isArray(e))return l;var i=this;e.forEach(function(e){if(e.subheader===t){const i=e.nodes&&Array.isArray(e.nodes)?e.nodes.filter(e=>e.value===t):[];l.push(e)}else{i.search(e.nodes,t)}o=t});return l},onCreateButtonClick:function(e){if(!this.createBudgetingDialog){this.createBudgetingDialog=this.loadFragment({name:"frontend.bbs.view.budgeting.CreateForm"})}this.createBudgetingDialog.then(function(e){this.getView().byId("CreatePillar").setSelectedKey("");this.getView().byId("CreateClassification").setSelectedKey("");this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreatePillar").setEnabled(false);this.getView().byId("CreateClassification").setEnabled(false);this.getView().byId("CreateSubClassification").setEnabled(false);this.getView().byId("CreateSubClassification2").setEnabled(false);this.oDialog=e;this.oDialog.open();var t=new sap.ui.model.json.JSONModel({Date:new Date});this.getView().setModel(t,"createFragmentViewModel");var i=new sap.ui.model.json.JSONModel({U_TotalAmount:0});this.getView().setModel(i,"budgetingDetailModel");var a=new sap.ui.model.json.JSONModel;this.getView().setModel(a,"new_budgeting_accounts");this.getView().getModel("new_budgeting_accounts").setProperty("/BUDGETREQLINESCollection",[])}.bind(this))},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);const i=this.getView().getModel("budgetingDetailModel");const a=this.getView().getModel("new_budgeting_accounts");var n=this.getView().getModel("budgeting");i.setProperty("/BUDGETREQLINESCollection",a.getData().BUDGETREQLINESCollection);var o=i.getProperty("/");var r=this.getView();var l=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(o),crossDomain:true,headers:{Authorization:"Bearer "+l},url:backendUrl+"budget/createBudget",contentType:"application/json",success:function(e,i,a){t.setBusy(false);t.close();s.show("Budget created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});n.loadData(backendUrl+"getBudget",null,true,"GET",false,false,{Authorization:"Bearer "+l});r.getModel("budgeting").refresh()},error:function(e,t,i){console.log("Got an error response: "+t+i)}})},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},_closeDialog:function(){this.oDialog.close()},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},objectFormatter:function(e){if(e==2||e==3){return"Success"}else if(e==1){return"Warning"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var i=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var a=i.format(t);return a},onNavBack:function(e){var i,a;i=t.getInstance();a=i.getPreviousHash();if(a!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var i=e.getSource();var a=i.getCells()[0].getText();t.navTo("budgetingDetail",{budgetID:a})},onAddPress:function(e){const t=this.getView().getModel("new_budgeting_accounts");var i=t.getData();var a={U_AccountCode:"",U_Amount:""};i.BUDGETREQLINESCollection.push(a);var s=new sap.ui.model.json.JSONModel(i);this.getView().setModel(s,"new_budgeting_accounts");s.refresh()},onAmountChange:function(e){const t=this.getView().getModel("new_budgeting_accounts");var i=t.getData().BUDGETREQLINESCollection;let a=0;for(let e=0;e<i.length;e++){a+=i[e]["U_Amount"]}const s=this.getView().getModel("budgetingDetailModel");s.setProperty("/U_TotalAmount",a)},onCompanyChange:function(e){this.getView().byId("CreatePillar").setSelectedKey("");this.getView().byId("CreateClassification").setSelectedKey("");this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreateClassification").setEnabled(false);this.getView().byId("CreateSubClassification").setEnabled(false);this.getView().byId("CreateSubClassification2").setEnabled(false);var t=e.oSource.getSelectedItem().getBindingContext("companies").getPath();this.companyPath=t;var i=this.getView().byId("CreatePillar");i.setEnabled(true);i.bindAggregation("items",{path:"companies>"+t+"/nodes",template:new sap.ui.core.Item({key:"{companies>text}",text:"{companies>text}"})})},onPillarChange:function(e){this.getView().byId("CreateClassification").setSelectedKey("");this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreateSubClassification").setEnabled(false);this.getView().byId("CreateSubClassification2").setEnabled(false);var t=e.oSource.getSelectedItem().getBindingContext("companies").getPath();var i=this.getView().byId("CreateClassification");i.setEnabled(true);i.bindAggregation("items",{path:"companies>"+t+"/nodes",template:new sap.ui.core.Item({key:"{companies>text}",text:"{companies>text}"})})},onClassificationChange:function(e){this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreateSubClassification2").setEnabled(false);var t=e.oSource.getSelectedItem().getBindingContext("companies").getPath();var i=this.getView().byId("CreateSubClassification");i.setEnabled(true);i.bindAggregation("items",{path:"companies>"+t+"/nodes",template:new sap.ui.core.Item({key:"{companies>text}",text:"{companies>text}"})})},onSubClassificationChange:function(e){this.getView().byId("CreateSubClassification2").setSelectedKey("");var t=e.oSource.getSelectedItem().getBindingContext("companies").getPath();var i=this.getView().byId("CreateSubClassification2");i.setEnabled(true);i.bindAggregation("items",{path:"companies>"+t+"/nodes",template:new sap.ui.core.Item({key:"{companies>text}",text:"{companies>text}"})})},onDelete:function(e){var t=e.getParameters().row;var i=t.getIndex();var a=this.getView().getModel("new_budgeting_accounts");var s=a.getData().BUDGETREQLINESCollection;s.splice(i,1);a.setProperty("/BUDGETREQLINESCollection",s);a.refresh();this.onAmountChange()}})});