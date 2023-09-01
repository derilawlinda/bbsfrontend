sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library"],function(e,t,s,r,o,i,a,n){"use strict";var u=i.ButtonType;var l=i.DialogType;var c=n.ValueState;return e.extend("frontend.bbs.controller.reimbursement.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("reimbursementDetail").attachPatternMatched(this._onObjectMatched,this);var t=new s(sap.ui.require.toUrl("frontend/bbs/model/items.json"));this.getView().setModel(t,"items")},_onObjectMatched:async function(e){var t=new sap.ui.model.json.JSONModel({showFooter:false,editable:false,resubmit:false,is_approver:false,is_finance:false,NPWP:[{Name:0},{Name:2.5},{Name:3}]});this.getView().setModel(t,"viewModel");this.getView().byId("reimbursementPageID").setBusy(true);var r=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=r.get("jwt");this.company=r.get("company");var o=new s;await o.loadData(backendUrl+"checkToken",null,true,"POST",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().bindElement({path:"/value/"+window.decodeURIComponent(e.getParameter("arguments").ID),model:"reimbursements"});var i=e.getParameter("arguments").ID;if(i===undefined){var a=window.location.href;var n=a.split("/");i=n[n.length-1]}const u=new s;this.getView().setModel(u,"reimbursementDetailModel");u.loadData(backendUrl+"reimbursement/getReimbursementById",{code:i,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});u.refresh();var l=new s;l.loadData(backendUrl+"budget/getApprovedBudget",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(l,"budgeting");u.dataLoaded().then(function(){var e=o.getData();var r=this.getView().getModel("reimbursementDetailModel").getData();if(e.user.role_id==4){t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(r.U_Status==2){t.setProperty("/showFooter",true)}}else if(e.user.role_id==5){t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(r.U_Status==1){t.setProperty("/showFooter",true)}}else if(e.user.role_id==3){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",true);t.setProperty("/resubmit",false);if(r.U_Status==4){t.setProperty("/resubmit",true)}if(r.U_Status==4||r.U_Status==1){t.setProperty("/showFooter",true);t.setProperty("/editable",true)}}else if(e.user.role_id==2){t.setProperty("/is_finance",true);t.setProperty("/is_approver",false);t.setProperty("/is_requestor",false);if(r.U_Status==3){t.setProperty("/showFooter",true)}}var i=new s;i.loadData(backendUrl+"coa/getCOAsByBudget",{budgetCode:r.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(i,"accounts");const a=new s;a.loadData(backendUrl+"budget/getBudgetById?",{code:r.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(a,"budget");a.dataLoaded().then(function(){var e=a.getData();var t=e.U_TotalAmount;var s=e.BUDGETUSEDCollection;let r=0;for(let e=0;e<s.length;e++){r+=s[e]["U_Amount"]}e.U_RemainingBudget=t-r;var o=this.getView().getModel("budget");o.setData(e);this.getView().byId("reimbursementPageID").setBusy(false)}.bind(this));i.dataLoaded().then(function(){}.bind(this))}.bind(this))},onTransferConfirm:function(){const e=this.getView().getModel("reimbursementDetailModel");var t=this.oJWT;var s=this.getView().byId("DatePicker").getValue();e.setProperty("/DisbursedDate",s);var r=e.getData().Code;var o=this.getView().byId("reimbursementPageID");var i=this.getView().byId("transferDialog");var a=e.getProperty("/");i.close();o.setBusy(true);$.ajax({type:"POST",data:JSON.stringify({oProperty:a,company:this.company}),headers:{Authorization:"Bearer "+t},crossDomain:true,url:backendUrl+"reimbursement/transferReimbursement",contentType:"application/json",success:function(e,t,s){o.setBusy(false);MessageToast.show("Reimbursement Transfered");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"})},error:function(e,t,s){o.setBusy(false);console.log("Got an error response: "+t+s)}})},onApproveButtonClick:function(){var e=this.getView().byId("reimbursementPageID");var t=this.getView().getModel("viewModel");e.setBusy(true);const s=this.getView().getModel("reimbursementDetailModel");var i=s.getProperty("/");var n=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({oProperty:i,company:this.company}),headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"reimbursement/approveReimbursement",contentType:"application/json",success:function(s,i,n){e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new r({type:l.Message,title:"Success",state:c.Success,content:new a({text:"Reimbursement approved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});t.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onSaveButtonClick:function(e){var t=this.getView().byId("reimbursementPageID");t.setBusy(true);var s=this.getView().getModel("reimbursementDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"reimbursement/saveReimbursement",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new r({type:l.Message,title:"Success",state:c.Success,content:new a({text:"Reimbursement saved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var r=this.getOwnerComponent().getRouter();r.navTo("dashboard",{},true)}},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var r=this.getView().getModel("reimbursementDetailModel");var o=r.getData().REIMBURSEMENTLINESCollection;o.splice(s,1);r.setProperty("/REIMBURSEMENTLINESCollection",o);r.refresh();this.onAmountChange()},onAddPress:function(e){const t=this.getView().getModel("reimbursementDetailModel");var s=t.getData();var r={U_AccountCode:"",U_ItemCode:"",U_NPWP:"",U_Amount:0,U_Description:""};s.REIMBURSEMENTLINESCollection.push(r);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"reimbursementDetailModel");o.refresh()},onAmountChange:function(e){const t=this.getView().getModel("reimbursementDetailModel");var s=t.getData().REIMBURSEMENTLINESCollection;const r=this.getView().getModel("viewModel");var o=this.getView().getModel("budget").getData();let i=0;for(let e=0;e<s.length;e++){i+=Number(s[e]["U_Amount"])}const a=this.getView().getModel("reimbursementDetailModel");a.setProperty("/U_TotalAmount",i);var n=o.U_RemainingBudget;if(i>n){this.getView().byId("submitButton").setEnabled(false);r.setProperty("/amountExceeded","Advance Amount exceeded Budget!")}else{this.getView().byId("submitButton").setEnabled(true);r.setProperty("/amountExceeded","")}},onResubmitButtonClick:function(e){var t=this.getView().byId("reimbursementPageID");t.setBusy(true);var s=this.getView().getModel("reimbursementDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;var d=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"reimbursement/resubmitReimbursement",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new r({type:l.Message,title:"Success",state:c.Success,content:new a({text:"Reimbursement resubmitted"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){d.setProperty("/resubmit",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onRejectButtonClick:function(e){if(!this.rejectReimbursementDialog){this.rejectReimbursementDialog=this.loadFragment({name:"frontend.bbs.view.reimbursement.RejectForm"})}this.rejectReimbursementDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},onConfirmRejectClick:function(){var e=this.getView().byId("reimbursementPageID");var t=this.getView().getModel("reimbursementDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var n=this.getView().byId("RejectionRemarksID").getValue();var d=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:n,company:this.company},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"reimbursement/rejectReimbursement",success:function(t,i,n){s.close();e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new r({type:l.Message,title:"Success",state:c.Success,content:new a({text:"Reimbursement rejected"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){d.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onTransferButtonClick:function(){if(!this.transferAdvanceRequestDialog){this.transferAdvanceRequestDialog=this.loadFragment({name:"frontend.bbs.view.reimbursement.Transfer"})}this.transferAdvanceRequestDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else if(e==5){return"Information"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else if(e==5){return"Transferred"}else{return"Rejected"}}})});