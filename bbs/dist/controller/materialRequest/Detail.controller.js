sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library"],function(e,t,s,o,a,i,r,n){"use strict";var l=i.ButtonType;var u=i.DialogType;var c=n.ValueState;return e.extend("frontend.bbs.controller.materialRequest.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("materialRequestDetail").attachPatternMatched(this._onObjectMatched,this);const t=this.getOwnerComponent().getEventBus()},_onObjectMatched:function(e){const t=this.getOwnerComponent().getEventBus();var o=this.getOwnerComponent().getModel("globalModel").getData();console.log(o["MRpath"]);this.path="";if(o["MRpath"]!=null||o["MRpath"]!=""){this.path=o["MRpath"]}console.log(this.path);var a=new s({showFooter:false,editable:false,resubmit:false,is_finance:false});this.getView().setModel(a,"viewModel");var i=new s;i.setSizeLimit(999999);this.getView().setModel(i,"items");var r=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=r.get("jwt");this.company=r.get("company");var n=new s;this.getView().setModel(n,"accounts");this.materialRequestCode=e.getParameter("arguments").materialRequestID;var l=this.getOwnerComponent().getModel("userModel");if(l===undefined){t.subscribe("username","checktoken",this.buildForm,this)}else{var u=l.getData();var c={userName:u.user.name,roleId:u.user.role_id,roleName:u.role[0].name,status:"success"};this.buildForm("username","checkToken",c)}},buildForm:function(e,t,o){console.log(o);if(o.status=="error"){alert("Error");this.getView().byId("materialRequestPageID").setBusy(false)}var a=this.materialRequestCode;var i=this.getView().getModel("viewModel");if(this.materialRequestCode===undefined){var r=window.location.href;var n=r.split("/");this.materialRequestCode=n[n.length-1]}const l=new s;this.getView().setModel(l,"materialRequestDetailModel");l.loadData(backendUrl+"materialRequest/getMaterialRequestById",{code:this.materialRequestCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});l.dataLoaded().then(function(){var e=this.getView().getModel("materialRequestDetailModel").getData();var t=this.getView().byId("materialReqLineTableID");t.setVisibleRowCount(e.MATERIALREQLINESCollection.length);if(o.roleId==4){i.setProperty("/is_approver",true);i.setProperty("/is_requestor",false);if(e.U_Status==2){i.setProperty("/showFooter",true)}}else if(o.roleId==5){i.setProperty("/is_approver",true);i.setProperty("/is_requestor",false);if(e.U_Status==1){i.setProperty("/showFooter",true)}}else if(o.roleId==3){i.setProperty("/is_approver",false);i.setProperty("/is_requestor",true);i.setProperty("/resubmit",false);if(e.U_Status==4){i.setProperty("/resubmit",true)}if(e.U_Status==4||e.U_Status==1){i.setProperty("/showFooter",true);i.setProperty("/editable",true)}}else if(o.roleId==2){i.setProperty("/is_approver",false);i.setProperty("/is_requestor",false);i.setProperty("/showFooter",true);i.setProperty("/is_finance",true)}let a=new s;this.getView().setModel(a,"budget");a.loadData(backendUrl+"budget/getBudgetById?",{code:e.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var r=new s;r.loadData(backendUrl+"getBudget",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(r,"budgeting");var n=this.getView().getModel("accounts");n.loadData(backendUrl+"coa/getCOAsByBudget?",{budgetCode:e.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});n.refresh();var l=this.getView().getModel("items");l.setSizeLimit(999999);l.setProperty("/data",[]);var u=l.getData();var c=new s;c.setSizeLimit(999999);var g=[];if(e.MATERIALREQLINESCollection.length>0){for(let t=0;t<e.MATERIALREQLINESCollection.length;t++){if(e.MATERIALREQLINESCollection[t].U_AccountCode){if(!(e.MATERIALREQLINESCollection[t].U_AccountCode.toString()in g)){g.push(e.MATERIALREQLINESCollection[t].U_AccountCode)}}}var d=[...new Set(g)];for(let e=0;e<d.length;e++){c.loadData(backendUrl+"items/getItemsByAccount",{company:this.company,accountCode:d[e]},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});c.dataLoaded().then(function(){var t=c.getData();u.data[d[e]]=t;var s=new sap.ui.model.json.JSONModel(u);s.setSizeLimit(5e3);this.getView().setModel(s,"items");s.refresh()}.bind(this))}for(let s=0;s<e.MATERIALREQLINESCollection.length;s++){if(e.MATERIALREQLINESCollection[s].U_AccountCode){let o=e.MATERIALREQLINESCollection[s].U_AccountCode.toString();t.getRows()[s].getCells()[1].bindAggregation("items",{path:"items>/data/"+o,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})})}}}}.bind(this))},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var o=this.getOwnerComponent().getRouter();o.navTo("dashboard",{},true)}},onApproveButtonClick:function(){var e=this.getView().byId("materialRequestPageID");var t=this.getView().getModel("viewModel");e.setBusy(true);const s=this.getView().getModel("materialRequestDetailModel");const i=this.getOwnerComponent().getModel("materialRequest");var n=this.path;console.log(n);var g=s.getProperty("/");var d=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,oProperty:g}),headers:{Authorization:"Bearer "+d,Accept:"application/json; charset=utf-8"},crossDomain:true,url:backendUrl+"materialRequest/approveMR",contentType:"application/json",success:function(g,d,h){e.setBusy(false);console.log(g["U_Status"]);console.log(n+"/U_Status");i.setProperty(n+"/U_Status",g["U_Status"]);s.setData(g);s.refresh();if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new o({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request approved"}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});t.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(t,s,i){e.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new o({type:u.Message,title:"Error",state:c.Error,content:new r({text:t.responseJSON.msg}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onRejectButtonClick:function(e){if(!this.rejectMaterialRequestDialog){this.rejectMaterialRequestDialog=this.loadFragment({name:"frontend.bbs.view.materialRequest.RejectForm"})}this.rejectMaterialRequestDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("materialRequestPageID");var t=this.getView().getModel("materialRequestDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var n=this.getView().byId("RejectionRemarksID").getValue();var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:n,company:this.company},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"materialRequest/rejectMR",success:function(t,i,n){e.setBusy(false);s.close();if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new o({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request rejected"}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(t,s,i){e.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new o({type:u.Message,title:"Error",state:c.Error,content:new r({text:t.responseJSON.msg}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onAddPress:function(e){const t=this.getView().getModel("materialRequestDetailModel");var s=t.getData();var o={U_AccountCode:"",U_ItemCode:"",U_Qty:""};s.MATERIALREQLINESCollection.push(o);var a=new sap.ui.model.json.JSONModel(s);this.getView().setModel(a,"materialRequestDetailModel");a.refresh()},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var o=this.getView().getModel("materialRequestDetailModel");var a=o.getData().MATERIALREQLINESCollection;a.splice(s,1);o.setProperty("/MATERIALREQLINESCollection",a);o.refresh()},onSaveButtonClick:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.getView().getModel("materialRequestDetailModel");var i=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,data:s.getData()}),headers:{Authorization:"Bearer "+i},crossDomain:true,url:backendUrl+"materialRequest/saveMR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new o({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request saved"}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,i){t.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new o({type:u.Message,title:"Error",state:c.Error,content:new r({text:e.responseJSON.msg}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onResubmitButtonClick:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.getView().getModel("materialRequestDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"materialRequest/resubmitMR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new o({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request resubmitted"}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);g.setProperty("/editable",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,i){t.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new o({type:u.Message,title:"Error",state:c.Error,content:new r({text:e.responseJSON.msg}),beginButton:new a({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onBudgetChange:async function(e){var t=e.getSource(),s=t.getSelectedKey(),o=t.getValue();if(!s&&o){t.setValueState(c.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(c.None)}if(t.getValueState()==c.None){this.getView().byId("materialRequestPageID").setBusy(true);var a=this.getView().getModel("accounts");a.loadData(backendUrl+"coa/getCOAsByBudget?",{budgetCode:s,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});a.refresh();var i=parseInt(e.getParameters("selectedItem").value);var r=this.getView().getModel("budget");await r.loadData(backendUrl+"budget/getBudgetById",{code:i,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});r.refresh();this.getView().byId("materialRequestPageID").setBusy(false)}},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var o=e.getSource().getParent();o.getCells()[1].setSelectedKey("");o.getCells()[1].setBusy(true);o.getCells()[1].setEnabled(true);var a=this.getView().getModel("items");a.setSizeLimit(5e3);var i=a.getData();if(!(t in i)){var r=new s;r.setSizeLimit(5e3);await r.loadData(backendUrl+"items/getItemsByAccount",{accountCode:t,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=r.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.setSizeLimit(1e4);l.refresh()}o.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});o.getCells()[1].setBusy(false)},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}}})});