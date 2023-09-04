sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/m/library","frontend/bbs/model/PagingJSONModel","sap/m/MessageToast","sap/ui/core/library","sap/ui/core/Fragment","sap/ui/Device","frontend/bbs/libs/lodash"],function(e,t,a,s,r,i,o,n){"use strict";var l=a.ButtonType;var u=a.DialogType;var g=i.ValueState;return e.extend("frontend.bbs.controller.materialIssue.Index",{onInit:async function(){this.getView().byId("materialIssueTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");this.company=t.get("company");this._mViewSettingsDialogs={};var a=new s;a.loadData(backendUrl+"materialIssue/getMaterialIssues",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(a,"materialIssue");a.dataLoaded().then(function(){this.getView().byId("materialIssueTableID").setBusy(false)}.bind(this));var r=new s;this.getView().setModel(r,"items");var i=new sap.ui.model.json.JSONModel({showCreateButton:true,is_approver:false});this.getView().setModel(i,"viewModel");var o=new sap.ui.model.json.JSONModel({U_RemainingBudget:0});this.getView().setModel(o,"budgetHeader");var n=new s;n.setSizeLimit(500);n.loadData(backendUrl+"budget/getApprovedBudget",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(n,"budgeting");var l=new sap.ui.model.json.JSONModel;this.getView().setModel(l,"new_mi_items");this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[]);var u=this.getOwnerComponent().getModel("userModel");if(u===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var g=u.getData();var d={userName:g.user.name,roleId:g.user.role_id,roleName:g.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",d)}},toggleCreateButton:function(e,t,a){if(a.roleId==4||a.roleId==5){this.getView().getModel("viewModel").setProperty("/showCreateButton",false);this.getView().getModel("viewModel").setProperty("/is_approver",true)}},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},buttonFormatter:function(e){if(e=="Issued"){return"Accept"}else{return"Attention"}},objectFormatter:function(e){if(e==2||e==3){return"Success"}else if(e==1){return"Warning"}else{return"Error"}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var a=e.getSource();var s=a.getCells()[0].getText();t.navTo("materialIssueDetail",{ID:s})},onNavBack:function(e){var a,s;a=t.getInstance();s=a.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},onBudgetChange:async function(e){this.getView().getModel("budgetHeader").setProperty("/",[]);this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[]);var t=e.getSource(),a=t.getSelectedKey(),r=t.getValue();if(!a&&r){t.setValueState(g.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(g.None)}if(t.getValueState()==g.None){this.getView().byId("createMIForm").setBusy(true);this.getView().byId("MIItemsTableID").setBusy(true);var i=parseInt(e.getParameters("selectedItem").value);var o=new s;await o.loadData(backendUrl+"budget/getBudgetById",{code:i,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=new s;await n.loadData(backendUrl+"coa/getCOAsByBudgetForMI",{budgetCode:i,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(n,"accounts");var l=o.getData();var u=l.U_TotalAmount;var d=l.BUDGETUSEDCollection;let t=0;for(let e=0;e<d.length;e++){t+=d[e]["U_Amount"]}l.U_RemainingBudget=u-t;var c=this.getView().getModel("budgetHeader");c.setData(l);this.getView().byId("createMIForm").setBusy(false);this.getView().byId("MIItemsTableID").setBusy(false)}},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var r=this.getView().getModel("items");var i=r.getData();if(!(t in i)){var o=new s;await o.loadData(backendUrl+"items/getItemsByAccount",{accountCode:t,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=o.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},onCreateButtonClick:function(e){if(!this.createMaterialIssueDialog){this.createMaterialIssueDialog=this.loadFragment({name:"frontend.bbs.view.materialIssue.CreateForm"})}this.createMaterialIssueDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});var a=new sap.ui.model.json.JSONModel;this.getView().setModel(a,"materialIssueHeader");this.getView().setModel(t,"createFragmentViewModel");this.oDialog=e;this.oDialog.open();var s=new sap.ui.model.json.JSONModel;var r=this.getView().getModel("budgetHeader");var i=[];s.setData(i);r.setData(i);this.getView().setModel(s,"materialIssueDetailModel");this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[])}.bind(this))},_closeDialog:function(){this.oDialog.close()},onAddPress:function(e){const t=this.getView().getModel("new_mi_items");var a=t.getData();var s={U_AccountCode:"",U_ItemCode:"",U_Qty:"",U_Description:""};a.MATERIALISSUELINESCollection.push(s);var r=new sap.ui.model.json.JSONModel(a);this.getView().setModel(r,"new_mi_items");r.refresh()},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);const a=this.getView().getModel("materialIssueHeader");const s=this.getView().getModel("new_mi_items");var i=this.getView().getModel("materialIssue");a.setProperty("/MATERIALISSUELINESCollection",s.getData().MATERIALISSUELINESCollection);var o=a.getProperty("/");var n=this.getView();var l=this.oJWT;var u=this.company;$.ajax({type:"POST",data:JSON.stringify({company:this.company,oProperty:o}),crossDomain:true,headers:{Authorization:"Bearer "+l},url:backendUrl+"materialIssue/createMaterialIssue",contentType:"application/json",success:function(e,a,s){t.setBusy(false);t.close();i.loadData(backendUrl+"materialIssue/getMaterialIssues",{company:u},true,"GET",false,false,{Authorization:"Bearer "+l});r.show("Material Issue created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});n.getModel("materialIssue").refresh()},error:function(e,t,a){console.log("Got an error response: "+t+a)}})},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var s=a.format(t);return s},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},onDelete:function(e){var t=e.getParameters().row;var a=t.getIndex();var s=this.getView().getModel("new_mi_items");var r=s.getData().MATERIALISSUELINESCollection;r.splice(a,1);s.setProperty("/MATERIALISSUELINESCollection",r);s.refresh()},handleFilterButtonPressed:function(){this.getViewSettingsDialog("frontend.bbs.view.materialIssue.FilterForm").then(function(e){e.open()})},getViewSettingsDialog:function(e){var t=this._mViewSettingsDialogs[e];if(!t){t=o.load({id:this.getView().getId(),name:e,controller:this}).then(function(e){if(n.system.desktop){e.addStyleClass("sapUiSizeCompact")}return e});this._mViewSettingsDialogs[e]=t}return t},onSearch:function(e){var t=e.getParameters();if(t.filterKeys){var a=Object.keys(t.filterKeys).toString()}else{var a=""}this.getView().byId("materialIssueTableID").setBusy(true);var r=this.getView().byId("searchField").getValue();var i=this.oJWT;var o=new s;o.loadData(backendUrl+"materialIssue/getMaterialIssues",{search:r,status:a,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+i});o.dataLoaded().then(function(){this.getView().byId("materialIssueTableID").setBusy(false)}.bind(this));this.getView().setModel(o,"materialIssue")}})});