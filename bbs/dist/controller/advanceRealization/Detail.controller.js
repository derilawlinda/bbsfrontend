sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library","sap/m/MessageToast"],function(e,t,s,a,o,i,r,n,l){"use strict";var u=i.ButtonType;var c=i.DialogType;var d=n.ValueState;return e.extend("frontend.bbs.controller.advanceRealization.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("advanceRealizationDetail").attachPatternMatched(this._onObjectMatched,this);var t=new s;this.getView().setModel(t,"items")},_onObjectMatched:async function(e){var t=new s({showFooter:false,editable:true,resubmit:false,is_finance:false,is_save:false,is_approver:false,is_submit:false,NPWP:[{Name:0},{Name:2.5},{Name:3}]});this.getView().setModel(t,"viewModel");this.getView().byId("advanceRequestPageId").setBusy(true);var a=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=a.get("jwt");var o=new s;await o.loadData(backendUrl+"checkToken",null,true,"POST",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().bindElement({path:"/value/"+window.decodeURIComponent(e.getParameter("arguments").ID),model:"advanceRequest"});var i=e.getParameter("arguments").ID;if(i===undefined){var r=window.location.href;var n=r.split("/");i=n[n.length-1]}const l=new s;l.loadData(backendUrl+"advanceRequest/getAdvanceRequestById?code="+i,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(l,"advanceRequestDetailModel");var u=this.getView().byId("advanceRealLineTableID");l.dataLoaded().then(function(){var e=o.getData();var a=this.getView().getModel("advanceRequestDetailModel").getData();var i=this.oJWT;this.onAmountChange();if(e.user.role_id==4){t.setProperty("/editable",false);t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(a.U_RealiStatus==3){t.setProperty("/showFooter",true)}}else if(e.user.role_id==5){t.setProperty("/editable",false);t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(a.U_RealiStatus==2){t.setProperty("/showFooter",true)}}else if(e.user.role_id==3){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",true);t.setProperty("/resubmit",false);if(a.U_RealiStatus==1){t.setProperty("/is_save",false);t.setProperty("/is_submit",true)}if(a.U_RealiStatus==2){t.setProperty("/is_save",true);t.setProperty("/is_submit",false)}if(a.U_RealiStatus==5||a.U_RealiStatus==2){t.setProperty("/showFooter",true);t.setProperty("/editable",true)}if(a.U_RealiStatus==5){t.setProperty("/is_save",true);t.setProperty("/resubmit",true)}}else if(e.user.role_id==2){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",false);t.setProperty("/is_finance",true);t.setProperty("/editable",false);if(a.U_RealiStatus==4){t.setProperty("/showFooter",true)}}var r=new s;r.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+a.U_BudgetCode,null,true,"GET",false,false,{Authorization:"Bearer "+i});this.getView().setModel(r,"accounts");r.dataLoaded().then(function(){var e=this.getView().getModel("items");e.setProperty("/data/",[]);e.refresh();var t=new s;var o=a.REALIZATIONREQLINESCollection;for(let s=0;s<o.length;s++){u.getRows()[s].getCells()[1].setBusy(true);var r=e.getData();let a=o[s].U_AccountCode.toString();if(!(o[s].U_AccountCode in r)){t.loadData(backendUrl+"items/getItemsByAccount?accountCode="+a,null,true,"GET",false,false,{Authorization:"Bearer "+i});t.dataLoaded().then(function(){var e=t.getData();var o=this.getView().getModel("items");o.setProperty("/data/"+a,e);o.refresh();u.getRows()[s].getCells()[1].bindAggregation("items",{path:"items>/data/"+a,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});u.getRows()[s].getCells()[1].setBusy(false)}.bind(this))}else{u.getRows()[s].getCells()[1].bindAggregation("items",{path:"items>/data/"+a,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});u.getRows()[s].getCells()[1].setBusy(false)}}}.bind(this));this.getView().byId("advanceRequestPageId").setBusy(false)}.bind(this))},onSubmitButtonClick:function(e){this.getView().byId("advanceRequestPageId").setBusy(true);const t=this.getView().getModel("advanceRequestDetailModel");var s=t.getProperty("/");var a=this.getView();var o=this.oJWT;var i=this.getView().byId("advanceRequestPageId");$.ajax({type:"POST",data:JSON.stringify(s),crossDomain:true,headers:{Authorization:"Bearer "+o},url:backendUrl+"advanceRequest/submitAdvanceRealization",contentType:"application/json",success:function(e,t,s){i.setBusy(false);l.show("Advance Realization Submitted");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});a.getModel("materialRequest").refresh()},error:function(e,t,s){i.setBusy(false);console.log("Got an error response: "+t+s)}})},onRejectButtonClick:function(e){if(!this.rejectAdvanceRealizationDialog){this.rejectAdvanceRealizationDialog=this.loadFragment({name:"frontend.bbs.view.advanceRealization.RejectForm"})}this.rejectAdvanceRealizationDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("advanceRequestPageId");var t=this.getView().getModel("advanceRequestDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var n=this.getView().byId("RejectionRemarksID").getValue();var l=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:n},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"advanceRequest/rejectAdvanceRealization",success:function(t,i,n){s.close();e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:d.Success,content:new r({text:"Advance Realization rejected"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){l.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onResubmitButtonClick:function(e){var t=this.getView().byId("advanceRequestPageId");t.setBusy(true);var s=this.getView().getModel("advanceRequestDetailModel");var i=JSON.stringify(s.getData());var n=this.oJWT;var l=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"advanceRequest/resubmitRealization",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:d.Success,content:new r({text:"Advance Realization resubmitted"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){l.setProperty("/showFooter",false);l.setProperty("/editable",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var i=o.getData();if(!(t.toString()in i)){var r=new s;await r.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=r.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},onAmountChange:function(e){const t=this.getView().getModel("advanceRequestDetailModel");const s=t.getData();const a=s.U_Amount;var o=t.getData().REALIZATIONREQLINESCollection;var i=this.getView().getModel("viewModel");let r=0;if(o.length>0){for(let e=0;e<o.length;e++){r+=Number(o[e]["U_Amount"])}}const n=this.getView().getModel("advanceRequestDetailModel");n.setProperty("/U_RealizationAmt",r);if(r>a){this.getView().byId("realizationAmount").setState(d.Error);i.setProperty("/amountExceeded","Realization Amount exceeded Advance Amount");this.getView().byId("submitButton").setEnabled(false);this.getView().byId("saveButton").setEnabled(false)}else{this.getView().byId("realizationAmount").setState(d.None);i.setProperty("/amountExceeded","");this.getView().byId("submitButton").setEnabled(true);this.getView().byId("saveButton").setEnabled(true)}},onBudgetChange:async function(e){this.getView().byId("createARForm").setBusy(true);var t=parseInt(e.getParameters("selectedItem").value);var a=new s;await a.loadData(backendUrl+"budget/getBudgetById?code="+t,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var o=a.getData();var i=o.U_TotalAmount;var r=o.BUDGETUSEDCollection;let n=0;for(let e=0;e<r.length;e++){n+=r[e]["U_Amount"]}o.U_RemainingBudget=i-n;var l=this.getView().getModel("budget");l.setData(o);this.getView().byId("createARForm").setBusy(false)},onSaveButtonClick:function(e){var t=this.getView().byId("advanceRequestPageId");t.setBusy(true);var s=this.getView().getModel("advanceRequestDetailModel");var i=JSON.stringify(s.getData());var n=this.oJWT;$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"advanceRequest/saveAR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:d.Success,content:new r({text:"Advance Realization saved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onApproveButtonClick:function(){var e=this.getView().byId("advanceRequestPageId");var t=this.getView().getModel("viewModel");e.setBusy(true);var s=this.getView().byId("_IDGenText101").getText();const i=this.getView().getModel("advanceRequestDetailModel");var n=this.getView().getModel("budget").getData();i.setProperty("/budgeting",n);var l=i.getProperty("/");var g=this.getView();var h=this.oDialog;var v=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(l),headers:{Authorization:"Bearer "+v},crossDomain:true,url:backendUrl+"advanceRequest/approveAdvanceRealization",contentType:"application/json",success:function(s,i,n){e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:d.Success,content:new r({text:"Realization approved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});t.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onAddPress:function(e){const t=this.getView().getModel("advanceRequestDetailModel");var s=t.getData();var a={U_AccountCode:"",U_ItemCode:"",U_NPWP:"",U_Amount:0,U_Description:""};s.REALIZATIONREQLINESCollection.push(a);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"advanceRequestDetailModel");o.refresh()},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("advanceRequestDetailModel");var o=a.getData().REALIZATIONREQLINESCollection;o.splice(s,1);a.setProperty("/REALIZATIONREQLINESCollection",o);a.refresh();this.onAmountChange()},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}}})});