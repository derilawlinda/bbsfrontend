sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library","sap/m/MessageToast"],function(e,t,a,s,o,r,i,n,l){"use strict";var u=r.ButtonType;var d=r.DialogType;var c=n.ValueState;return e.extend("frontend.bbs.controller.advanceRealization.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("advanceRealizationDetail").attachPatternMatched(this._onObjectMatched,this);var t=new a;this.getView().setModel(t,"items")},_onObjectMatched:async function(e){var t=new a({showFooter:false,editable:true,resubmit:false,is_finance:false,showFooter:true});this.getView().setModel(t,"viewModel");t.setData({NPWP:[{Name:0},{Name:2.5},{Name:3}]});this.getView().byId("advanceRequestPageId").setBusy(true);var s=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=s.get("jwt");var o=new a;await o.loadData(backendUrl+"checkToken",null,true,"POST",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().bindElement({path:"/value/"+window.decodeURIComponent(e.getParameter("arguments").ID),model:"advanceRequest"});var r=e.getParameter("arguments").ID;if(r===undefined){var i=window.location.href;var n=i.split("/");r=n[n.length-1]}const l=new a;l.loadData(backendUrl+"advanceRequest/getAdvanceRequestById?code="+r,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(l,"advanceRequestDetailModel");l.dataLoaded().then(function(){var e=o.getData();var s=this.getView().getModel("advanceRequestDetailModel").getData();var r=this.oJWT;console.log(s.U_RealiStatus);if(e.user.role_id==4){t.setProperty("/editable",false);t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(materialIssueDetailData.U_Status==2){t.setProperty("/showFooter",true)}}else if(e.user.role_id==5){t.setProperty("/editable",false);t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(materialIssueDetailData.U_Status==1){t.setProperty("/showFooter",true)}}else if(e.user.role_id==3){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",true);t.setProperty("/resubmit",false);if(materialIssueDetailData.U_Status==4){t.setProperty("/resubmit",true)}if(materialIssueDetailData.U_Status==4||materialIssueDetailData.U_Status==1){t.setProperty("/showFooter",true);t.setProperty("/editable",true)}}else if(e.user.role_id==2){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",false);t.setProperty("/is_finance",true);t.setProperty("/editable",false);if(s.U_RealiStatus==4){t.setProperty("/showFooter",true)}}var i=new a;i.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+s.U_BudgetCode,null,true,"GET",false,false,{Authorization:"Bearer "+r});this.getView().setModel(i,"accounts");i.dataLoaded().then(function(){var e=this.getView().getModel("items");this.getView().getModel("items").setProperty("/data",[]);var t=e.getData();var s=i.getData();s.value.map(function(e){var s=new a;s.loadData(backendUrl+"items/getItemsByAccount?accountCode='"+e.Code+"'",null,true,"GET",false,false,{Authorization:"Bearer "+r});s.dataLoaded().then(function(){var a=s.getData();t.data[e.Code]=a}.bind(this))}.bind(this));var o=new sap.ui.model.json.JSONModel(t);this.getView().setModel(o,"items");o.refresh()}.bind(this));this.getView().byId("advanceRequestPageId").setBusy(false)}.bind(this))},onSaveButtonClick:function(e){this.getView().byId("advanceRequestPageId").setBusy(true);const t=this.getView().getModel("advanceRequestDetailModel");var a=t.getProperty("/");var s=this.getView();var o=this.oJWT;var r=this.getView().byId("advanceRequestPageId");$.ajax({type:"POST",data:JSON.stringify(a),crossDomain:true,headers:{Authorization:"Bearer "+o},url:backendUrl+"advanceRequest/submitAdvanceRealization",contentType:"application/json",success:function(e,t,a){r.setBusy(false);l.show("Advance Realization Submitted");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});s.getModel("materialRequest").refresh()},error:function(e,t,a){r.setBusy(false);console.log("Got an error response: "+t+a)}})},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var s=e.getSource().getParent();s.getCells()[1].setBusy(true);s.getCells()[1].setSelectedKey("");s.getCells()[1].setEnabled(true);s.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var r=o.getData();if(!(t.toString()in r)){var i=new a;await i.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=i.getData();r[t]=n;var l=new sap.ui.model.json.JSONModel(r);this.getView().setModel(l,"items");l.refresh()}s.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});s.getCells()[1].setBusy(false)},onAmountChange:function(e){const t=this.getView().getModel("advanceRequestDetailModel");var a=t.getData().ADVANCEREQLINESCollection;console.log(a);let s=0;for(let e=0;e<a.length;e++){s+=a[e]["U_Amount"]}console.log(s);const o=this.getView().getModel("advanceRequestDetailModel");o.setProperty("/U_Amount",s)},onBudgetChange:async function(e){this.getView().byId("createARForm").setBusy(true);var t=parseInt(e.getParameters("selectedItem").value);var s=new a;await s.loadData(backendUrl+"budget/getBudgetById?code="+t,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var o=s.getData();var r=o.U_TotalAmount;var i=o.BUDGETUSEDCollection;let n=0;for(let e=0;e<i.length;e++){n+=i[e]["U_Amount"]}o.U_RemainingBudget=r-n;var l=this.getView().getModel("budget");l.setData(o);this.getView().byId("createARForm").setBusy(false)},onApproveButtonClick:function(){var e=this.getView().byId("advanceRequestPageId");var t=this.getView().getModel("viewModel");var a=this.getView().byId("_IDGenText101").getText();const r=this.getView().getModel("advanceRequestDetailModel");var n=this.getView().getModel("budget").getData();r.setProperty("/budgeting",n);var l=r.getProperty("/");var g=this.getView();var h=this.oDialog;var v=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(l),headers:{Authorization:"Bearer "+v},crossDomain:true,url:backendUrl+"advanceRequest/approveAdvanceRealization",contentType:"application/json",success:function(e,t,a){if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new s({type:d.Message,title:"Success",state:c.Success,content:new i({text:"Realization approved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,a){console.log("Got an error response: "+t+a)}})},onAddPress:function(e){const t=this.getView().getModel("advanceRequestDetailModel");var a=t.getData();var s={U_AccountCode:"",U_ItemCode:"",U_NPWP:"",U_Amount:0,U_Description:""};a.REALIZATIONREQLINESCollection.push(s);var o=new sap.ui.model.json.JSONModel(a);this.getView().setModel(o,"advanceRequestDetailModel");o.refresh()},onNavBack:function(){var e=t.getInstance();var a=e.getPreviousHash();if(a!==undefined){window.history.go(-1)}else{var s=this.getOwnerComponent().getRouter();s.navTo("dashboard",{},true)}}})});